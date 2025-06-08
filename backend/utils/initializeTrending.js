// backend/utils/initializeTrending.js
const Post = require('../models/Post');
const TrendingRank = require('../models/TrendingRank');
const ViewAnalytics = require('../models/ViewAnalytics');
const { client: redisClient } = require('../utils/redisClient');
const { v4: uuidv4 } = require('uuid');

// ViewAnalyticsデータの初期化
const initializeViewAnalytics = async () => {
  console.log('[INIT] Starting ViewAnalytics initialization...');
  
  try {
    // uniqueViewersフィールドがない、または空のViewAnalyticsを検索
    const incompleteAnalytics = await ViewAnalytics.find({
      $or: [
        { uniqueViewers: { $exists: false } },
        { uniqueViewers: { $size: 0 } }
      ]
    });
    
    console.log(`[INIT] Found ${incompleteAnalytics.length} ViewAnalytics entries to update`);
    
    for (const analytics of incompleteAnalytics) {
      // 投稿データを取得
      const post = await Post.findById(analytics.postId);
      if (!post) continue;
      
      // uniqueViewers配列を初期化
      if (!analytics.uniqueViewers) {
        analytics.uniqueViewers = [];
      }
      
      // 既存のviews配列から適当なデータを生成
      if (analytics.views && analytics.views.length > 0) {
        // ユニークビューアーを追加（実際のビュー数の50%程度に設定）
        const uniqueViewerCount = Math.max(1, Math.floor(post.viewCounter * 0.5));
        
        for (let i = 0; i < uniqueViewerCount; i++) {
          // UUIDを生成してidentifierとして使用
          const identifier = uuidv4();
          
          // タイムスタンプを適当に分散（過去30日間）
          const randomDays = Math.floor(Math.random() * 30);
          const randomTimestamp = new Date();
          randomTimestamp.setDate(randomTimestamp.getDate() - randomDays);
          
          analytics.uniqueViewers.push({
            identifier: identifier,
            timestamp: randomTimestamp
          });
        }
      }
      
      await analytics.save();
      console.log(`[INIT] Updated ViewAnalytics for post ${analytics.postId}`);
    }
    
    console.log('[INIT] ViewAnalytics initialization completed');
  } catch (error) {
    console.error('[INIT] Error initializing ViewAnalytics:', error);
    throw error;
  }
};

// 急上昇ランキングの初期化
const initializeTrendingRanks = async () => {
  console.log('[INIT] Starting initial trending rank calculation...');
  
  const { calculateTrendingScore, adjustParametersByPeriod } = require('../utils/trendingCalculator');
  
  try {
    const periods = ['day', 'week', 'month', 'year'];
    
    for (const periodType of periods) {
      console.log(`[INIT] Calculating initial ranks for ${periodType}`);
      
      const posts = await Post.find({}).lean();
      const trendingPosts = [];
      
      for (const post of posts) {
        try {
          // モックデータを生成（初期化時用）
          const mockData = {
            viewIncrease: Math.min(post.viewCounter || 0, 100), // 最大100まで
            likeIncrease: Math.min(post.goodCounter || 0, 50),  // 最大50まで
            bookmarkCount: post.bookShelfCounter || 0,
            commentIncrease: Math.min(post.comments?.length || 0, 20), // 最大20まで
            uniqueUserCount: Math.max(1, Math.floor((post.viewCounter || 0) * 0.5)),
            totalInteractions: post.viewCounter?.length || 0,
            lastActivityTimestamp: post.updatedAt || post.createdAt,
            updatedAt: post.updatedAt
          };
          
          const score = calculateTrendingScore(mockData, periodType);
          
          if (score > 0) {
            trendingPosts.push({
              postId: post._id,
              score,
              ...mockData
            });
          }
        } catch (error) {
          console.error(`[INIT] Error calculating score for post ${post._id}:`, error);
        }
      }
      
      // スコア順にソート
      trendingPosts.sort((a, b) => b.score - a.score);
      const topPosts = trendingPosts.slice(0, 50);
      
      // DBに保存
      await TrendingRank.findOneAndUpdate(
        { period: periodType },
        { posts: topPosts, lastUpdated: new Date() },
        { upsert: true }
      );
      
      // Redisにキャッシュ
      const cacheKey = `trending:${periodType}`;
      await redisClient.set(cacheKey, JSON.stringify(topPosts), { EX: 3600 });
      
      console.log(`[INIT] Initialized ${topPosts.length} posts for ${periodType}`);
    }
    
    console.log('[INIT] Initial trending rank calculation completed');
  } catch (error) {
    console.error('[INIT] Error initializing trending ranks:', error);
    throw error;
  }
};

// メイン初期化関数
const initializeSystem = async () => {
  console.log('[INIT] ===== Starting System Initialization =====');
  
  try {
    // Redis接続を確保
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    
    // ViewAnalyticsの初期化
    await initializeViewAnalytics();
    
    // 急上昇ランキングの初期化
    await initializeTrendingRanks();
    
    console.log('[INIT] ===== System Initialization Complete =====');
  } catch (error) {
    console.error('[INIT] Error during system initialization:', error);
    throw error;
  }
};

module.exports = {
  initializeViewAnalytics,
  initializeTrendingRanks,
  initializeSystem
};