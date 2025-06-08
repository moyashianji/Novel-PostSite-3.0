// routes/user.js

const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const User = require('../models/User');
const Post = require('../models/Post');
const Good = require('../models/Good');
const Series = require('../models/Series');
const Follow = require('../models/Follow'); // Followモデルのインポート
const Contest = require('../models/Contest'); // Contestモデル
const ViewAnalytics = require('../models/ViewAnalytics'); // ViewAnalytics

const upload = require('../middlewares/upload');

const router = express.Router();

// ユーザー情報を取得するエンドポイント
router.get('/:userId([0-9a-fA-F]{24})', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりませんでした。' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'ユーザー情報の取得に失敗しました。' });
  }
});
// ユーザーの作品を取得するエンドポイント
router.get('/:userId([0-9a-fA-F]{24})/works', async (req, res) => {
  try {
    const works = await Post.find({ author: req.params.userId })
    .populate([
      {
        path: 'author',
        select: 'nickname icon'
      },
      {
        path: 'series',
        select: 'title _id'
      }
    ]);
    if (!works) {
      return res.status(404).json({ message: '作品が見つかりませんでした。' });
    }
    res.json(works);
  } catch (error) {
    console.error('Error fetching user works:', error);
    res.status(500).json({ message: '作品の取得に失敗しました。' });
  }
});

const path = require('path');
const fs = require('fs');

router.post('/:id([0-9a-fA-F]{24})/update', authenticateToken, upload.single('icon'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`User ID: ${id}`);

    // 既存ユーザー情報を取得
    const user = await User.findById(id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user);

    // 更新データの準備
    const updateData = {
      nickname: req.body.nickname,
      description: req.body.description || "",  // デフォルト値を設定
      xLink: req.body.xLink || "",              // デフォルト値を設定
      pixivLink: req.body.pixivLink || "",      // デフォルト値を設定
      otherLink: req.body.otherLink || "",      // デフォルト値を設定
      favoriteAuthors: req.body.favoriteAuthors ? JSON.parse(req.body.favoriteAuthors) : user.favoriteAuthors || [],
      // 誕生日情報を追加
      dob: req.body.dob || user.dob,           // 誕生日が指定されている場合は更新、なければ現在の値を維持
    };

    console.log('Update data:', updateData);

    // アイコンがアップロードされた場合は、iconフィールドを追加
    if (req.file) {
      console.log('Icon file uploaded:', req.file);

      // 古いアイコンを削除
      if (user.icon && user.icon !== `/uploads/default.png`) { // デフォルト画像は削除しない
        const oldIconPath = path.join(__dirname, '..', 'uploads', path.basename(user.icon));  // 修正されたパス
        console.log('Old icon path:', oldIconPath);
        fs.unlink(oldIconPath, (err) => {
          if (err) {
            console.error('Failed to delete old icon:', err);
          } else {
            console.log('Old icon deleted successfully');
          }
        });
      }

      // 新しいアイコンパスを更新データに追加
      updateData.icon = `/uploads/${req.file.filename}`;
    }

    // ユーザー情報の更新
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, upsert: true });
    console.log('Updated user:', updatedUser);

    res.json(updatedUser); // 更新されたユーザー情報を返す
  } catch (err) {
    console.error('Error updating profile:', err); // エラーの詳細をログに出力
    res.status(500).json({ message: 'Error updating profile', error: err });
  }
});

// ユーザーの作品一覧を取得するエンドポイント
router.get('/me/works', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Userの作品リストを取得
    const works = await Post.find({ author: userId })
    .populate([
      {
        path: 'author',
        select: 'nickname icon'
      },
      {
        path: 'series',
        select: 'title _id'
      }
    ]);

    if (!works) {
      return res.status(404).json({ message: '作品が見つかりませんでした。' });
    }

    res.status(200).json(works);
  } catch (error) {
    console.error('Error fetching user works:', error);
    res.status(500).json({ message: '作品の取得に失敗しました。' });
  }
});

