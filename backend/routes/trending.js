// backend/routes/trending.js

const express = require('express');
const router = express.Router();
const TrendingRank = require('../models/TrendingRank');
const SeriesTrendingRank = require('../models/SeriesTrendingRank');
const Post = require('../models/Post');
const Series = require('../models/Series');
const { client: redisClient } = require('../utils/redisClient');
const trendingService = require('../services/trendingService');
const trendingJob = require('../jobs/trendingRankingJob');
const authenticateToken = require('../middlewares/authenticateToken');

// 期間のマッピング
const periodMap = {
  'day': 'daily',
  'week': 'weekly',
  'month': 'monthly',
  'year': 'yearly',
  'cumulative': 'cumulative'
};
const validGenres = [
  'すべて', '異世界', '恋愛', 'ラブコメ', '歴史', '時代物', 'ローファンタジー', 
  'ハイファンタジー', 'SF', 'ファンタジー', 'ミステリー', 'サスペンス', 'ホラー', 
  'コメディ', '日常', '青春', 'スポーツ', '学園', '職業', 'バトル', '冒険', 'アクション'
];
router.get('/genres', async (req, res) => {
  try {
    res.json({ genres: validGenres });
  } catch (error) {
    console.error('[TRENDING API] Error fetching genres:', error);
    res.status(500).json({ message: 'ジャンルリストの取得に失敗しました' });
  }
});

// 累計ランキングエンドポイント - フィルタリング機能を追加
router.get('/cumulative', async (req, res) => {
  try {
    const { 
      limit = 10, 
      page = 1,
      ageFilter = 'all',     // 年齢制限フィルター追加
      contentType = 'all',   // 作品タイプフィルター追加
      genre = 'すべて'        // ジャンルフィルター追加
    } = req.query;
    
    const limitNum = Math.min(parseInt(limit), 50);
    const pageNum = Math.max(parseInt(page), 1);
    
    // キャッシュキーにフィルターパラメータを含める
    const cacheKey = `trending:cumulative:page:${pageNum}:limit:${limitNum}:ageFilter:${ageFilter}:contentType:${contentType}:genre:${encodeURIComponent(genre)}`;
    const cachedData = await redisClient.get(cacheKey);
    
    let posts;
    if (cachedData) {
      console.log(`[TRENDING API] Using cached data for cumulative ranking with filters`);
      posts = JSON.parse(cachedData);
    } else {
      console.log(`[TRENDING API] Fetching cumulative ranking with filters from DB`);
      
      // まず、ソート済みのデータ一覧を取得
      let allPosts = await Post.find({})
        .sort({ 'trendingScores.totalScore': -1 })
        .limit(1000) // 多めに取得してフィルタリング後に上位50件に絞る
        .populate('author', 'nickname icon')
        .populate('series', 'title _id')
        .lean();
      
      // フィルタリング処理を適用
      
      // 1. 年齢制限フィルター
      if (ageFilter !== 'all') {
        console.log(`[TRENDING API] Filtering cumulative by age: ${ageFilter}`);
        allPosts = allPosts.filter(post => {
          if (ageFilter === 'r18') {
            return post.isAdultContent === true;
          } else if (ageFilter === 'general') { // 全年齢
            return post.isAdultContent === false;
          }
          return true;
        });
      }
      
      // 2. 作品タイプフィルター
      if (contentType !== 'all') {
        console.log(`[TRENDING API] Filtering cumulative by content type: ${contentType}`);
        allPosts = allPosts.filter(post => {
          if (contentType === 'series') {
            return post.series != null;
          } else if (contentType === 'standalone') {
            return post.series == null;
          }
          return true;
        });
      }
      
      // 3. ジャンルフィルター
      if (genre !== 'すべて') {
        console.log(`[TRENDING API] Filtering cumulative by genre: ${genre}`);
        allPosts = allPosts.filter(post => {
          return post.tags && post.tags.includes(genre);
        });
      }
      
      // フィルタリング後、最大50件に絞る
      posts = allPosts.slice(0, 50);
      
      // キャッシュに保存（5分間）
      await redisClient.set(cacheKey, JSON.stringify(posts), { EX: 300 });
    }
    
    // ページネーション
    const skip = (pageNum - 1) * limitNum;
    const totalCount = posts.length;
    const paginatedPosts = posts.slice(skip, skip + limitNum);
    
    // ランク情報を追加
    const rankedPosts = paginatedPosts.map((post, index) => ({
      rank: skip + index + 1,
      score: post.trendingScores?.totalScore || 0,
      postId: post._id,
      post,
      uniqueUserCount: null,
      accelerationData: null
    }));
    
    res.json({
      period: 'cumulative',
      posts: rankedPosts,
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
      filters: {
        ageFilter,
        contentType,
        genre
      }
    });
  } catch (error) {
    console.error('[TRENDING API] Error fetching cumulative ranking:', error);
    res.status(500).json({ message: 'ランキングの取得に失敗しました' });
  }
});

