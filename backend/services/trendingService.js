/**
 * 新しい急上昇ランキング計算サービス
 */
const ViewAnalytics = require('../models/ViewAnalytics');
const Post = require('../models/Post');
const Good = require('../models/Good');
const TrendingRank = require('../models/TrendingRank');
const { client: redisClient } = require('../utils/redisClient');

// WASM計算エンジン
let trendCalculatorModule = null;
let wasmInitialized = false;

/**
 * WASM初期化
 */
async function initTrendingService() {
  if (wasmInitialized) return !wasmError;
  
  try {
    console.log('🚀 急上昇スコア計算エンジンを初期化...');
    const possiblePaths = [
      '../wasm/pkg/trend_calculator.js',
      './wasm/pkg/trend_calculator.js'
    ];
    
    let module = null;
    for (const path of possiblePaths) {
      try {
        module = await import(path);
        break;
      } catch (err) {
        continue;
      }
    }
    
    if (module && module.TrendCalculator) {
      trendCalculatorModule = module;
      wasmInitialized = true;
      console.log('✅ WASM急上昇計算エンジンが初期化されました');
      return true;
    }
  } catch (error) {
    console.error('❌ WASM初期化エラー (JavaScriptにフォールバック):', error);
  }
  
  wasmInitialized = true;
  return false;
}

/**
 * 全期間の急上昇ランキングを計算・保存
 */
async function calculateAndSaveAllRankings() {
  try {
    console.log('🔄 全期間の急上昇ランキング計算を開始...');
    
    const periods = ['daily', 'weekly', 'monthly', 'yearly'];
    const results = {};
    
    // 各期間を並列処理
    const promises = periods.map(period => 
      calculateAndSavePeriodRanking(period).catch(error => {
        console.error(`❌ ${period}ランキング計算エラー:`, error);
        return { period, success: false, error: error.message };
      })
    );
    
    const periodResults = await Promise.all(promises);
    
    // 結果をまとめる
    periodResults.forEach(result => {
      results[result.period] = result;
    });
    
    const successCount = periodResults.filter(r => r.success).length;
    console.log(`🏁 急上昇ランキング計算完了: 成功 ${successCount}/${periods.length}期間`);
    
    return {
      success: successCount > 0,
      results,
      totalPeriods: periods.length,
      successfulPeriods: successCount
    };
  } catch (error) {
    console.error('❌ 急上昇ランキング計算でエラー:', error);
    throw error;
  }
}

/**
 * 特定期間の急上昇ランキングを計算・保存
 */
async function calculateAndSavePeriodRanking(period) {
  const startTime = Date.now();
  console.log(`🔄 ${period}ランキング計算を開始...`);
  
  try {
    // 1. 対象投稿を効率的に取得（ViewAnalyticsがあるもののみ）
    const candidatePosts = await getCandidatePosts(period);
    console.log(`📊 ${period}: 候補投稿数 ${candidatePosts.length}件`);
    
    if (candidatePosts.length === 0) {
      console.log(`ℹ️ ${period}: 候補投稿がないため、空のランキングを保存`);
      await TrendingRank.updateRanking(period, []);
      return { period, success: true, count: 0, duration: Date.now() - startTime };
    }
    
    // 2. バッチでスコア計算
    const scoredPosts = await calculateScoresInBatch(candidatePosts, period);
    console.log(`✅ ${period}: ${scoredPosts.length}件のスコア計算完了`);
    
    // 3. 【重要】Postモデルのtrendingscoresフィールドも更新
    await updatePostTrendingScores(scoredPosts, period);
    console.log(`✅ ${period}: Postモデルのtrendingscoresフィールドを更新`);
    
    // 4. スコア順でソート（降順）
    scoredPosts.sort((a, b) => b.score - a.score);
    
    // 5. 上位1000件に絞る（パフォーマンス最適化）
    const topPosts = scoredPosts.slice(0, 1000);
    
    // 6. TrendingRankモデルに保存
    await TrendingRank.updateRanking(period, topPosts);
    
    const duration = Date.now() - startTime;
    console.log(`✅ ${period}ランキング保存完了: ${topPosts.length}件 (${duration}ms)`);
    
    return {
      period,
      success: true,
      count: topPosts.length,
      duration,
      topScore: topPosts.length > 0 ? topPosts[0].score : 0
    };
  } catch (error) {
    console.error(`❌ ${period}ランキング計算エラー:`, error);
    return {
      period,
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    };
  }
}

