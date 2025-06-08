// routes/view.js（修正版 - 未ログインユーザー対応）
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authenticateToken = require('../middlewares/authenticateToken');
const viewTrackingService = require('../services/correctedViewTrackingService');
const Post = require('../models/Post');
const { client: redisClient } = require('../utils/redisClient');

// レートリミッター設定（個別投稿に対して）
const viewRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分間
  max: 5, // 同じIDに対して5リクエストまで
  keyGenerator: (req) => `${req.params.postId}:${req.ip}`, // 投稿ID+IPでレート制限
  message: { message: '1分間に5回以上同じ投稿にリクエストすることはできません。' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔧 修正: オプショナル認証ミドルウェア（未ログインでもOK）
const optionalAuthenticateToken = (req, res, next) => {
  const token = req.cookies?.token;
  
  if (!token) {
    // トークンがない場合は未ログインユーザーとして処理
    req.user = null;
    req.authUserId = null;
    return next();
  }
  
  // トークンがある場合は通常の認証処理
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      // トークンが無効な場合も未ログインとして処理
      req.user = null;
      req.authUserId = null;
      return next();
    }
    
    try {
      const user = await User.findById(decoded.id);
      if (!user) {
        req.user = null;
        req.authUserId = null;
      } else {
        req.user = user;
        req.authUserId = decoded.id;
      }
      next();
    } catch (error) {
      req.user = null;
      req.authUserId = null;
      next();
    }
  });
};

// 🚨 重要修正: 閲覧記録エンドポイント（IPベース識別）
router.post('/:postId([0-9a-fA-F]{24})/view', optionalAuthenticateToken, viewRateLimiter, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id || null; // 未ログインの場合はnull
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;
    
    // 🔧 修正: IPベースの識別（sessionId不使用）
    const identifier = userId ? `user_${userId}` : `ip_${ip}`;
    
    console.log(`📊 閲覧記録: 投稿${postId}, ユーザー${userId || 'guest'}, 識別子${identifier}`);
  
    // 修正された閲覧トラッキングサービスで記録
    const result = await viewTrackingService.recordView({
      postId,
      userId,
      sessionId: identifier, // IPベースの識別子を渡す
      userAgent,
      ip
    });
    
    res.status(200).json({
      success: result.success,
      unique: result.unique,
      userType: userId ? 'authenticated' : 'guest'
    });
  } catch (error) {
    console.error('Error recording view:', error);
    res.status(500).json({ 
      success: false,
      message: '閲覧の記録に失敗しました'
    });
  }
});

// 🔧 修正: 閲覧履歴を取得（認証ユーザーのみ）
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    
    // ページネーションのオフセット計算
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    // Redisから最新の閲覧履歴を取得（ZREVRANGEで逆順に取得）
    const historyWithScores = await redisClient.zrevrange(
      `user:${userId}:viewHistory`,
      start,
      end,
      'WITHSCORES'
    );
    
    // 結果がない場合
    if (!historyWithScores || historyWithScores.length === 0) {
      return res.status(200).json({
        history: [],
        totalCount: 0,
        page,
        limit,
        totalPages: 0
      });
    }
    
    // 閲覧時間とpostIdを抽出
    const historyItems = [];
    for (let i = 0; i < historyWithScores.length; i += 2) {
      historyItems.push({
        postId: historyWithScores[i],
        viewedAt: new Date(parseInt(historyWithScores[i+1]))
      });
    }
    
    // 総件数を取得
    const totalCount = await redisClient.zcard(`user:${userId}:viewHistory`);
    
    // postIdsのリストを作成
    const postIds = historyItems.map(item => item.postId);
    
    // 投稿データを一括取得（バッチ最適化）
    const posts = await Post.find({ _id: { $in: postIds } })
      .select('title description author series tags viewCounter goodCounter bookShelfCounter wordCount isAdultContent')
      .populate([
        {
          path: 'author',
          select: 'nickname icon'
        },
        {
          path: 'series',
          select: 'title _id'
        }
      ])
      .lean();
    
    // 投稿IDからデータへのマッピングを作成
    const postMap = {};
    posts.forEach(post => {
      postMap[post._id.toString()] = post;
    });
    
    // 履歴アイテムに投稿データを付加
    const history = historyItems
      .map(item => ({
        _id: item.postId,
        post: postMap[item.postId],
        viewedAt: item.viewedAt
      }))
      .filter(item => item.post); // 削除された投稿を除外
    
    res.status(200).json({
      history,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching view history:', error);
    res.status(500).json({ message: '閲覧履歴の取得に失敗しました' });
  }
});

// 投稿の総閲覧数を取得（管理者・投稿者のみ）
router.get('/:postId([0-9a-fA-F]{24})/analytics', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).select('author viewCounter');
    
    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりません' });
    }
    
    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.isAdmin;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'アクセス権限がありません' });
    }
    
    // Redisから最新の閲覧数を取得
    const redisViews = await redisClient.hget(`post:${req.params.postId}:counters`, 'viewCounter');
    const totalViews = redisViews ? parseInt(redisViews, 10) : (post.viewCounter || 0);
    
    res.json({
      postId: req.params.postId,
      totalViews,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error fetching view analytics:', error);
    res.status(500).json({ message: '閲覧データの取得に失敗しました' });
  }
});

// 🆕 追加: 未ログインユーザーの統計情報取得
router.get('/guest/stats', async (req, res) => {
  try {
    // 全体の閲覧統計を返す（認証不要）
    const totalViews = await redisClient.get('stats:total_views') || 0;
    const totalPosts = await Post.countDocuments();
    const activeUsers = await redisClient.scard('active_users_today') || 0;
    
    res.json({
      totalViews: parseInt(totalViews),
      totalPosts,
      activeUsers,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching guest stats:', error);
    res.status(500).json({ message: '統計情報の取得に失敗しました' });
  }
});

module.exports = router;