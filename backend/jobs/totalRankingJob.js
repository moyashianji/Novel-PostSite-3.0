// backend/jobs/totalRankingJob.js
const cron = require('node-cron');
const Post = require('../models/Post');
const Series = require('../models/Series');
const ViewAnalytics = require('../models/ViewAnalytics');
const TotalRank = require('../models/TotalRank');
const TotalSeriesRank = require('../models/TotalSeriesRank');
const { client: redisClient } = require('../utils/redisClient');
const { calculateTotalScore } = require('../utils/totalPostRankingCalculator');
const { calculateTotalSeriesScore } = require('../utils/totalSeriesRankingCalculator');

// 総合ランキングの計算を実行する関数
const calculateTotalRankings = async () => {
  console.log('[TOTAL RANKING] Starting total ranking calculation');
  const startTime = Date.now();
  
  try {
    // 作品の総合ランキング計算
    await calculatePostTotalRanking();
    
    // シリーズの総合ランキング計算
    await calculateSeriesTotalRanking();
    
    const endTime = Date.now();
    console.log(`[TOTAL RANKING] Completed in ${(endTime - startTime) / 1000}s`);
  } catch (error) {
    console.error('[TOTAL RANKING] Error in ranking calculation:', error);
  }
};

// 作品の総合ランキング計算
const calculatePostTotalRanking = async () => {
  try {
    // すべての作品を取得
    const posts = await Post.find({}).lean();
    console.log(`[TOTAL RANKING] Processing ${posts.length} posts for total ranking`);
    
    // 各作品のスコアを計算
    const rankedPosts = await Promise.all(posts.map(async (post) => {
      try {
        // 閲覧分析データを取得
        const viewData = await ViewAnalytics.findOne({ postId: post._id });
        
        // 総合スコアを計算
        const scoreData = calculateTotalScore(post, viewData);
        
        if (scoreData.totalScore <= 0) return null;
        
        return {
          postId: post._id,
          score: scoreData.totalScore,
          metrics: scoreData.metrics
        };
      } catch (error) {
        console.error(`[TOTAL RANKING] Error calculating score for post ${post._id}:`, error);
        return null;
      }
    }));
    
    // nullを除外し、スコアで降順にソート
    const validRankedPosts = rankedPosts
      .filter(post => post !== null)
      .sort((a, b) => b.score - a.score);
    
    // 上位100件を保存
    const topPosts = validRankedPosts.slice(0, 100);
    
    // データベースに保存
    await TotalRank.findOneAndUpdate(
      {},
      {
        posts: topPosts,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    // Redisにキャッシュ
    const cacheKey = 'total:posts';
    await redisClient.set(cacheKey, JSON.stringify(topPosts), { EX: 7200 }); // 2時間キャッシュ
    
    console.log(`[TOTAL RANKING] Saved ${topPosts.length} posts to total ranking`);
    return topPosts;
  } catch (error) {
    console.error('[TOTAL RANKING] Error in post total ranking:', error);
    throw error;
  }
};

// シリーズの総合ランキング計算
const calculateSeriesTotalRanking = async () => {
  try {
    // すべてのシリーズを取得（作品情報を含む）
    const allSeries = await Series.find()
      .populate({
        path: 'posts.postId',
        select: 'comments goodCounter bookShelfCounter viewCounter'
      })
      .lean();
    
    console.log(`[TOTAL RANKING] Processing ${allSeries.length} series for total ranking`);
    
    // 作品の総合スコアを事前計算（重複計算を避けるため）
    const postScores = new Map();
    for (const series of allSeries) {
      if (!series.posts || series.posts.length === 0) continue;
      
      for (const post of series.posts) {
        if (!post.postId) continue;
        
        if (!postScores.has(post.postId._id.toString())) {
          const viewData = await ViewAnalytics.findOne({ postId: post.postId._id });
          const scoreData = calculateTotalScore(post.postId, viewData);
          postScores.set(post.postId._id.toString(), scoreData.totalScore);
        }
      }
    }
    
    // 各シリーズのスコアを計算
    const rankedSeries = await Promise.all(allSeries.map(async (series) => {
      try {
        if (!series.posts || series.posts.length === 0) return null;
        
        // シリーズ内の作品の平均スコアを計算
        let totalScore = 0;
        let validPostCount = 0;
        
        for (const post of series.posts) {
          if (!post.postId) continue;
          
          const postScore = postScores.get(post.postId._id.toString()) || 0;
          if (postScore > 0) {
            totalScore += postScore;
            validPostCount++;
          }
        }
        
        const averagePostScore = validPostCount > 0 ? totalScore / validPostCount : 0;
        
        // シリーズの総合スコアを計算
        const scoreData = calculateTotalSeriesScore(series, averagePostScore);
        
        if (scoreData.totalScore <= 0) return null;
        
        return {
          seriesId: series._id,
          score: scoreData.totalScore,
          metrics: scoreData.metrics,
          episodeCount: series.posts.length,
          followerCount: series.followerCount,
          isCompleted: series.isCompleted
        };
      } catch (error) {
        console.error(`[TOTAL RANKING] Error calculating score for series ${series._id}:`, error);
        return null;
      }
    }));
    
    // nullを除外し、スコアで降順にソート
    const validRankedSeries = rankedSeries
      .filter(series => series !== null)
      .sort((a, b) => b.score - a.score);
    
    // 上位100件を保存
    const topSeries = validRankedSeries.slice(0, 100);
    
    // データベースに保存
    await TotalSeriesRank.findOneAndUpdate(
      {},
      {
        series: topSeries,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    // Redisにキャッシュ
    const cacheKey = 'total:series';
    await redisClient.set(cacheKey, JSON.stringify(topSeries), { EX: 7200 }); // 2時間キャッシュ
    
    console.log(`[TOTAL RANKING] Saved ${topSeries.length} series to total ranking`);
    return topSeries;
  } catch (error) {
    console.error('[TOTAL RANKING] Error in series total ranking:', error);
    throw error;
  }
};

// 日次で実行するCronジョブ（毎日午前3時に実行）
cron.schedule('*/1 * * * *', calculateTotalRankings);

// 初回起動時に実行
calculateTotalRankings();

module.exports = {
  calculateTotalRankings,
  calculatePostTotalRanking,
  calculateSeriesTotalRanking
};