/**
 * 候補投稿を効率的に取得
 */
async function getCandidatePosts(period) {
  try {
    // 期間に応じた最低アクティビティ閾値を設定
    const thresholds = {
      'daily': new Date(Date.now() - 24 * 60 * 60 * 1000),
      'weekly': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      'monthly': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      'yearly': new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    };
    
    const since = thresholds[period];
    
    // ViewAnalyticsがあり、期間内にアクティビティがある投稿を取得
    const analytics = await ViewAnalytics.find({
      $or: [
        { 'packedViewData.timestamp': { $gte: since } },
        { 'timeWindows.startTime': { $gte: since } },
        { lastUpdated: { $gte: since } }
      ]
    }).select('postId').lean();
    
    const postIds = analytics.map(a => a.postId);
    
    if (postIds.length === 0) return [];
    
    // 投稿の基本情報とキャッシュ用データを一括取得
    const posts = await Post.find({ 
      _id: { $in: postIds },
      // 最低限のアクティビティがあるもののみ
      $or: [
        { viewCounter: { $gte: 1 } },
        { goodCounter: { $gte: 1 } },
        { bookShelfCounter: { $gte: 1 } }
      ]
    })
    .populate('author', 'nickname icon')
    .populate('series', 'title')
    .select('title description author series tags viewCounter goodCounter bookShelfCounter wordCount isAdultContent isAI isOriginal createdAt updatedAt')
    .lean();
    
    return posts;
  } catch (error) {
    console.error(`候補投稿取得エラー (${period}):`, error);
    return [];
  }
}

/**
 * バッチでスコア計算
 */
async function calculateScoresInBatch(posts, period) {
  const BATCH_SIZE = 50;
  const results = [];
  
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    
    const batchPromises = batch.map(post => 
      calculatePostScore(post, period).catch(error => {
        console.error(`投稿 ${post._id} のスコア計算エラー:`, error);
        return null;
      })
    );
    
    const batchResults = await Promise.all(batchPromises);
    
    // 成功した結果のみを追加
    results.push(...batchResults.filter(result => result !== null));
    
    // 進捗表示
    if (i % (BATCH_SIZE * 10) === 0) {
      console.log(`  進捗: ${Math.min(i + BATCH_SIZE, posts.length)}/${posts.length}`);
    }
  }
  
  return results;
}

/**
 * 単一投稿のスコア計算
 */