// 特定のシリーズに含まれるすべての作品を取得するエンドポイント
// Series の posts を取得するエンドポイント
router.get('/me/series', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    // シリーズデータを取得し、authorとpostsを適切にポピュレート
    const series = await Series.find({ author: userId })
      .populate('author', 'nickname icon _id') // 作者情報を明示的に取得
      .populate({
        path: 'posts.postId', // シリーズ内の各投稿を適切にポピュレート
        select: 'title goodCounter bookShelfCounter viewCounter' // 必要なフィールドを選択
      })
      .lean();
    
    // シリーズごとのアナリティクスデータを計算
    const seriesData = series.map(s => {
      // シリーズ内の全投稿から統計情報を集計
      const totalLikes = s.posts.reduce((acc, post) => {
        return acc + (post.postId?.goodCounter || 0);
      }, 0);
      
      const totalBookshelf = s.posts.reduce((acc, post) => {
        return acc + (post.postId?.bookShelfCounter || 0);
      }, 0);
      
      const totalViews = s.posts.reduce((acc, post) => {
        return acc + (post.postId?.viewCounter || 0);
      }, 0);
      
      // シリーズの完全な情報を返す
      return {
        ...s,
        totalLikes,
        totalBookshelf,
        totalViews,
        totalPosts: s.posts.length,
        totalPoints: totalLikes * 2 + totalBookshelf * 2
      };
    });

    res.status(200).json(seriesData);
  } catch (error) {
    console.error('Error fetching user series:', error);
    res.status(500).json({ message: 'ユーザーのシリーズを取得できませんでした。', error });
  }
});

router.get('/me/novels', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // authenticateToken ミドルウェアで設定されたユーザーID
    const novels = await Post.find({ author: userId });

    res.status(200).json(novels);
  } catch (error) {
    console.error('Error fetching user novels:', error);
    res.status(500).json({ message: '小説の取得に失敗しました。' });
  }
});

// backend/routes/users.js の followingリストとフォロワーリスト取得部分を修正

// backend/routes/users.js の修正例

// フォロワーリストを取得するエンドポイント
router.get('/followers', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // ユーザー情報を取得し、フォロワー情報をポピュレート
    const user = await User.findById(userId).populate({
      path: 'followers',
      select: 'nickname icon description followerCount'
    });

    if (!user || !user.followers) {
      return res.status(200).json([]); // 空配列を返す
    }

    // 各フォロワーの最近の作品と統計情報を取得
    const followers = await Promise.all(user.followers.map(async (follower) => {
      // フォロワーの最近の作品を3つ取得
      let recentWorks = [];
      try {
        recentWorks = await Post.find({ author: follower._id })
          .sort({ createdAt: -1 })
          .limit(6)
          .select('title description content wordCount viewCounter goodCounter tags author isAdultContent aiEvidence')
          .populate([
            {
              path: 'author',
              select: 'nickname icon'
            },
            {
              path: 'series',
              select: 'title _id'
            }
          ]);
      } catch (error) {
        console.error(`Error fetching recent works for user ${follower._id}:`, error);
        // エラーが発生しても処理を続行
      }
      
        
      // 統計情報を取得
      let postCount = 0;
      let seriesCount = 0; // シリーズ数を追加
      
      try {
        postCount = await Post.countDocuments({ author: follower._id });
        seriesCount = await Series.countDocuments({ author: follower._id }); // シリーズ数を取得
      } catch (error) {
        console.error(`Error fetching stats for user ${follower._id}:`, error);
        // エラーが発生しても処理を続行
      }
      
      // 相互フォロー状態を確認
      let isFollowedByMe = false;
      try {
        const followCheck = await User.findOne({ 
          _id: userId, 
          following: follower._id 
        });
        isFollowedByMe = !!followCheck;
      } catch (error) {
        console.error(`Error checking follow status for user ${follower._id}:`, error);
      }

      return {
        ...follower._doc,
        postCount,
        seriesCount, // シリーズ数を追加
        recentWorks,
        isFollowedByMe
      };
    }));

    res.status(200).json(followers);
  } catch (error) {
    console.error('フォロワーリストの取得に失敗しました:', error);
    res.status(500).json({ message: 'フォロワーリストの取得に失敗しました。' });
  }
});

