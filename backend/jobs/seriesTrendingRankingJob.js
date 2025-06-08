// backend/jobs/seriesTrendingRankingJob.js
const cron = require('node-cron');
const Series = require('../models/Series');
const SeriesTrendingRank = require('../models/SeriesTrendingRank');
const SeriesFollowerHistory = require('../models/SeriesFollowerHistory');
const { client: redisClient } = require('../utils/redisClient');
const { 
  calculateSeriesTrendingScore, 
  adjustParametersByPeriod,
  getFollowerIncrease,
  getEpisodeAverageScore,
  getPreviousStats,
  getSeriesLastActivity
} = require('../utils/seriesTrendingCalculator');

// シリーズの急上昇ランキングを計算する関数
const calculateTrendingRankForPeriod = async (periodType) => {
  console.log(`[SERIES TRENDING] Processing ${periodType} period`);
  
  const params = adjustParametersByPeriod(periodType);
  
  try {
    // すべてのシリーズを取得
    const allSeries = await Series.find()
      .populate({
        path: 'posts.postId',
        select: 'trendingScores'
      })
      .lean();
    
    console.log(`[SERIES TRENDING] Found ${allSeries.length} series to check for ${periodType}`);
    
    const trendingSeries = await Promise.all(allSeries.map(async (series) => {
      try {
        // シリーズに作品がない場合はスキップ
        if (!series.posts || series.posts.length === 0) {
          return null;
        }
        
        // エピソードの平均スコアを取得
        const episodeAverageScore = getEpisodeAverageScore(series, periodType);
        
        // フォロワー増加数を取得
        const followerIncrease = await getFollowerIncrease(series._id, periodType);
        
        // フォロワー履歴からデータを取得
        const recentHistory = await SeriesFollowerHistory.findOne({
          seriesId: series._id
        }).sort({ timestamp: -1 });
        
        // いずれのスコアも0の場合はスキップ
        if (episodeAverageScore === 0 && followerIncrease === 0) {
          return null;
        }
        
        // 前回の統計データを取得
        const prevStats = await getPreviousStats(series._id, periodType);
        
        // 最後の活動タイムスタンプを取得
        const lastActivityTimestamp = await getSeriesLastActivity(series._id);
        
        // トレンディングスコアデータを準備
        const seriesData = {
          episodeAverageScore,
          followerIncrease,
          episodeCount: series.posts.length,
          lastActivityTimestamp,
          updatedAt: series.updatedAt,
          previousStats: prevStats
        };
        
        // トレンディングスコアを計算
        const score = calculateSeriesTrendingScore(seriesData, periodType);
        
        // 現在の統計データを保存
        const statsKey = `prev_stats:series:${series._id}:${periodType}`;
        const currentStats = {
          followerCount: series.followerCount,
          followerRate: followerIncrease / params.hours,
          totalScore: score
        };
        await redisClient.set(statsKey, JSON.stringify(currentStats), { EX: 86400 * 8 });
        
        return {
          seriesId: series._id,
          score,
          episodeAverageScore,
          followerIncrease,
          episodeCount: series.posts.length,
          lastActivityTimestamp
        };
      } catch (error) {
        console.error(`[SERIES TRENDING] Error processing series ${series._id}:`, error);
        return null;
      }
    }));
    
    // スコアでソート
    const validSeries = trendingSeries
      .filter(s => s !== null && s.score > 0)
      .sort((a, b) => b.score - a.score);
    
    // 上位50シリーズを取得
    const topSeries = validSeries.slice(0, 50);
    
    console.log(`[SERIES TRENDING] Saving ${topSeries.length} trending series for ${periodType}`);
    
    // データベースに保存
    await SeriesTrendingRank.findOneAndUpdate(
      { period: periodType },
      {
        series: topSeries,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    // Redisにキャッシュ
    const cacheKey = `trending:series:${periodType}`;
    await redisClient.set(cacheKey, JSON.stringify(topSeries), { EX: 3600 });
    
    return topSeries;
  } catch (error) {
    console.error(`[SERIES TRENDING] Error in ${periodType} calculation:`, error);
    throw error;
  }
};

// メインのCronジョブ
cron.schedule('*/1 * * * *', async () => {
  console.log('[SERIES TRENDING JOB] Starting series trending ranking calculation');
  const startTime = Date.now();
  
  try {
    const periods = ['daily', 'weekly', 'monthly', 'yearly', 'cumulative'];
    
    for (const periodType of periods) {
      await calculateTrendingRankForPeriod(periodType);
    }
    
    const endTime = Date.now();
    console.log(`[SERIES TRENDING JOB] Completed in ${(endTime - startTime) / 1000}s`);
  } catch (error) {
    console.error('[SERIES TRENDING JOB] Error in main job:', error);
  }
});

// 手動でランキングを再計算するためのエクスポート
module.exports = {
  calculateTrendingRankForPeriod
};