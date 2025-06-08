const express = require('express');
const Series = require('../models/Series');
const User = require('../models/User');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

// シリーズをフォローするエンドポイント
router.post('/series/:id/follow', authenticateToken, async (req, res) => {
  try {
    const seriesId = req.params.id;
    const userId = req.user._id;

    const series = await Series.findById(seriesId);
    const user = await User.findById(userId);

    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりません。' });
    }

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    // 既にフォロー済みか確認
    const isAlreadyFollowing = series.followers.includes(userId);

    if (isAlreadyFollowing) {
      // フォロー解除
      series.followers.pull(userId);
      series.followerCount = series.followers.length;
      
      // ユーザーのフォローシリーズリストから削除
      if (!user.followingSeries) user.followingSeries = [];
      user.followingSeries.pull(seriesId);
      
      await series.save();
      await user.save();
      
      // スコア再計算
      series.calculateTrendingScore();
      await series.save();
      
      res.json({ 
        isFollowing: false, 
        followerCount: series.followerCount,
        message: 'フォローを解除しました。' 
      });
    } else {
      // フォローする
      series.followers.push(userId);
      series.followerCount = series.followers.length;
      
      // ユーザーのフォローシリーズリストに追加
      if (!user.followingSeries) user.followingSeries = [];
      user.followingSeries.push(seriesId);
      
      await series.save();
      await user.save();
      
      // スコア再計算
      series.calculateTrendingScore();
      await series.save();
      
      res.json({ 
        isFollowing: true, 
        followerCount: series.followerCount,
        message: 'フォローしました。' 
      });
    }
  } catch (error) {
    console.error('Error following/unfollowing series:', error);
    res.status(500).json({ message: 'フォロー処理に失敗しました。' });
  }
});

// フォロー状態を確認するエンドポイント
router.get('/series/:id/is-following', authenticateToken, async (req, res) => {
  try {
    const seriesId = req.params.id;
    const userId = req.user._id;

    const series = await Series.findById(seriesId);
    
    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりません。' });
    }

    const isFollowing = series.followers.includes(userId);

    res.json({ 
      isFollowing,
      followerCount: series.followerCount 
    });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ message: 'フォロー状態の確認に失敗しました。' });
  }
});

// ユーザーがフォローしているシリーズ一覧を取得
router.get('/user/following-series', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('followingSeries');
    
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    res.json(user.followingSeries || []);
  } catch (error) {
    console.error('Error fetching following series:', error);
    res.status(500).json({ message: 'フォローシリーズの取得に失敗しました。' });
  }
});

module.exports = router;