// フォローしているユーザーリストを取得するエンドポイント
router.get('/following', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // ユーザー情報を取得し、フォロー情報をポピュレート
    const user = await User.findById(userId).populate({
      path: 'following',
      select: 'nickname icon description followerCount'
    });

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    // 各フォロー中ユーザーの最近の作品と統計情報を取得
    const following = await Promise.all(user.following.map(async (followedUser) => {
      // 最近の作品を3つ取得
      const recentWorks = await Post.find({ author: followedUser._id })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('title description content wordCount viewCounter goodCounter tags author isAdultContent aiEvidence')
      .populate([
        {
          path: 'author',
          select: 'nickname icon'
        },
        {
          path: 'series',
          select: 'title _id'
        }
      ]);
      
      // 統計情報を取得
      let postCount = 0;
      let seriesCount = 0; // シリーズ数を追加
      
      try {
        postCount = await Post.countDocuments({ author: followedUser._id });
        seriesCount = await Series.countDocuments({ author: followedUser._id }); // シリーズ数を取得
      } catch (error) {
        console.error(`Error fetching stats for user ${followedUser._id}:`, error);
        // エラーが発生しても処理を続行
      }

      return {
        ...followedUser._doc,
        postCount,
        seriesCount, // シリーズ数を追加
        recentWorks
      };
    }));

    res.status(200).json(following);
  } catch (error) {
    console.error('フォローリストの取得に失敗しました:', error);
    res.status(500).json({ message: 'フォローリストの取得に失敗しました。' });
  }
});
// ユーザーのシリーズ一覧を取得するエンドポイント
router.get('/:id([0-9a-fA-F]{24})/series', async (req, res) => {
  try {
    const userId = req.params.id;
    const series = await Series.find({ author: userId }).populate('author');

    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    res.status(200).json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ message: 'シリーズの取得に失敗しました。', error });
  }
});
// ユーザー情報の取得
router.get('/:id([0-9a-fA-F]{24})', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // パスワードを除外して取得
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'ユーザー情報の取得に失敗しました。' });
  }
});
router.get('/tags', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ユーザーのタグコンテナ（インデックス付き）を返す
    res.json({ tagContainers: user.tagContainers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tags', error });
  }
});
// サーバー側
router.post('/tags', authenticateToken, async (req, res) => {
  try {
    const { index, tag } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    // タグコンテナにindexとtagを保存（既に存在する場合は上書き）
    const tagContainer = { tag, index };
    user.tagContainers[index] = tagContainer;
    console.log(tagContainer)
    await user.save();

    res.status(200).json({ message: 'Tag saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving tag', error });
  }
});

// routes/users.js
router.delete('/tags/:index',authenticateToken, async (req, res) => {
  const userId = req.user._id;  // 認証されたユーザーID
  const indexToRemove = parseInt(req.params.index, 10);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりませんでした' });
    }

    // 指定されたインデックスのタグを削除
    user.tagContainers.splice(indexToRemove, 1);

    // インデックスを詰めるために順番をリセット
    user.tagContainers = user.tagContainers.map((container, index) => ({
      ...container,
      index,  // インデックスを詰めて再割り当て
    }));

    await user.save();  // 変更を保存
    res.status(200).json({ message: 'タグが削除されました' });
  } catch (error) {
    console.error('Error removing tag:', error);
    res.status(500).json({ message: 'タグの削除中にエラーが発生しました' });
  }
});

// ユーザーが主催しているコンテストを取得するエンドポイント
router.get('/me/contests', authenticateToken, async (req, res) => {
  try {
    // 現在ログインしているユーザーのIDを取得
    const userId = req.user._id;

    // 主催しているコンテストを取得
    const contests = await Contest.find({ creator: userId }).sort({ createdAt: -1 });

    res.status(200).json(contests);
  } catch (error) {
    console.error('Error fetching user contests:', error);
    res.status(500).json({ message: 'コンテストの取得に失敗しました。', error });
  }
});

const statsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分間キャッシュを有効にする