async function calculatePostScore(post, period) {
  try {
    // 1. 期間の開始・終了時刻を計算
    const { startTime, endTime } = getPeriodRange(period);
    
    // 2. ViewAnalyticsからデータを取得
    const analytics = await ViewAnalytics.findOne({ postId: post._id });
    
    let viewIncrease = 0;
    let uniqueUsers = 0;
    
    if (analytics) {
      // 期間内の集約データを取得
      const relevantWindows = analytics.timeWindows?.filter(window => 
        window.startTime >= startTime && window.endTime <= endTime
      ) || [];
      
      viewIncrease = relevantWindows.reduce((sum, w) => sum + (w.totalViews || 0), 0);
      uniqueUsers = relevantWindows.reduce((sum, w) => sum + (w.uniqueUsers || 0), 0);
      
      // 重複を考慮した補正
      uniqueUsers = Math.round(uniqueUsers * 0.8);
    }
    
    // 3. 期間内のいいね数増加を取得
    const likeIncrease = await Good.countDocuments({
      post: post._id,
      createdAt: { $gte: startTime, $lte: endTime }
    });
    
    // 4. コメント数増加を取得
    const commentIncrease = post.comments ? 
      post.comments.filter(c => c.createdAt >= startTime && c.createdAt <= endTime).length : 0;
    
    // 5. 前回の増加率を取得（簡易版）
    const previousIncreaseRate = await ViewAnalytics.getPreviousIncreaseRate(post._id, period) || 0.01;
    
    // 6. スコア計算（JavaScript版）
    const score = calculateScoreJS(period, {
      viewIncrease,
      uniqueUsers,
      likeIncrease,
      commentIncrease,
      bookmarkCount: post.bookShelfCounter || 0,
      previousIncreaseRate,
      post
    });
    
    // 7. キャッシュ用の投稿データを準備
    const cachedPostData = {
      title: post.title,
      description: post.description,
      authorId: post.author?._id,
      authorNickname: post.author?.nickname,
      authorIcon: post.author?.icon,
      seriesId: post.series?._id,
      seriesTitle: post.series?.title,
      tags: post.tags || [],
      isAdultContent: post.isAdultContent || false,
      isAI: post.isAI || true,
      isOriginal: post.isOriginal,
      viewCounter: post.viewCounter || 0,
      goodCounter: post.goodCounter || 0,
      bookShelfCounter: post.bookShelfCounter || 0,
      wordCount: post.wordCount || 0,
      createdAt: post.createdAt
    };
    
    // 8. 前回の増加率を更新
    if (viewIncrease > 0) {
      const periodHours = getPeriodHours(period);
      const currentIncreaseRate = viewIncrease / periodHours;
      ViewAnalytics.updatePreviousIncreaseRate(post._id, period, currentIncreaseRate).catch(() => {});
    }
    
    return {
      postId: post._id,
      score,
      metrics: {
        viewIncrease,
        likeIncrease,
        bookmarkIncrease: 0,
        commentIncrease,
        uniqueUsers,
        timeDecay: 1.0,
        momentumFactor: 1.0,
        diversityFactor: 1.0
      },
      cachedPostData
    };
  } catch (error) {
    console.error(`投稿 ${post._id} のスコア計算エラー:`, error);
    return null;
  }
}

/**
 * JavaScriptによるスコア計算
 */
function calculateScoreJS(period, data) {
  const { viewIncrease, uniqueUsers, likeIncrease, commentIncrease, bookmarkCount, previousIncreaseRate, post } = data;
  
  // 1. 基本スコア計算
  const baseScore = 
    (viewIncrease * 1.0) +
    (likeIncrease * 3.0) +
    (bookmarkCount * 5.0) +
    (commentIncrease * 2.0);
  
  // 2. 時間減衰係数
  const lastActivity = post.updatedAt || post.createdAt;
  const hoursElapsed = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
  const decayRates = { daily: 0.1, weekly: 0.05, monthly: 0.02, yearly: 0.005 };
  const timeDecay = Math.exp(-decayRates[period] * hoursElapsed);
  
  // 3. 勢い係数
  const periodHours = getPeriodHours(period);
  const currentIncreaseRate = viewIncrease / periodHours;
  const acceleration = currentIncreaseRate / Math.max(previousIncreaseRate, 0.01);
  const momentumWeights = { daily: 2.0, weekly: 1.5, monthly: 1.0, yearly: 0.5 };
  const momentumFactor = Math.min(Math.log10(acceleration + 1) * momentumWeights[period], 5);
  
  // 4. ユーザー多様性係数
  const totalViews = post.viewCounter || 1;
  const diversityRatio = uniqueUsers / totalViews;
  const diversityWeights = { daily: 1.5, weekly: 1.8, monthly: 2.0, yearly: 2.5 };
  const diversityFactor = 1 + (diversityRatio * diversityWeights[period]);
  
  // 5. 最終スコア
  const finalScore = baseScore * timeDecay * (1 + momentumFactor) * diversityFactor;
  
  return Math.round(finalScore * 100) / 100;
}

/**
 * PostモデルのtrendingScoresフィールドを更新
 * フロントエンドでの急上昇スコア表示用
 */
