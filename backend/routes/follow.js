const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Good = require('../models/Good');
const Series = require('../models/Series');
const Follow = require('../models/Follow'); // Followモデルのインポート
const authenticateToken = require('../middlewares/authenticateToken');

const NotificationGenerator = require('../utils/notificationGenerator');
const router = express.Router();

// ユーザーをフォローするエンドポイント
router.post('/users/follow/:id([0-9a-fA-F]{24})', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user._id;
    const followeeId = req.params.id;

    if (followerId.toString() === followeeId) {
      return res.status(400).json({ message: "自分自身をフォローすることはできません。" });
    }

    const followee = await User.findById(followeeId);
    const follower = await User.findById(followerId);
    let updatedFollowerCounter;

    if (!followee || !follower) {
      return res.status(404).json({ message: "ユーザーが見つかりません。" });
    }

    // フォロワーがすでにフォローしていない場合のみ追加
    if (!followee.followers.includes(followerId)) {
      followee.followers.push(followerId);
      await followee.save();
    
      updatedFollowerCounter = followee.followerCount + 1;
      await User.findByIdAndUpdate(followeeId, { followerCount: updatedFollowerCounter});
      await NotificationGenerator.generateFollowNotification(followerId, followeeId);

    }

    // フォローしているユーザーリストに追加
    if (!follower.following.includes(followeeId)) {
      follower.following.push(followeeId);
      await follower.save();
    }

    res.status(200).json({ message: "フォローしました。" });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: "フォローに失敗しました。" });
  }
});

// ユーザーのフォローを解除するエンドポイント
router.delete('/users/unfollow/:id([0-9a-fA-F]{24})', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user._id;
    const followeeId = req.params.id;

    const followee = await User.findById(followeeId);
    const follower = await User.findById(followerId);

    let updatedFollowerCounter;
    if (!followee || !follower) {
      return res.status(404).json({ message: "ユーザーが見つかりません。" });
    }

    // フォロワーリストから削除
    followee.followers = followee.followers.filter(
      (id) => id.toString() !== followerId.toString()
    );
    await followee.save();

    updatedFollowerCounter = followee.followerCount - 1;
    await User.findByIdAndUpdate(followeeId,{followerCount: updatedFollowerCounter});
  
    // フォローリストから削除
    follower.following = follower.following.filter(
      (id) => id.toString() !== followeeId.toString()
    );
    await follower.save();

    res.status(200).json({ message: "フォローを解除しました。" });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: "フォロー解除に失敗しました。" });
  }
});

// フォローステータスを確認するエンドポイント
router.get('/users/:id([0-9a-fA-F]{24})/is-following', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    res.status(200).json({ isFollowing });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ message: 'フォローステータスの取得に失敗しました。' });
  }
});

module.exports = router;
