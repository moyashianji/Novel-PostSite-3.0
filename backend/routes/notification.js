// サーバーサイドの実装例（Express.js を使用）
// routes/notifications.js

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * @route   GET /api/notifications
 * @desc    ユーザーの通知一覧を取得
 * @access  Private
 */
// routes/notifications.js の修正案
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type || 'all'; // 'all', 'unread', 'system'のいずれか
    
    // 基本的なクエリオブジェクト
    let query = { user: req.user.id };
    
    // タイプに応じたフィルタリング
    if (type === 'unread') {
      query.read = false;
    } else if (type === 'system') {
      query.type = 'system';
    }
    
    // 通知を取得（最新のものから順に）
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // 総件数を取得（ページネーション用）
    const totalCount = await Notification.countDocuments(query);
    
    // 未読の通知数も取得（全体の未読数、タイプに関わらず）
    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      read: false
    });
    
    // ページネーション情報をレスポンスに含める
    const pages = Math.ceil(totalCount / limit);
    
    // ページ番号が範囲外の場合は修正（例えば、データがなくなった場合）
    const correctedPage = page > pages && pages > 0 ? pages : page;
    
    // デバッグ情報をログに出力
    console.log(`通知API: page=${correctedPage}, pages=${pages}, total=${totalCount}, limit=${limit}`);
    
    res.json({
      notifications,
      unreadCount,
      page: correctedPage,
      pages: pages,
      hasMore: (correctedPage * limit) < totalCount,
      totalCount
    });
  } catch (err) {
    console.error('Notification fetch error:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    特定の通知を既読にする
 * @access  Private
 */
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ msg: '通知が見つかりません' });
    }

    // 既に既読なら何もしない
    if (notification.read) {
      return res.json({ msg: '既に既読です' });
    }

    // 既読にする
    notification.read = true;
    await notification.save();

    res.json({ msg: '通知を既読にしました', notification });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    すべての通知を既読にする
 * @access  Private
 */
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    // ユーザーのすべての未読通知を取得して既読にする
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.json({ msg: 'すべての通知を既読にしました' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    特定の通知を削除する
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {

    

    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ msg: '通知が見つかりません' });
    }

    await notification.deleteOne();
    res.json({ msg: '通知を削除しました' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;