async function updatePostTrendingScores(scoredPosts, period) {
  try {
    const BATCH_SIZE = 100;
    let updateCount = 0;
    
    for (let i = 0; i < scoredPosts.length; i += BATCH_SIZE) {
      const batch = scoredPosts.slice(i, i + BATCH_SIZE);
      
      // バッチ内の投稿を並列更新
      const updatePromises = batch.map(async (scoredPost) => {
        try {
          const updateField = `trendingScores.${period}Score`;
          
          await Post.findByIdAndUpdate(
            scoredPost.postId,
            {
              $set: {
                [updateField]: scoredPost.score,
                'trendingScores.lastUpdated': new Date()
              }
            },
            { new: true }
          );
          
          return true;
        } catch (error) {
          console.error(`投稿 ${scoredPost.postId} のtrendingScores更新エラー:`, error);
          return false;
        }
      });
      
      const results = await Promise.all(updatePromises);
      updateCount += results.filter(Boolean).length;
      
      // 進捗表示
      if (i % (BATCH_SIZE * 5) === 0) {
        console.log(`  trendingScores更新進捗: ${Math.min(i + BATCH_SIZE, scoredPosts.length)}/${scoredPosts.length}`);
      }
    }
    
    console.log(`📊 ${period}: PostモデルのtrendingScores更新完了 (${updateCount}/${scoredPosts.length})`);
    return updateCount;
  } catch (error) {
    console.error(`❌ PostモデルのtrendingScores更新エラー (${period}):`, error);
    throw error;
  }
}

/**
 * レガシーサポート: 従来のAPIとの互換性のために単一投稿のスコア計算・更新も提供
 */
async function calculatePostTrendingScore(postId, period) {
  try {
    console.log(`🔄 単一投稿スコア計算: ${postId} (${period})`);
    
    // 1. 投稿データを取得
    const post = await Post.findById(postId)
      .populate('author', 'nickname icon')
      .populate('series', 'title')
      .lean();
    
    if (!post) {
      console.warn(`投稿 ${postId} が見つかりません`);
      return 0;
    }
    
    // 2. スコア計算
    const result = await calculatePostScore(post, period);
    
    if (!result) {
      console.warn(`投稿 ${postId} のスコア計算に失敗しました`);
      return 0;
    }
    
    // 3. Postモデルのtrendingscoresフィールドを更新
    const updateField = `trendingScores.${period}Score`;
    await Post.findByIdAndUpdate(
      postId,
      {
        $set: {
          [updateField]: result.score,
          'trendingScores.lastUpdated': new Date()
        }
      }
    );
    
    console.log(`✅ 投稿 ${postId} のスコア更新完了: ${result.score}`);
    return result.score;
  } catch (error) {
    console.error(`❌ 投稿 ${postId} の単一スコア計算エラー:`, error);
    return 0;
  }
}

/**
 * レガシーサポート: 全投稿のスコア計算（従来のcalculateAllTrendingScores互換）
 */
async function calculateAllTrendingScores() {
  try {
    console.log('🔄 全投稿の急上昇スコア計算を開始（レガシーモード）...');
    
    // 最適化版の全期間計算を実行
    const result = await calculateAndSaveAllRankings();
    
    // 従来のAPIと互換性のある形式で結果を返す
    const totalProcessed = Object.values(result.results).reduce((sum, r) => sum + (r.count || 0), 0);
    const totalSuccess = Object.values(result.results).filter(r => r.success).length;
    
    console.log(`✅ 全投稿の急上昇スコア計算完了（レガシーモード）: 成功 ${totalSuccess}/${result.totalPeriods}期間, 処理 ${totalProcessed}件`);
    
    return {
      processed: totalProcessed,
      success: totalProcessed // 従来のAPIでは成功件数も同じ値を返していた
    };
  } catch (error) {
    console.error('❌ 全投稿の急上昇スコア計算エラー（レガシーモード）:', error);
    return {
      processed: 0,
      success: 0
    };
  }
}

/**
 * PostモデルのtrendingScoresフィールドを更新
 * フロントエンドでの急上昇スコア表示用
 */