router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    // 管理者権限チェック
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: '管理者権限が必要です' });
    }
    
    const initializeTrendingRanks = require('../jobs/initializeTrendingRanks');
    await initializeTrendingRanks();
    
    res.json({ message: 'ランキングの初期化が完了しました' });
  } catch (error) {
    console.error('[TRENDING API] Error initializing:', error);
    res.status(500).json({ message: 'ランキングの初期化に失敗しました' });
  }
});

// シリーズランキングエンドポイント
router.get('/series/:period', async (req, res) => {
  try {
    const { period } = req.params;
    const { 
      limit = 10, 
      page = 1,
      status = 'all', // すべて/連載中/完結済
      genre = 'すべて', // ジャンル
      ageFilter = 'all' // 年齢制限フィルター
    } = req.query;
    
    const validPeriods = ['day', 'week', 'month', 'year', 'cumulative'];
    
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ 
        message: '無効な期間パラメータです。day, week, month, year, cumulativeのいずれかを指定してください。' 
      });
    }
    
    // レスポンスの雛形を用意
    return res.json({
      period,
      type: 'series',
      series: [],
      totalCount: 0,
      page: 1,
      limit: parseInt(limit),
      totalPages: 0,
      filters: {
        status,
        genre,
        ageFilter
      },
      message: 'シリーズランキングは現在実装中です'
    });
  } catch (error) {
    console.error('[TRENDING API] Error fetching series ranking:', error);
    res.status(500).json({ message: 'ランキングの取得に失敗しました' });
  }
});

// WASMシステムの状態チェックエンドポイント（管理者用）
router.get('/system/status', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: '管理者権限が必要です' });
    }
    
    const status = await trendingJob.checkWasmAvailability();
    
    res.json({
      wasm: status,
      redis: redisClient.status || 'unknown',
      lastUpdated: {
        day: await getLastUpdateTime('day'),
        week: await getLastUpdateTime('week'),
        month: await getLastUpdateTime('month'),
        year: await getLastUpdateTime('year'),
        cumulative: await getLastUpdateTime('cumulative')
      }
    });
  } catch (error) {
    console.error('[TRENDING API] Error checking system status:', error);
    res.status(500).json({ message: 'システム状態の確認に失敗しました' });
  }
});
// 手動でランキングを再計算するエンドポイント（管理者用）
router.post('/recalculate/:period', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: '管理者権限が必要です' });
    }
    
    const { period } = req.params;
    const validPeriods = ['day', 'week', 'month', 'year', 'cumulative'];
    
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ message: '無効な期間です' });
    }
    
    const result = await trendingJob.recalculateTrendingRanking(period);
    
    res.json({ 
      message: `${period}期間のランキングを再計算しました`,
      count: result.length
    });
  } catch (error) {
    console.error('[TRENDING API] Error recalculating:', error);
    res.status(500).json({ message: 'ランキングの再計算に失敗しました' });
  }
});


// 最終更新時間を取得
async function getLastUpdateTime(period) {
  try {
    const ranking = await TrendingRank.findOne({ period })
      .select('lastUpdated')
      .lean();
    
    return ranking ? ranking.lastUpdated : null;
  } catch (error) {
    console.error(`Error getting last update time for ${period}:`, error);
    return null;
  }
}

// シリーズのランキング再計算エンドポイント
router.post('/recalculate-series/:period', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: '管理者権限が必要です' });
    }
    
    const { period } = req.params;
    const validPeriods = ['day', 'week', 'month', 'year', 'cumulative'];
    
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ message: '無効な期間です' });
    }
    
    const dbPeriod = periodMap[period];
    const { calculateTrendingRankForPeriod } = require('../jobs/seriesTrendingRankingJob');
    await calculateTrendingRankForPeriod(dbPeriod);
    
    res.json({ message: `シリーズの${period}期間ランキングを再計算しました` });
  } catch (error) {
    console.error('[TRENDING API] Error recalculating series:', error);
    res.status(500).json({ message: 'ランキングの再計算に失敗しました' });
  }
});
// 急上昇ランキングを取得（統一版 - 超高速）
router.get('/:period', async (req, res) => {
  try {
    const { period } = req.params;
    const { 
      limit = 20, 
      page = 1, 
      ageFilter = 'all',
      contentType = 'all',
      genre = 'すべて'
    } = req.query;
    
    // 有効な期間チェック
    const validPeriods = ['day', 'week', 'month', 'year', 'cumulative'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ 
        message: '無効な期間パラメータです。day, week, month, year, cumulativeのいずれかを指定してください。' 
      });
    }
    
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const pageNum = Math.max(parseInt(page) || 1, 1);
    
    // 期間名を正規化（day -> daily）
    let normalizedPeriod = period;
    if (period === 'day') normalizedPeriod = 'daily';
    else if (period === 'week') normalizedPeriod = 'weekly';
    else if (period === 'month') normalizedPeriod = 'monthly';
    else if (period === 'year') normalizedPeriod = 'yearly';
    
    // cumulative（累計）の場合の特別処理
    if (period === 'cumulative') {
      // 従来のPostモデルからのtotalScoreベースの累計ランキング
      return await handleCumulativeRanking(req, res, limitNum, pageNum, ageFilter, contentType, genre);
    }
    
    // フィルターオブジェクトを作成
    const filters = {
      ageFilter,
      contentType,
      genre
    };
    
    console.log(`[TRENDING API] ${normalizedPeriod}ランキング取得: ${JSON.stringify(filters)}`);
    
    // 最適化されたサービスから超高速取得
    const result = await trendingService.getTrendingRankings(
      normalizedPeriod, 
      pageNum, 
      limitNum, 
      filters
    );
    
    // レスポンス形式を統一
    const response = {
      period,
      posts: result.posts,
      totalCount: result.totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: result.totalPages,
      filters: {
        ageFilter,
        contentType,
        genre
      },
      lastUpdated: result.lastUpdated,
      performance: {
        cached: !!result.cached,
        source: 'TrendingRank'
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('[TRENDING API] Error fetching trending:', error);
    res.status(500).json({ message: 'ランキングの取得に失敗しました' });
  }
});

