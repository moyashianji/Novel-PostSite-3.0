/**
 * 超最適化された閲覧履歴モジュール
 * Redisベースの高速キャッシュとバッチ処理による効率化
 */

const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();
const { client: redisClient } = require('../utils/redisClient');

// 閲覧履歴の最大数
const MAX_HISTORY_ITEMS = 50;

/**
 * @route   POST /api/view-history/add
 * @desc    ユーザーの閲覧履歴に作品を追加する - 超最適化版
 * @access  Private
 */
router.post('/view-history/add', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;
    
    if (!postId) {
      return res.status(400).json({ message: '作品IDが必要です' });
    }

    // 投稿が存在するか確認 - Redisキャッシュから高速確認
    const postExists = await redisClient.exists(`post:${postId}:counters`);
    
    if (!postExists) {
      // キャッシュになければDBで確認
      const post = await Post.exists({ _id: postId });
      if (!post) {
        return res.status(404).json({ message: '指定された作品が見つかりません' });
      }
    }

    // 履歴に追加
    const success = await addToViewHistory(userId, postId);
    
    if (success) {
      res.status(200).json({ message: '閲覧履歴に追加しました' });
    } else {
      res.status(500).json({ message: '閲覧履歴の追加に失敗しました' });
    }
  } catch (error) {
    console.error('Error adding to view history:', error);
    res.status(500).json({ message: '閲覧履歴の追加に失敗しました', error: error.message });
  }
});

/**
 * @route   GET /api/view-history
 * @desc    ユーザーの閲覧履歴を取得する - 超最適化版
 * @access  Private
 */
router.get('/view-history', authenticateToken, async (req, res) => {
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
      .select('title description author series tags viewCounter goodCounter bookShelfCounter wordCount isAdultContent isAI isOriginal')
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
    
    // 投稿IDからデータへのマッピングを作成（O(1)アクセス最適化）
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
    res.status(500).json({ message: '閲覧履歴の取得に失敗しました', error: error.message });
  }
});

/**
 * @route   DELETE /api/view-history/:postId
 * @desc    閲覧履歴から特定の項目を削除 - 超最適化版
 * @access  Private
 */
router.delete('/view-history/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    
    // Redisのソート済みセットから項目を削除
    const removed = await redisClient.zrem(`user:${userId}:viewHistory`, postId);
    
    if (removed === 0) {
      return res.status(404).json({ message: '指定された履歴項目が見つかりません' });
    }
    
    // DBへの同期はバックグラウンドで行う
    syncViewHistoryToDb(userId).catch(err => {
      console.error('Error syncing view history to DB after delete:', err);
    });
    
    res.status(200).json({ message: '履歴項目を削除しました' });
  } catch (error) {
    console.error('Error deleting view history item:', error);
    res.status(500).json({ message: '履歴項目の削除に失敗しました', error: error.message });
  }
});

/**
 * @route   DELETE /api/view-history
 * @desc    閲覧履歴をすべて削除 - 超最適化版
 * @access  Private
 */
router.delete('/view-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Redisのソート済みセットを削除
    await redisClient.del(`user:${userId}:viewHistory`);
    
    // ユーザーのMongoDBからも閲覧履歴を削除
    await User.findByIdAndUpdate(userId, { $set: { viewHistory: [] } });
    
    res.status(200).json({ message: '閲覧履歴をクリアしました' });
  } catch (error) {
    console.error('Error clearing view history:', error);
    res.status(500).json({ message: '閲覧履歴のクリアに失敗しました', error: error.message });
  }
});

/**
 * 閲覧履歴をMongoDBに同期（バックグラウンド処理）
 * @param {string} userId - ユーザーID
 */
async function syncViewHistoryToDb(userId) {
  try {
    // ランダムな確率で同期を実行（全てのリクエストで実行するのを避けるため）
    if (Math.random() < 0.5) return;
    
    // Redisから最新の閲覧履歴を取得
    const historyWithScores = await redisClient.zrevrange(
      `user:${userId}:viewHistory`,
      0,
      MAX_HISTORY_ITEMS - 1,
      'WITHSCORES'
    );
    
    if (!historyWithScores || historyWithScores.length === 0) return;
    
    // 閲覧時間とpostIdを抽出
    const historyItems = [];
    for (let i = 0; i < historyWithScores.length; i += 2) {
      historyItems.push({
        postId: historyWithScores[i],
        viewedAt: new Date(parseInt(historyWithScores[i+1]))
      });
    }
    
    // MongoDBを更新
    await User.findByIdAndUpdate(userId, { viewHistory: historyItems });
  } catch (error) {
    console.error(`Error syncing view history to DB for user ${userId}:`, error);
    throw error;
  }
}

/**
 * 閲覧履歴に追加するユーティリティ関数（他のルートから呼び出し可能）
 * @param {string} userId - ユーザーID
 * @param {string} postId - 投稿ID
 * @returns {Promise<boolean>} - 成功したかどうか
 */
async function addToViewHistory(userId, postId) {
  try {
    // Redisのソート済みセットに閲覧履歴を追加（スコアは現在のタイムスタンプ）
    await redisClient.zadd(`user:${userId}:viewHistory`, Date.now(), postId);
    
    // 履歴を最大数に制限
    await redisClient.zremrangebyrank(`user:${userId}:viewHistory`, 0, -MAX_HISTORY_ITEMS - 1);
    
    // 低頻度でDBに同期
    if (Math.random() < 0.1) {
      await syncViewHistoryToDb(userId);
    }
    
    return true;
  } catch (error) {
    console.error(`Error adding post ${postId} to user ${userId}'s history:`, error);
    return false;
  }
}

// エクスポート
module.exports = router;
// 他のモジュールから呼び出せるように関数をエクスポート
module.exports.addToViewHistory = addToViewHistory;