async function updatePostTrendingScores(scoredPosts, period) {
  try {
    const BATCH_SIZE = 100;
    let updateCount = 0;
    
    for (let i = 0; i < scoredPosts.length; i += BATCH_SIZE) {
      const batch = scoredPosts.slice(i, i + BATCH_SIZE);
      
      // バッチ内の投稿を並列更新
      const updatePromises = batch.map(async (scoredPost) => {
        try {
          const updateField = `trendingScores.${period}Score`;
          
          await Post.findByIdAndUpdate(
            scoredPost.postId,
            {
              $set: {
                [updateField]: scoredPost.score,
                'trendingScores.lastUpdated': new Date()
              }
            },
            { new: true }
          );
          
          return true;
        } catch (error) {
          console.error(`投稿 ${scoredPost.postId} のtrendingScores更新エラー:`, error);
          return false;
        }
      });
      
      const results = await Promise.all(updatePromises);
      updateCount += results.filter(Boolean).length;
      
      // 進捗表示
      if (i % (BATCH_SIZE * 5) === 0) {
        console.log(`  trendingScores更新進捗: ${Math.min(i + BATCH_SIZE, scoredPosts.length)}/${scoredPosts.length}`);
      }
    }
    
    console.log(`📊 ${period}: PostモデルのtrendingScores更新完了 (${updateCount}/${scoredPosts.length})`);
    return updateCount;
  } catch (error) {
    console.error(`❌ PostモデルのtrendingScores更新エラー (${period}):`, error);
    throw error;
  }
}

/**
 * 急上昇ランキングを超高速取得（フィルタリング対応）
 */
async function getTrendingRankings(period, page = 1, limit = 20, filters = {}) {
  try {
    console.log(`🔍 ${period}ランキングを高速取得中... (ページ${page}, 上限${limit}件)`);
    
    // キャッシュキーにフィルター情報を含める
    const cacheKey = `trending_fast:${period}:${page}:${limit}:${JSON.stringify(filters)}`;
    
    // Redisキャッシュをチェック
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`📦 ${period}ランキングをキャッシュから取得`);
      return JSON.parse(cachedData);
    }
    
    // TrendingRankモデルから超高速取得
    const result = await TrendingRank.getFilteredRanking(period, filters, page, limit);
    
    // 結果をフォーマット
    const formattedResult = {
      period,
      posts: result.posts.map(item => ({
        rank: item.rank,
        score: item.score,
        postId: item.postId,
        viewIncrease: item.metrics?.viewIncrease || 0,
        likeIncrease: item.metrics?.likeIncrease || 0,
        bookmarkIncrease: item.metrics?.bookmarkIncrease || 0,
        commentIncrease: item.metrics?.commentIncrease || 0,
        uniqueUserData: {
          count: item.metrics?.uniqueUsers || 0,
          ratio: 0
        },
        accelerationData: {
          current: 0,
          previous: 0
        },
        post: item.cachedPostData
      })),
      totalCount: result.totalCount,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      filters,
      lastUpdated: result.lastUpdated
    };
    
    // Redisにキャッシュ（5分間）
    await redisClient.set(cacheKey, JSON.stringify(formattedResult), 'EX', 300);
    
    console.log(`✅ ${period}ランキング取得完了: ${formattedResult.posts.length}件`);
    return formattedResult;
  } catch (error) {
    console.error(`❌ ${period}ランキングの取得中にエラーが発生しました:`, error);
    return { 
      posts: [], 
      totalCount: 0, 
      page, 
      limit,
      totalPages: 0,
      filters,
      lastUpdated: null
    };
  }
}

/**
 * ユーティリティ関数群
 */
function getPeriodRange(period) {
  const endTime = new Date();
  const startTime = new Date();
  
  switch (period) {
    case 'daily':
      startTime.setDate(startTime.getDate() - 1);
      break;
    case 'weekly':
      startTime.setDate(startTime.getDate() - 7);
      break;
    case 'monthly':
      startTime.setDate(startTime.getDate() - 30);
      break;
    case 'yearly':
      startTime.setDate(startTime.getDate() - 365);
      break;
  }
  
  return { startTime, endTime };
}

function getPeriodHours(period) {
  switch (period) {
    case 'daily': return 24;
    case 'weekly': return 24 * 7;
    case 'monthly': return 24 * 30;
    case 'yearly': return 24 * 365;
    default: return 24;
  }
}

module.exports = {
  initTrendingService,
  calculateAndSaveAllRankings,
  calculateAndSavePeriodRanking,
  getTrendingRankings,
  // レガシーサポート関数
  calculatePostTrendingScore,
  calculateAllTrendingScores
};