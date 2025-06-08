// backend/jobs/initializeTrendingRanks.js
const Post = require('../models/Post');
const TrendingRank = require('../models/TrendingRank');
const { calculateTrendingScore, adjustParametersByPeriod } = require('./trendingRankingJob');

// サーバー起動時に既存データで急上昇ランキングを初期化
const initializeTrendingRanks = async () => {
  console.log('[INIT] Starting trending ranks initialization...');
  const startTime = Date.now();
  
  try {
    const periods = ['day', 'week', 'month', 'year'];
    const now = new Date();
    
    for (const periodType of periods) {
      console.log(`[INIT] Processing ${periodType} period...`);
      
      // 既存のランキングをチェック
      const existingRank = await TrendingRank.findOne({ period: periodType });
      
      if (!existingRank) {
        // ランキングが存在しない場合は空の初期データを作成
        await TrendingRank.create({
          period: periodType,
          posts: [],
          lastUpdated: now
        });
        console.log(`[INIT] Created initial trending rank for ${periodType}`);
      } else {
        console.log(`[INIT] Trending rank already exists for ${periodType}`);
      }
    }
    
    const endTime = Date.now();
    console.log(`[INIT] Trending ranks initialized successfully in ${(endTime - startTime) / 1000}s`);
  } catch (error) {
    console.error('[INIT] Error in initialization:', error);
  }
};

module.exports = initializeTrendingRanks;