// 統計情報用キャッシュミドルウェア
const cacheStats = (req, res, next) => {
  const userId = req.params.userId;
  const cacheKey = `user-stats-${userId}`;
  
  // キャッシュがあり、有効期限内なら使用
  if (statsCache.has(cacheKey)) {
    const { data, timestamp } = statsCache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) {
      return res.json(data);
    }
    // 期限切れならキャッシュを削除
    statsCache.delete(cacheKey);
  }
  
  // キャッシュがなければ次のミドルウェアへ
  // レスポンスを傍受してキャッシュに保存
  const originalJson = res.json;
  res.json = function(data) {
    statsCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    return originalJson.call(this, data);
  };
  
  next();

};
// ユーザーの統計情報を取得するエンドポイント
router.get('/:userId([0-9a-fA-F]{24})/stats', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // ユーザー情報を取得
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりませんでした。' });
    }
    
    // ユーザーの作品を取得
    const posts = await Post.find({ author: userId });
    
    // いいね数の合計を取得
  const totalLikes = posts.reduce((total, post) => total + (post.goodCounter || 0), 0);

    // コメント数の合計を取得
    const commentCount = posts.reduce((total, post) => total + (post.comments ? post.comments.length : 0), 0);
    
    // ブックマーク数（本棚追加数）の合計
    const totalBookmarks = posts.reduce((total, post) => total + (post.bookShelfCounter || 0), 0);
    
    // 閲覧数の合計
    const totalViews = posts.reduce((total, post) => total + (post.viewCounter || 0), 0);
    
    // AI生成作品とオリジナル作品の割合を計算
    const aiPosts = posts.filter(post => post.aiGenerated).length;
    const originalPosts = posts.filter(post => post.isOriginal).length;
    
    const aiUsagePercent = posts.length > 0 ? Math.round((aiPosts / posts.length) * 100) : 0;
    const originalContentPercent = posts.length > 0 ? Math.round((originalPosts / posts.length) * 100) : 0;
    
    // R18コンテンツの数
    const adultContentCount = posts.filter(post => post.isAdultContent).length;
    
    // シリーズの数を取得
    const seriesCount = await Series.countDocuments({ author: userId });
    
    // タグの使用頻度を集計
    const tagCounts = {};
    posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // よく使われるタグをソートして上位5つを取得
    const topTags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // 統計情報をまとめる
    const stats = {
      postCount: posts.length,
      totalViews,
      totalLikes,
      totalBookmarks,
      commentCount,
      aiUsagePercent,
      originalContentPercent,
      adultContentCount,
      seriesCount,
      topTags
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: '統計情報の取得に失敗しました。', error: error.message });
  }
});
// ユーザーデータが更新されたらキャッシュを削除するミドルウェア
const clearUserCache = (req, res, next) => {
  const userId = req.params.id || req.user?._id;
  if (userId) {
    const cacheKey = `user-stats-${userId}`;
    statsCache.delete(cacheKey);
  }
  next();
};
// ユーザーの最近の活動を取得するエンドポイント
router.get('/:userId([0-9a-fA-F]{24})/activity', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // ユーザー情報を確認
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりませんでした。' });
    }
    
    // 最近の投稿を取得（最新10件）
    const recentPosts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title createdAt viewCounter');
    
    // 最近のコメントを取得
    const postsWithComments = await Post.find({ 'comments.userId': userId })
      .sort({ 'comments.createdAt': -1 })
      .limit(10)
      .select('title comments');
    
    // コメントデータを整形
    const recentComments = [];
    postsWithComments.forEach(post => {
      if (post.comments && Array.isArray(post.comments)) {
        post.comments
          .filter(comment => comment.userId && comment.userId.toString() === userId)
          .slice(0, 5) // 各投稿から最大5件のコメントを取得
          .forEach(comment => {
            recentComments.push({
              type: 'comment',
              postTitle: post.title,
              postId: post._id,
              date: comment.createdAt,
              content: comment.content
            });
          });
      }
    });
    
    // 投稿データを整形
    const formattedPosts = recentPosts.map(post => ({
      type: 'post',
      title: post.title,
      postId: post._id,
      date: post.createdAt,
      views: post.viewCounter || 0
    }));
    
    // 活動データを結合してソート
    const allActivity = [...formattedPosts, ...recentComments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10); // 最新10件のみ返す
    
    res.json(allActivity);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ message: '活動履歴の取得に失敗しました。', error: error.message });
  }
});

// backend/routes/users.js の投稿のアナリティクス取得エンドポイントを修正

