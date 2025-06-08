const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('./models/User');
const Post = require('./models/Post');
const Good = require('./models/Good');
const Series = require('./models/Series');

const Follow = require('./models/Follow'); // Followモデルのインポート

const NodeCache = require('node-cache');
const tagCache = new NodeCache({ stdTTL: 3600 }); // キャッシュの有効期間を1時間に設定

const authenticateToken = require('./middlewares/authenticateToken');
const upload = require('./middlewares/upload');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',  // フロントエンドが動作しているオリジンを指定
  optionsSuccessStatus: 200
}));app.use(express.json());
app.use('/uploads', express.static('uploads'));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

mongoose.connect('mongodb://localhost:27017/novel-site', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// ファイル保存先とファイル名の設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // アップロード先のディレクトリ
  },
  filename: (req, file, cb) => {
    // ユーザーIDを使ってファイル名を固定
    const uniqueSuffix = `${req.params.id}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  },
});
const uploadPost = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MBまでの制限
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.gif') {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});
// server.js
const viewTracking = new Map(); // ユーザーごとに閲覧を追跡
// 全てのPostドキュメントにviewCounterフィールドが無い場合は0に初期化
// サーバー起動前にviewCounterの初期化を実行
(async () => {
  try {
    await Post.updateMany(
      { viewCounter: { $exists: false } },
      { $set: { viewCounter: 0 } }
    );
    console.log('All missing viewCounter fields initialized to 0');
  } catch (error) {
    console.error('Error initializing viewCounter:', error);
  }
})();

// サーバー起動時にフィールドの存在を確認して追加する関数
const addMissingFields = async () => {
  try {
    // `bookShelfCounter` がない Post に対してフィールドを追加
    await Post.updateMany(
      { bookShelfCounter: { $exists: false } },
      { $set: { bookShelfCounter: 0 } }
    );

    console.log('Missing `bookShelfCounter` fields have been added to Posts.');

    // `bookShelf` がない User に対してフィールドを追加
    await User.updateMany(
      { bookShelf: { $exists: false } },
      { $set: { bookShelf: [] } }
    );

    console.log('Missing `bookShelf` fields have been added to Users.');
  } catch (error) {
    console.error('Error adding missing fields:', error);
  }
};

// サーバー起動時にフィールド追加処理を実行
addMissingFields();
app.get('/api/series/:id/works', async (req, res) => {
  try {
    const seriesId = req.params.id;

    // シリーズを取得し、その中の投稿をpopulateして取得
    const series = await Series.findById(seriesId).populate('posts.postId');

    if (!series) {
      console.log('Series not found:', seriesId);
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    console.log('Series found:', series);

    // シリーズ内の投稿情報を取得して整理
    const works = series.posts
      .filter(post => {
        const hasPostId = !!post.postId;
        console.log(`Processing post: ${post._id}, hasPostId: ${hasPostId}`);
        return hasPostId;  // postIdが存在するか確認
      })
      .map(post => ({
        _id: post.postId._id,
        title: post.postId.title,
        description: post.postId.description,
        episodeNumber: post.episodeNumber,
      }));

    console.log('Works in series:', works);
    res.status(200).json(works);
  } catch (error) {
    console.error('Error fetching works in series:', error);
    res.status(500).json({ message: '作品一覧の取得に失敗しました。', error });
  }
});

// ユーザーのシリーズ一覧を取得するエンドポイント
app.get('/api/users/:id/series', async (req, res) => {
  try {
    const userId = req.params.id;
    const series = await Series.find({ author: userId });

    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    res.status(200).json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ message: 'シリーズの取得に失敗しました。', error });
  }
});

// 特定の投稿の詳細を取得するエンドポイント
app.get('/api/posts/:id/edit', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id; // 認証されたユーザーのIDを取得

    // 投稿を探し、かつその投稿のauthorが現在のユーザーであるかを確認
    const post = await Post.findOne({ _id: postId, author: userId });

    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりませんでした。' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post details:', error);
    res.status(500).json({ message: '投稿の取得に失敗しました。', error });
  }
});
// 特定の投稿を更新するエンドポイント
app.post('/api/posts/:id/update', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content, description, tags, original, adultContent, aiGenerated ,charCount} = req.body;

    // 投稿をデータベースから取得
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりませんでした。' });
    }

    // 投稿の各フィールドを更新
    post.title = title || post.title;
    post.content = content || post.content;
    post.description = description || post.description;
    post.tags = tags || post.tags;
    post.isOriginal = original;
    post.isAdultContent = adultContent;
    post.isAI = aiGenerated;
    post.wordCount = charCount;
    // 更新内容を保存
    await post.save();

    res.status(200).json({ message: '投稿が更新されました。', post });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: '投稿の更新に失敗しました。' });
  }
});
// シリーズから特定の投稿を削除するエンドポイント
app.post('/api/series/:id/update', authenticateToken, async (req, res) => {
  try {
    const seriesId = req.params.id;
    const { title, description, tags, isOriginal, isAdultContent, aiGenerated } = req.body;

    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    // シリーズ情報を更新
    series.title = title;
    series.description = description;
    series.tags = tags;
    series.isOriginal = isOriginal;
    series.isAdultContent = isAdultContent;
    series.aiGenerated = aiGenerated;

    await series.save();

    res.status(200).json(series);
  } catch (error) {
    console.error('Error updating series information:', error);
    res.status(500).json({ message: 'シリーズ情報を更新できませんでした。', error });
  }
});


app.post('/api/series/:id/removePost', authenticateToken, async (req, res) => {
  try {
    const seriesId = req.params.id;
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ message: 'postIdが提供されていません。' });
    }

    // シリーズを検索
    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    // シリーズから該当の投稿を削除
    series.posts = series.posts.filter(post => post.postId?.toString() !== postId.toString());
    await series.save();

    // Post モデルの series フィールドからシリーズIDを削除
    await Post.findByIdAndUpdate(postId, { $pull: { series: seriesId } }, { new: true, runValidators: false });

    res.status(200).json({ message: '作品がシリーズから削除されました。' });
  } catch (error) {
    console.error('Error removing post from series:', error);
    res.status(500).json({ message: 'シリーズから作品を削除できませんでした。', error });
  }
});

app.get('/api/user/me/novels', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // authenticateToken ミドルウェアで設定されたユーザーID
    const novels = await Post.find({ author: userId });

    res.status(200).json(novels);
  } catch (error) {
    console.error('Error fetching user novels:', error);
    res.status(500).json({ message: '小説の取得に失敗しました。' });
  }
});

app.post('/api/series/:id/updatePosts', authenticateToken, async (req, res) => {
  try {
    const seriesId = req.params.id;
    const { posts } = req.body;

    console.log(`Received request to update series with ID: ${seriesId}`);
    console.log(`Received posts data: ${JSON.stringify(posts)}`);

    const series = await Series.findById(seriesId);
    if (!series) {
      console.log('Series not found');
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    // デバッグメッセージ
    console.log(`Current series data before update: ${JSON.stringify(series.posts, null, 2)}`);

    // posts配列を使ってseries.posts内の各エピソードのエピソード番号を更新

    series.posts.forEach(existingPost => {
      const updatedPost = posts.find(post => post.postId === existingPost.postId?.toString());
      if (updatedPost) {
        console.log(`Updating postId ${existingPost.postId}: setting episodeNumber to ${updatedPost.episodeNumber}`);
        existingPost.episodeNumber = updatedPost.episodeNumber;
      } else {
        console.log(`No update needed for post with postId: ${existingPost.postId}`);
      }
    });

    await series.save();

    // デバッグメッセージ
    console.log(`Updated series data after save: ${JSON.stringify(series.posts, null, 2)}`);

    res.status(200).json({ message: 'エピソードの順序が更新されました。' });
  } catch (error) {
    console.error('Error updating posts order:', error);
    res.status(500).json({ message: 'エピソードの順序を更新できませんでした。', error: error.message });
  }
});

// シリーズの詳細情報を取得するエンドポイント
app.get('/api/series/:id', authenticateToken, async (req, res) => {
  try {
    const seriesId = req.params.id;
    const userId = req.user._id; // 認証されたユーザーのIDを取得

    // 自分のシリーズのみアクセスを許可
    const series = await Series.findOne({ _id: seriesId, author: userId }).populate('posts.postId');

    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    // 各投稿の詳細情報を抽出
    const populatedPosts = series.posts.map((post) => {
      if (post.postId) {
        return {
          _id: post.postId._id,
          title: post.postId.title,
          description: post.postId.description,
          goodCounter: post.postId.goodCounter,
          bookShelfCounter: post.postId.bookShelfCounter,
          viewCounter: post.postId.viewCounter,
          episodeNumber: post.episodeNumber,
        };
      }
      return null;
    }).filter(post => post !== null);

    // 必要に応じて他のフィールドも追加する
    res.status(200).json({
      _id: series._id,
      title: series.title,
      description: series.description,
      tags: series.tags,
      isOriginal: series.isOriginal,
      isAdultContent: series.isAdultContent,
      aiGenerated: series.aiGenerated,
      posts: populatedPosts,
    });
  } catch (error) {
    console.error('Error fetching series details:', error);
    res.status(500).json({ message: 'シリーズの詳細情報を取得できませんでした。', error });
  }
});

// シリーズに含まれている作品一覧を取得するエンドポイント
// 特定のシリーズに含まれるすべての作品を取得するエンドポイント
// Series の posts を取得するエンドポイント
app.get('/api/user/me/series', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const series = await Series.find({ author: userId }).populate('posts.postId');
    const seriesData = series.map(s => {
      console.log(`Processing series: ${s._id}`);
    
      // posts の存在確認
      if (!s.posts || s.posts.length === 0) {
        console.warn(`No posts found for series: ${s._id}`);
        return { ...s, totalLikes: 0, totalBookshelf: 0, totalViews: 0 };
      }
    
      // posts の内容を出力
      s.posts.forEach((post, index) => {
        console.log(`Post ${index + 1}:`, post);
      });
    
      // 各シリーズの全投稿の合計を計算
      const totalLikes = (s.posts || []).reduce((acc, post) => {
        const likes = post.postId?.goodCounter || 0;
        console.log(`Adding ${likes} likes from post ${post.postId?._id || 'unknown'}`);
        return acc + likes;
      }, 0);
    
      const totalBookshelf = (s.posts || []).reduce((acc, post) => {
        const bookshelfCount = post.postId?.bookShelfCounter || 0;
        console.log(`Adding ${bookshelfCount} bookshelf count from post ${post.postId?._id || 'unknown'}`);
        return acc + bookshelfCount;
      }, 0);
    
      const totalViews = (s.posts || []).reduce((acc, post) => {
        const views = post.postId?.viewCounter || 0;
        console.log(`Adding ${views} views from post ${post.postId?._id || 'unknown'}`);
        return acc + views;
      }, 0);
    
      console.log(`Total likes for series ${s._id}: ${totalLikes}`);
      console.log(`Total bookshelf count for series ${s._id}: ${totalBookshelf}`);
      console.log(`Total views for series ${s._id}: ${totalViews}`);
      return {
        _id: s._id,
        title: s.title,
        description: s.description,
        totalLikes,
        totalBookshelf,
        totalViews,
        totalPoints: totalLikes * 2 + totalBookshelf * 2
      };
    });

    res.status(200).json(seriesData);
  } catch (error) {
    console.error('Error fetching user series:', error);
    res.status(500).json({ message: 'ユーザーのシリーズを取得できませんでした。', error });
  }
});
app.get('/api/series/:id/posts', async (req, res) => {
  try {
    const seriesId = req.params.id;
    const series = await Series.findById(seriesId).populate('posts.postId');

    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    const postsWithEpisodes = series.posts
      .filter(post => post.postId)
      .map(post => ({
        _id: post.postId._id,
        title: post.postId.title,
        episodeNumber: post.episodeNumber,
      }));

    res.status(200).json(postsWithEpisodes);
  } catch (error) {
    console.error('Error fetching series posts:', error);
    res.status(500).json({ message: 'シリーズの投稿を取得できませんでした。', error });
  }
});
// Series のタイトルを取得するエンドポイント
app.get('/api/series/:id/title', async (req, res) => {
  try {
    const seriesId = req.params.id;
    const series = await Series.findById(seriesId);

    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    res.status(200).json({ title: series.title });
  } catch (error) {
    console.error('Error fetching series title:', error);
    res.status(500).json({ message: 'シリーズのタイトルを取得できませんでした。', error });
  }
});
// シリーズに投稿を追加するエンドポイント

app.post('/api/series/:id/addPost', authenticateToken, async (req, res) => {
  try {
    const seriesId = req.params.id;
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ message: 'postIdが提供されていません。' });
    }

    // シリーズを検索
    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    // 既存の最大エピソード番号を取得
    const maxEpisodeNumber = series.posts.reduce(
      (max, post) => Math.max(max, post.episodeNumber || 0),
      0
    );

    // 新しいエピソード番号を決定
    const episodeNumber = maxEpisodeNumber + 1;

    // シリーズに作品が既に存在しない場合のみ追加
    if (!series.posts.some(post => post.postId?.toString() === postId.toString())) {
      series.posts.push({ postId: postId.toString(), episodeNumber }); // postIdとepisodeNumberを設定
      await series.save();
    }

    // Post モデルの series フィールドにシリーズIDを追加
    // Post モデルの series フィールドを更新
    const post = await Post.findById(postId);
    if (post) {
      post.series = seriesId;
      await post.save();
    } else {
      return res.status(404).json({ message: '作品が見つかりませんでした。' });
    }
    res.status(200).json({ message: '作品がシリーズに追加されました。' });
  } catch (error) {
    console.error('Error adding post to series:', error);
    res.status(500).json({ message: 'シリーズに作品を追加できませんでした。', error });
  }
});
// シリーズ作成エンドポイント
app.post('/api/series', authenticateToken, async (req, res) => {
  try {
    const { title, description, tags, isOriginal, isAdultContent, aiGenerated } = req.body;

    const newSeries = new Series({
      title,
      description,
      tags,
      isOriginal,
      isAdultContent,
      aiGenerated,
      author: req.user._id,
    });

    const savedSeries = await newSeries.save();
    res.status(201).json(savedSeries);
  } catch (error) {
    console.error('Error creating series:', error);
    res.status(500).json({ message: 'シリーズ作成に失敗しました。' });
  }
});

// シリーズ一覧取得エンドポイント
app.get('/api/series', authenticateToken, async (req, res) => {
  try {
    const series = await Series.find({ author: req.user._id });
    res.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ message: 'シリーズ取得に失敗しました。' });
  }
});
// ユーザーの作品一覧を取得するエンドポイント
app.get('/api/user/me/works', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Userの作品リストを取得
    const works = await Post.find({ author: userId });

    if (!works) {
      return res.status(404).json({ message: '作品が見つかりませんでした。' });
    }

    res.status(200).json(works);
  } catch (error) {
    console.error('Error fetching user works:', error);
    res.status(500).json({ message: '作品の取得に失敗しました。' });
  }
});
// フォロワーリストを取得するエンドポイント
app.get('/api/user/followers', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('followers', 'nickname icon description');

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    res.status(200).json(user.followers);
  } catch (error) {
    console.error('フォロワーリストの取得に失敗しました:', error);
    res.status(500).json({ message: 'フォロワーリストの取得に失敗しました。' });
  }
});

// いいねした作品リストを取得するエンドポイント
app.get('/api/user/liked', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const likedPosts = await Good.find({ user: userId }).populate('post', 'title description author');

    res.status(200).json(likedPosts.map(good => good.post));
  } catch (error) {
    console.error('いいねした作品リストの取得に失敗しました:', error);
    res.status(500).json({ message: 'いいねした作品リストの取得に失敗しました。' });
  }
});

// 自分の本棚リストを取得するエンドポイント
app.get('/api/user/bookshelf', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('bookShelf', 'title description author');

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    res.status(200).json(user.bookShelf);
  } catch (error) {
    console.error('本棚リストの取得に失敗しました:', error);
    res.status(500).json({ message: '本棚リストの取得に失敗しました。' });
  }
});

// しおりリストを取得するエンドポイント
app.get('/api/user/bookmarks', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('bookmarks.novelId', 'title author');

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    res.status(200).json(user.bookmarks);
  } catch (error) {
    console.error('しおりリストの取得に失敗しました:', error);
    res.status(500).json({ message: 'しおりリストの取得に失敗しました。' });
  }
});
// フォローしているユーザーリストを取得するエンドポイント
app.get('/api/user/following', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('following', 'nickname icon description');

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }

    res.status(200).json(user.following);
  } catch (error) {
    console.error('フォローリストの取得に失敗しました:', error);
    res.status(500).json({ message: 'フォローリストの取得に失敗しました。' });
  }
});
// 本棚登録・解除のエンドポイント
app.post('/api/posts/:id/bookshelf', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりません。' });
    }

    const existingBookshelf = await User.findOne({ _id: req.user._id, bookShelf: post._id });
    let updatedBookshelfCounter;

    if (existingBookshelf) {


      // 本棚から削除
      await User.findByIdAndUpdate(req.user._id, { $pull: { bookShelf: post._id } });
      updatedBookshelfCounter = post.bookShelfCounter > 0 ? post.bookShelfCounter - 1 : 0;
      await Post.findByIdAndUpdate(req.params.id, { bookShelfCounter: updatedBookshelfCounter });
    } else {
      // 本棚に追加

      await User.findByIdAndUpdate(req.user._id, { $addToSet: { bookShelf: post._id } });
      updatedBookshelfCounter = post.bookShelfCounter + 1;
      await Post.findByIdAndUpdate(req.params.id, { bookShelfCounter: updatedBookshelfCounter });
    }

    res.json({ bookShelfCounter: updatedBookshelfCounter, isInBookshelf: !existingBookshelf });
  } catch (error) {
    console.error('Error toggling bookshelf:', error);
    res.status(500).json({ message: '本棚登録のトグルに失敗しました。', error });
  }
});

// 本棚登録状態の確認エンドポイント
app.get('/api/posts/:id/isInBookshelf', authenticateToken, async (req, res) => {
  try {
    const existingBookshelf = await User.findOne({ _id: req.user._id, bookShelf: req.params.id });
    res.json({ isInBookshelf: !!existingBookshelf });
  } catch (error) {
    console.error('Error checking bookshelf status:', error);
    res.status(500).json({ message: '本棚登録状態の確認に失敗しました。', error });
  }
});

// Bookmarkを保存または更新するためのエンドポイント
app.post('/api/users/bookmark', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id; // 認証されたユーザーのID
    const { novelId, position } = req.body;

    // ユーザーを取得
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりませんでした。' });
    }

    // 既存のしおりを検索
    const existingBookmark = user.bookmarks.find(bookmark => bookmark.novelId.toString() === novelId);

    if (existingBookmark) {
      // 既存のしおりを更新
      existingBookmark.position = position;
      existingBookmark.date = new Date();
    } else {
      // 新しいしおりを追加
      user.bookmarks.push({
        novelId,
        position,
        date: new Date(),
      });
    }

    // ユーザーを保存
    await user.save();

    res.status(200).json({ message: 'しおりが保存されました。' });
  } catch (error) {
    console.error('しおりの保存中にエラーが発生しました:', error);
    res.status(500).json({ message: 'しおりの保存に失敗しました。' });
  }
});
// フォロー機能の追加
// server.js 例

// ユーザーをフォローするエンドポイント
app.post('/api/users/follow/:id', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user._id;
    const followeeId = req.params.id;

    if (followerId.toString() === followeeId) {
      return res.status(400).json({ message: "自分自身をフォローすることはできません。" });
    }

    const followee = await User.findById(followeeId);
    const follower = await User.findById(followerId);

    if (!followee || !follower) {
      return res.status(404).json({ message: "ユーザーが見つかりません。" });
    }

    // フォロワーがすでにフォローしていない場合のみ追加
    if (!followee.followers.includes(followerId)) {
      followee.followers.push(followerId);
      await followee.save();
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
app.delete('/api/users/unfollow/:id', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user._id;
    const followeeId = req.params.id;

    const followee = await User.findById(followeeId);
    const follower = await User.findById(followerId);

    if (!followee || !follower) {
      return res.status(404).json({ message: "ユーザーが見つかりません。" });
    }

    // フォロワーリストから削除
    followee.followers = followee.followers.filter(
      (id) => id.toString() !== followerId.toString()
    );
    await followee.save();

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
app.get('/api/users/:id/is-following', authenticateToken, async (req, res) => {
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





// ユーザーのフォロワー数を取得
// ユーザー情報の取得
app.get('/api/users/:id', async (req, res) => {
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
// 人気タグの集計とキャッシュ
app.get('/api/tags/popular', async (req, res) => {
  try {
    // キャッシュから取得
    let tags = tagCache.get('popularTags');
    if (!tags) {
      // キャッシュにない場合はデータベースから集計
      const result = await Post.aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]);

      tags = result.map(tag => tag._id);
      tagCache.set('popularTags', tags); // 結果をキャッシュに保存
    }

    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: '人気タグの取得に失敗しました。' });
  }
});

// 作品の検索エンドポイント
// server.js に追加
app.get('/api/posts/search', async (req, res) => {
  try {
    const searchTerm = req.query.query;
    const posts = await Post.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } }
      ]
    }).populate('author', 'nickname icon'); // author を populate する

    res.json(posts);
  } catch (error) {
    console.error('検索エンドポイントでのエラー:', error);
    res.status(500).json({ message: '検索結果の取得に失敗しました。' });
  }
});


// ランキングエンドポイントの定義
app.get('/api/posts/ranking', async (req, res) => {
  try {
    // 全てのPostドキュメントにviewCounterフィールドが無い場合は0に初期化
    await Post.updateMany(
      { viewCounter: { $exists: false } },
      { $set: { viewCounter: 0 } }
    );

    // viewCounterが高い順に30件のポストを取得
    const posts = await Post.find().sort({ viewCounter: -1 }).limit(30);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching ranking:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.post('/api/posts/:id/view', async (req, res) => {
  const postId = req.params.id;
  const userId = req.user ? req.user._id.toString() : req.ip; // ログインユーザーかIPアドレスで区別

  const key = `${postId}:${userId}`;
  const lastViewed = viewTracking.get(key);

  const now = new Date();

  // 最後に閲覧してから5分未満の場合は何もしない
  if (lastViewed && (now - lastViewed) < 5 * 60 * 1000) {
    return res.status(200).json({ message: '閲覧数は更新されませんでした。' });
  }

  // 5分以上経過していれば閲覧数を増やす
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりません。' });
    }

    post.viewCounter += 1;
    await post.save();
    viewTracking.set(key, now); // 閲覧時間を更新

    res.status(200).json({ viewCounter: post.viewCounter });
  } catch (error) {
    console.error('Error updating view counter:', error);
    res.status(500).json({ message: '閲覧数の更新に失敗しました。', error });
  }
});
// server.js

// コメント投稿のエンドポイント
app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'コメントを入力してください。' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりません。' });
    }

    const newComment = {
      text,
      author: req.user._id, // コメントの作成者を保存
      createdAt: new Date()
    };

    // `comments`フィールドに新しいコメントを追加
    post.comments.push(newComment);

    // 他のフィールドを影響させないように、直接`post.comments`を更新
    await post.save({ validateBeforeSave: false });

    // 新しく追加されたコメントをポピュレートして返す
    const populatedPost = await Post.findById(req.params.id)
      .populate('comments.author', 'nickname icon');

    res.status(201).json(populatedPost.comments.slice(-5)); // 最新の5件を返す
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'コメントの追加に失敗しました。', error });
  }
});


app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('comments.author', 'nickname icon'); // `author`フィールドをポピュレート

    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりません。' });
    }

    res.json(post.comments.reverse()); // 最新のコメントが上に来るように逆順にして返す
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'コメントの取得に失敗しました。', error });
  }
});


// server.js
// server.js
app.post('/api/posts/:id/good', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりません。' });
    }

    // 既にいいねしているかどうかを確認
    const existingGood = await Good.findOne({ user: req.user._id, post: post._id });
    let updatedGoodCounter;

    if (existingGood) {
      // いいね解除
      await Good.deleteOne({ user: req.user._id, post: post._id });
      updatedGoodCounter = post.goodCounter - 1;
      await Post.findByIdAndUpdate(req.params.id, { goodCounter: updatedGoodCounter });
    } else {
      // いいね追加
      const newGood = new Good({ user: req.user._id, post: post._id });
      await newGood.save();
      updatedGoodCounter = post.goodCounter + 1;
      await Post.findByIdAndUpdate(req.params.id, { goodCounter: updatedGoodCounter });
    }

    res.json({ goodCounter: updatedGoodCounter, hasLiked: !existingGood });
  } catch (error) {
    console.error('Error toggling good:', error);
    res.status(500).json({ message: 'いいねのトグルに失敗しました。', error });
  }
});

// server.js
app.get('/api/posts/:id/isLiked', authenticateToken, async (req, res) => {
  try {
    const existingGood = await Good.findOne({ user: req.user._id, post: req.params.id });
    res.json({ hasLiked: !!existingGood });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ message: 'いいね状態の確認に失敗しました。', error });
  }
});

// 投稿の一覧を取得
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('author').exec();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: '投稿の取得に失敗しました。' });
  }
});

// 特定の投稿を取得
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author').exec();
    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりません。' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: '投稿の取得に失敗しました。' });
  }
});




// ユーザー情報を取得するエンドポイント
app.get('/api/users/:userId', async (req, res) => {
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
app.get('/api/users/:userId/works', async (req, res) => {
  try {
    const works = await Post.find({ author: req.params.userId });
    if (!works) {
      return res.status(404).json({ message: '作品が見つかりませんでした。' });
    }
    res.json(works);
  } catch (error) {
    console.error('Error fetching user works:', error);
    res.status(500).json({ message: '作品の取得に失敗しました。' });
  }
});
// 新規投稿エンドポイント
app.post('/api/posts', authenticateToken, async (req, res) => {
  const { title, content, description, tags, original,adultContent,aiGenerated, charCount, author, series } = req.body;

  // バリデーション
  if (!title || !content || !description || !tags || tags.length === 0 || aiGenerated === null || original === null || adultContent === null) {
    return res.status(400).json({ message: 'すべてのフィールドに入力してください。' });
  }

  try {
    // 新しい投稿の作成
    const newPost = new Post({
      title,
      content,
      description,
      tags,
      isOriginal: original,
      isAdultContent: adultContent,
      isAI: aiGenerated,      // フィールド名を isAI に変更
      wordCount: charCount,    // フィールド名を wordCount に変更
      author,
      series, // シリーズIDを追加
    });

    // データベースに保存
    const savedPost = await newPost.save();

    // シリーズが指定されている場合、そのシリーズに投稿を追加
    if (series) {
      await Series.findByIdAndUpdate(series, { $push: { posts: savedPost._id } });
    }

    // 成功レスポンスを返す
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({ message: '投稿に失敗しました。', error: error.message });
  }
});



// ユーザー登録エンドポイント
app.post('/api/register', upload.single('icon'), async (req, res) => {
  const { email, password, nickname, dob, gender } = req.body;
  const iconPath = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, nickname, icon: iconPath, dob, gender });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, 'secret_key', { expiresIn: '1d' });
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Error registering user', error: err });
  }
});
// メールアドレス重複チェックエンドポイント
app.post('/api/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    res.json({ exists: !!existingUser });
  } catch (err) {
    console.error('Error checking email:', err);
    res.status(500).json({ message: 'Error checking email', error: err });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Login attempt with email:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('No user found with this email');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('User found:', user);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password does not match');
      console.log(password);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, 'secret_key', { expiresIn: '1h' });
    console.log('Login successful, token generated');
    res.json({ token });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ message: 'Error logging in user', error: err });
  }
});
// ミドルウェアを使用するルートの例
app.get('/api/user/me', authenticateToken, (req, res) => {
  res.json(req.user); // 認証されたユーザー情報を返す
});
app.post('/api/user/:id/update', authenticateToken, upload.single('icon'), async (req, res) => {
  try {
    const { id } = req.params;
    // 既存ユーザー情報を取得
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 更新データの準備
    const updateData = {
      nickname: req.body.nickname,
      description: req.body.description || "",  // デフォルト値を設定
      xLink: req.body.xLink || "",              // デフォルト値を設定
      pixivLink: req.body.pixivLink || "",      // デフォルト値を設定
      otherLink: req.body.otherLink || "",      // デフォルト値を設定
    };

    // アイコンがアップロードされた場合は、iconフィールドを追加
    if (req.file) {
      // 古いアイコンを削除
      if (user.icon && user.icon !== `/uploads/default.png`) { // デフォルト画像は削除しない
        const oldIconPath = path.join(__dirname, user.icon);
        fs.unlink(oldIconPath, (err) => {
          if (err) {
            console.error('Failed to delete old icon:', err);
          }
        });
      }

      // 新しいアイコンパスを更新データに追加
      updateData.icon = `/uploads/${req.file.filename}`;
    }
    // ユーザー情報の更新
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, upsert: true });

    res.json(updatedUser); // 更新されたユーザー情報を返す
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err });
  }
});


app.listen(5000, () => {
  console.log(`Server is running on port 5000`);
});