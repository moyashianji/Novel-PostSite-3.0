const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Good = require('../models/Good');
const Series = require('../models/Series');
const Follow = require('../models/Follow'); // Followモデルのインポート
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();
const NotificationGenerator = require('../utils/notificationGenerator');
// コメント追加エンドポイント
router.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  try {
    // 投稿を取得
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりません' });
    }
    
    // 新しいコメントを作成
    const newComment = {
      text,
      author: req.user._id,
      createdAt: new Date(),
    };

    // 投稿にコメントを追加
    post.comments.push(newComment);
    const savedPost = await post.save();
    
    // 保存後の最新のコメントを取得（_id が生成された後）
    const savedComment = savedPost.comments[savedPost.comments.length - 1];
    
    // 通知を生成（投稿オブジェクト全体を渡す）
    await NotificationGenerator.generateCommentNotification(savedComment, post);
    
    res.status(201).json(savedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'コメントの追加に失敗しました' });
  }
});
// コメントに対する返信
router.post('/posts/:postId/comments/:commentId/reply',authenticateToken, async (req, res) => {
  const { postId, commentId } = req.params;
  const { text } = req.body;

  try {
    const post = await Post.findById(postId);
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'コメントが見つかりませんでした' });
    }

    const reply = {
      text,
      author: req.user._id,
      createdAt: new Date(),
    };

    comment.replies.push(reply);
    await post.save();
    res.status(201).json(reply);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: '返信の追加に失敗しました' });
  }
});

// コメント削除エンドポイント
router.delete('/posts/:postId/comments/:commentId', authenticateToken, async (req, res) => {
  const { postId, commentId } = req.params;
  const { replyId } = req.query; // replyIdをクエリパラメータとして取得

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりませんでした' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'コメントが見つかりませんでした' });
    }

    if (replyId) {
      // 返信削除
      const replyIndex = comment.replies.findIndex(reply => reply._id.toString() === replyId);
      if (replyIndex === -1) {
        return res.status(404).json({ message: '返信が見つかりませんでした' });
      }
      // spliceで返信を削除
      comment.replies.splice(replyIndex, 1);
    } else {
      // コメント削除
      const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);
      if (commentIndex === -1) {
        return res.status(404).json({ message: 'コメントが見つかりませんでした' });
      }
      // spliceでコメントを削除
      post.comments.splice(commentIndex, 1);
    }

    await post.save(); // 変更を保存

    res.status(200).json({ message: '削除が完了しました' });
  } catch (error) {
    console.error('Error deleting comment or reply:', error);
    res.status(500).json({ message: '削除に失敗しました' });
  }
});

// コメント取得エンドポイント（リプライの著者情報も取得）
router.get('/posts/:id([0-9a-fA-F]{24})/comments', async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 5 } = req.query; // ページとリミットをクエリパラメータから取得
  const skip = (page - 1) * limit; // 取得開始位置

  try {
    // 投稿をIDで検索し、コメントとリプライの著者情報を取得
    const post = await Post.findById(id)
      .populate('comments.author', 'nickname icon')  // コメントの著者情報をポピュレート
      .populate('comments.replies.author', 'nickname icon');  // リプライの著者情報もポピュレート

    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりませんでした' });
    }

    // コメント全体の総数を取得
    const totalComments = post.comments.length;

    // コメントをページネーションで取得
    const paginatedComments = post.comments.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      comments: paginatedComments,
      totalComments,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalComments / limit)
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'コメントの取得に失敗しました' });
  }
});

module.exports = router;