// 投稿のアナリティクス取得エンドポイント
router.get('/me/works/:postId/analytics', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { timeframe = 'day', date } = req.query;
    const userId = req.user._id;

    // 投稿が自分のものか確認
    const post = await Post.findOne({ _id: postId, author: userId })
      .select('title viewCounter goodCounter bookShelfCounter comments createdAt');
    
    if (!post) {
      return res.status(404).json({ message: '作品が見つかりません' });
    }

    // ViewAnalyticsからデータを取得
    const viewAnalytics = await ViewAnalytics.findOne({ postId })
      .select('timeWindows packedViewData');

    // 基本統計
    const basicStats = {
      totalViews: post.viewCounter || 0,
      totalLikes: post.goodCounter || 0,
      totalBookmarks: post.bookShelfCounter || 0,
      totalComments: post.comments ? post.comments.length : 0,
      publishedAt: post.createdAt
    };

    // 時系列データの準備
    let timeSeriesData = {};
    let hourlyData = [];

    if (viewAnalytics && viewAnalytics.timeWindows) {
      console.log(`📊 ${postId}: timeWindows数 = ${viewAnalytics.timeWindows.length}`);
      
      // 各期間のデータを準備
      const periods = ['hour', 'day', 'week', 'month', 'year'];
      
      periods.forEach(period => {
        // 該当期間のデータをフィルタリングしてソート
        const periodData = viewAnalytics.timeWindows
          .filter(window => window.period === period)
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
          .map(window => ({
            date: window.startTime.toISOString(),
            startTime: window.startTime.toISOString(),
            views: window.totalViews || 0,
            totalViews: window.totalViews || 0,
            uniqueUsers: window.uniqueUsers || 0
          }));

        if (periodData.length > 0) {
          timeSeriesData[period] = periodData;
          console.log(`📈 ${period}: ${periodData.length}件のデータ`);
        }
      });

      // 時間足データ（指定された日付の24時間分）
      if (date) {
        const selectedDate = new Date(date);
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);

        // 指定日の時間窓データを取得
        const dayHourWindows = viewAnalytics.timeWindows.filter(window => {
          if (window.period !== 'hour') return false;
          const windowDate = new Date(window.startTime);
          return windowDate >= selectedDate && windowDate < nextDate;
        });

        console.log(`🕐 ${date}の時間データ: ${dayHourWindows.length}件`);

        // 24時間分のデータを初期化
        hourlyData = Array.from({ length: 24 }, (_, hour) => {
          const hourWindow = dayHourWindows.find(window => {
            return new Date(window.startTime).getHours() === hour;
          });
          
          return { 
            hour, 
            views: hourWindow ? hourWindow.totalViews : 0 
          };
        });
      } else {
        // 日付が指定されていない場合は今日のデータを取得
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayHourWindows = viewAnalytics.timeWindows.filter(window => {
          if (window.period !== 'hour') return false;
          const windowDate = new Date(window.startTime);
          return windowDate >= today && windowDate < tomorrow;
        });

        hourlyData = Array.from({ length: 24 }, (_, hour) => {
          const hourWindow = todayHourWindows.find(window => {
            return new Date(window.startTime).getHours() === hour;
          });
          
          return { 
            hour, 
            views: hourWindow ? hourWindow.totalViews : 0 
          };
        });
      }
    }

    // エンゲージメント率の計算
    const engagement = {
      likeRate: basicStats.totalViews > 0 ? (basicStats.totalLikes / basicStats.totalViews * 100).toFixed(2) : '0.00',
      bookmarkRate: basicStats.totalViews > 0 ? (basicStats.totalBookmarks / basicStats.totalViews * 100).toFixed(2) : '0.00',
      commentRate: basicStats.totalViews > 0 ? (basicStats.totalComments / basicStats.totalViews * 100).toFixed(2) : '0.00'
    };

    console.log(`✅ アナリティクス応答準備完了:`);
    console.log(`   - 基本統計: ${JSON.stringify(basicStats)}`);
    console.log(`   - 時系列データ期間: ${Object.keys(timeSeriesData).join(', ')}`);
    console.log(`   - 時間別データ: ${hourlyData.length}時間分`);

    res.json({
      postId,
      postTitle: post.title,
      basicStats,
      timeSeriesData,
      hourlyData,
      engagement
    });
  } catch (error) {
    console.error('Error fetching work analytics:', error);
    res.status(500).json({ message: 'アナリティクスの取得に失敗しました' });
  }
});

// データ取得制限を返すヘルパー関数
function getDataLimit(timeframe) {
  const limits = {
    hour: 24,    // 24時間
    day: 30,     // 30日
    week: 12,    // 12週
    month: 12,   // 12ヶ月
    year: 5      // 5年
  };
  return limits[timeframe] || 30;
}
module.exports = router;
