// backend/routes/totalRanking.js
const express = require('express');
const router = express.Router();
const TotalRank = require('../models/TotalRank');
const TotalSeriesRank = require('../models/TotalSeriesRank');
const Post = require('../models/Post');
const Series = require('../models/Series');
const { client: redisClient } = require('../utils/redisClient');

// 作品の総合ランキングを取得するエンドポイント
router.get('/posts', async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const limitNum = Math.min(parseInt(limit), 10); // 1ページ最大10件
        const pageNum = Math.max(parseInt(page), 1);
        const skip = (pageNum - 1) * limitNum;
        
        // 総合カウントを最大50件に制限
        const query = { rankingScore: { $gt: 0 } };
        const totalCount = Math.min(await Post.countDocuments(query), 50);
        const maxPage = Math.ceil(totalCount / limitNum);
        
        // ページが範囲外の場合は調整
        const correctedPage = Math.min(pageNum, maxPage || 1);
        const correctedSkip = (correctedPage - 1) * limitNum;
        
        // モデルから直接スコアでソートして取得
        const posts = await Post.find(query)
          .sort({ rankingScore: -1 })
          .skip(correctedSkip)
          .limit(limitNum)
          .populate('author', 'nickname icon')
          .populate('series', 'title _id')
          .lean();
        
        // ランク情報を追加
        const rankedPosts = posts.map((post, index) => ({
          rank: correctedSkip + index + 1,
          score: post.rankingScore,
          metrics: post.metrics || {}, // メトリクス情報
          post
        }));
        
        res.json({
          posts: rankedPosts,
          totalCount,
          page: correctedPage,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum)
        });
      } catch (error) {
        console.error('[TOTAL API] Error fetching posts total ranking:', error);
        res.status(500).json({ message: 'ランキングの取得に失敗しました' });
      }
    });

// シリーズの総合ランキングを取得するエンドポイント
router.get('/series', async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const limitNum = Math.min(parseInt(limit), 10); // 1ページ最大10件
        const pageNum = Math.max(parseInt(page), 1);
        const skip = (pageNum - 1) * limitNum;
        
        // 総合カウントを最大50件に制限
        const query = { rankingScore: { $gt: 0 } };
        const totalCount = Math.min(await Series.countDocuments(query), 50);
        const maxPage = Math.ceil(totalCount / limitNum);
        
        // ページが範囲外の場合は調整
        const correctedPage = Math.min(pageNum, maxPage || 1);
        const correctedSkip = (correctedPage - 1) * limitNum;
        
        // モデルから直接スコアでソートして取得
        const series = await Series.find(query)
          .sort({ rankingScore: -1 })
          .skip(correctedSkip)
          .limit(limitNum)
          .populate('author', 'nickname icon')
          .populate({
            path: 'posts.postId',
            select: 'title _id'
          })
          .lean();
        
        // ランク情報を追加
        const rankedSeries = series.map((seriesItem, index) => ({
          ...seriesItem,
          rank: correctedSkip + index + 1,
          score: seriesItem.rankingScore,
          metrics: seriesItem.metrics || {},
          episodeCount: seriesItem.posts?.length || 0,
          followerCount: seriesItem.followerCount || 0,
          isCompleted: seriesItem.isCompleted || false
        }));
        
        res.json({
          series: rankedSeries,
          totalCount,
          page: correctedPage,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum)
        });
      } catch (error) {
        console.error('[TOTAL API] Error fetching series total ranking:', error);
        res.status(500).json({ message: 'ランキングの取得に失敗しました' });
      }
    });

// 手動で総合ランキングを再計算するエンドポイント（管理者用）
router.post('/recalculate', async (req, res) => {
  try {
    const { calculateTotalRankings } = require('../jobs/totalRankingJob');
    await calculateTotalRankings();
    
    res.json({ message: '総合ランキングの再計算が完了しました' });
  } catch (error) {
    console.error('[TOTAL API] Error recalculating total rankings:', error);
    res.status(500).json({ message: 'ランキングの再計算に失敗しました' });
  }
});

module.exports = router;