// 累計ランキングの処理（従来の方式）
async function handleCumulativeRanking(req, res, limitNum, pageNum, ageFilter, contentType, genre) {
  try {
    const { client: redisClient } = require('../utils/redisClient');
    const Post = require('../models/Post');
    
    // キャッシュキーにフィルターパラメータを含める
    const cacheKey = `trending:cumulative:page:${pageNum}:limit:${limitNum}:ageFilter:${ageFilter}:contentType:${contentType}:genre:${encodeURIComponent(genre)}`;
    const cachedData = await redisClient.get(cacheKey);
    
    let posts;
    if (cachedData) {
      console.log(`[TRENDING API] 累計ランキングをキャッシュから取得`);
      posts = JSON.parse(cachedData);
    } else {
      console.log(`[TRENDING API] 累計ランキングをDBから取得`);
      
      // フィルター条件を構築
      let filter = { 'trendingScores.totalScore': { $gt: 0 } };
      
      // 年齢制限フィルター
      if (ageFilter !== 'all') {
        if (ageFilter === 'r18') {
          filter.isAdultContent = true;
        } else if (ageFilter === 'general') {
          filter.isAdultContent = false;
        }
      }
      
      // 作品タイプフィルター
      if (contentType !== 'all') {
        if (contentType === 'series') {
          filter.series = { $ne: null };
        } else if (contentType === 'standalone') {
          filter.series = null;
        }
      }
      
      // ジャンルフィルター
      if (genre !== 'すべて') {
        filter.tags = genre;
      }
      
      // 最大1000件取得してフィルタリング
      const allPosts = await Post.find(filter)
        .sort({ 'trendingScores.totalScore': -1 })
        .limit(1000)
        .populate('author', 'nickname icon')
        .populate('series', 'title _id')
        .lean();
      
      posts = allPosts.slice(0, 100); // 上位100件に制限
      
      // キャッシュに保存（10分間）
      await redisClient.set(cacheKey, JSON.stringify(posts), 'EX', 600);
    }
    
    // ページネーション
    const skip = (pageNum - 1) * limitNum;
    const totalCount = posts.length;
    const paginatedPosts = posts.slice(skip, skip + limitNum);
    
    // ランク情報を追加
    const rankedPosts = paginatedPosts.map((post, index) => ({
      rank: skip + index + 1,
      score: post.trendingScores?.totalScore || 0,
      postId: post._id,
      viewIncrease: 0,
      likeIncrease: 0,
      bookmarkIncrease: 0,
      commentIncrease: 0,
      uniqueUserData: { count: 0, ratio: 0 },
      accelerationData: { current: 0, previous: 0 },
      post: {
        _id: post._id,
        title: post.title,
        description: post.description,
        author: post.author,
        series: post.series,
        tags: post.tags || [],
        viewCounter: post.viewCounter || 0,
        goodCounter: post.goodCounter || 0,
        bookShelfCounter: post.bookShelfCounter || 0,
        wordCount: post.wordCount || 0,
        isAdultContent: post.isAdultContent || false,
        isAI: post.isAI || true,
        isOriginal: post.isOriginal,
        createdAt: post.createdAt
      }
    }));
    
    res.json({
      period: 'cumulative',
      posts: rankedPosts,
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
      filters: { ageFilter, contentType, genre },
      performance: {
        cached: !!cachedData,
        source: 'Post.trendingScores.totalScore'
      }
    });
  } catch (error) {
    console.error('[TRENDING API] Error fetching cumulative ranking:', error);
    res.status(500).json({ message: '累計ランキングの取得に失敗しました' });
  }
}

// 手動で急上昇スコア再計算（管理者専用）
router.post('/recalculate', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: '管理者権限が必要です' });
    }
    
    const trendingJob = require('../jobs/newTrendingJob');
    const success = await trendingJob.manualCalculation();
    
    if (success) {
      res.json({ message: '急上昇スコアの再計算が開始されました' });
    } else {
      res.status(400).json({ message: '再計算は既に実行中です' });
    }
  } catch (error) {
    console.error('[NEW TRENDING] Error recalculating:', error);
    res.status(500).json({ message: '再計算の開始に失敗しました' });
  }
});


module.exports = router;