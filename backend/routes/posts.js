// routes/post.js

const express = require('express');
const rateLimit = require('express-rate-limit');
const authenticateToken = require('../middlewares/authenticateToken');
const User = require('../models/User');
const Post = require('../models/Post');
const Good = require('../models/Good');
const ViewAnalytics = require('../models/ViewAnalytics');
const Series = require('../models/Series');
const Follow = require('../models/Follow');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const cron = require('node-cron');
const { client: redisClient } = require('../utils/redisClient');
const { getEsClient } = require('../utils/esClient');
const NotificationGenerator = require('../utils/notificationGenerator');

const esClient = getEsClient();

// メモリキャッシュとバッチ処理の設定
//const VIEW_CACHE = new Map();
//const CACHE_TTL = 300; // 秒
//const MAX_BATCH_SIZE = 500;
//let viewBatch = [];
//let processingBatch = false;
//
//// 個別の:idに対するRate Limiter
//const viewRateLimiter = rateLimit({
//  windowMs: 1 * 60 * 1000, // 1分間
//  max: 5, // 同じIDに対して5リクエストまで
//  keyGenerator: (req) => `${req.params.id}:${req.ip}`, // リクエストを制限するキーを生成
//  message: { message: '1分間に5回以上リクエストすることはできません。' },
//  standardHeaders: true,
//  legacyHeaders: false,
//});
//
//// バッチ処理関数
//const processViewBatch = async () => {
//  if (viewBatch.length === 0 || processingBatch) return;
//  
//  processingBatch = true;
//  const batch = [...viewBatch];
//  viewBatch = [];
//  
//  try {
//    // 1. 同じpostIdの閲覧をまとめる
//    const postCounts = {};
//    const userViews = [];
//    
//    batch.forEach(view => {
//      postCounts[view.postId] = (postCounts[view.postId] || 0) + 1;
//      
//      if (view.userId) {
//        userViews.push({
//          userId: view.userId,
//          postId: view.postId,
//          timestamp: view.timestamp
//        });
//      }
//    });
//    
//    // 2. Redisで複数の操作をパイプライン化
//    const pipeline = redisClient.pipeline();
//    
//    // 各投稿のカウンターを更新
//    Object.entries(postCounts).forEach(([postId, count]) => {
//      // カウンター増加
//      pipeline.hincrby(`post:${postId}:counters`, 'viewCounter', count);
//      // 同期フラグ設定
//      pipeline.hset(`post:${postId}:counters`, 'pendingSync', '1');
//      // キーの有効期限設定（1日）
//      pipeline.expire(`post:${postId}:counters`, 86400);
//      
//      // アクティブな投稿リストを更新
//      pipeline.zadd('active:posts', Date.now(), postId);
//    });
//    
//    // ユーザー閲覧履歴を更新（重複を防ぐため、ユーザーごとに最新の閲覧のみ）
//    const userPostMap = new Map();
//    userViews.forEach(view => {
//      userPostMap.set(`${view.userId}-${view.postId}`, view);
//    });
//    
//    Array.from(userPostMap.values()).forEach(view => {
//      // ユーザーの閲覧履歴に追加
//      pipeline.zadd(`user:${view.userId}:viewHistory`, view.timestamp, view.postId);
//      // 最新50件のみを保持
//      pipeline.zremrangebyrank(`user:${view.userId}:viewHistory`, 0, -51);
//    });
//    
//    // 3. 分析サービスにイベントを送信
//    batch.forEach(view => {
//      // イベントストリームに追加
//      pipeline.xadd(
//        'events:views',
//        '*', // 自動ID生成
//        'postId', view.postId,
//        'userId', view.userId || '',
//        'sessionId', view.sessionId || '',
//        'userAgent', view.userAgent || '',
//        'ip', view.ip || '',
//        'timestamp', view.timestamp
//      );
//    });
//    
//    // ストリームサイズ制限
//    pipeline.xtrim('events:views', 'MAXLEN', '~', 100000);
//    
//    // パイプライン実行
//    await pipeline.exec();
//    
//  } catch (error) {
//    console.error('View batch processing error:', error);
//    // エラー時は処理できなかったバッチを再キューイング（データロス防止）
//    if (batch.length > 0) {
//      viewBatch.unshift(...batch);
//      // バッファが大きすぎる場合は古いデータを破棄
//      if (viewBatch.length > MAX_BATCH_SIZE * 2) {
//        viewBatch = viewBatch.slice(0, MAX_BATCH_SIZE);
//      }
//    }
//  } finally {
//    processingBatch = false;
//    
//    // 残りのバッチがある場合は処理を続行
//    if (viewBatch.length > 0) {
//      setTimeout(processViewBatch, 10);
//    }
//  }
//};
//
//// 定期的なバッチ処理
//setInterval(processViewBatch, 2000);
//
//// キャッシュクリーンアップ関数
//function cleanupViewCache() {
//  const now = Date.now();
//  for (const [key, entry] of VIEW_CACHE.entries()) {
//    if (now - entry.timestamp > CACHE_TTL * 1000) {
//      VIEW_CACHE.delete(key);
//    }
//  }
//}
//
//// 定期的なキャッシュクリーンアップ
//setInterval(cleanupViewCache, 60000);
//
//// 超最適化された閲覧カウントエンドポイント
//router.post('/:id([0-9a-fA-F]{24})/view', viewRateLimiter, (req, res) => {
//  const postId = req.params.id;
//  const userId = req.user?._id?.toString();
//  const sessionId = req.cookies?.sessionId || req.session?.id || req.ip;
//  const userAgent = req.headers['user-agent'];
//  const ip = req.ip;
//  
//  // 閲覧の一意性を判断するキー（5分間の時間枠でグループ化）
//  const cacheKey = `${postId}:${userId || sessionId}:${Math.floor(Date.now() / (CACHE_TTL * 1000))}`;
//  
//  // メモリキャッシュでユニーク判定（超高速）
//  if (VIEW_CACHE.has(cacheKey)) {
//    // 非ユニーク閲覧
//    return res.status(200).json({ success: true, unique: false });
//  }
//  
//  // 現在のタイムスタンプ
//  const timestamp = Date.now();
//  
//  // キャッシュに保存
//  VIEW_CACHE.set(cacheKey, { timestamp });
//  
//  // バッチに追加
//  viewBatch.push({
//    postId,
//    userId,
//    sessionId,
//    userAgent,
//    ip,
//    timestamp
//  });
//  
//  // バッチサイズが閾値を超えたら即時処理
//  if (viewBatch.length >= MAX_BATCH_SIZE && !processingBatch) {
//    setTimeout(processViewBatch, 0);
//  }
//  
//  // 即座にレスポンスを返す
//  res.status(200).json({ success: true, unique: true });
//});
//
//// MongoDBとRedisの同期ジョブ
//cron.schedule('*/2 * * * *', async () => {
//  try {
//    // pendingSyncフラグがある投稿カウンターを取得
//    const keys = await redisClient.keys('post:*:counters');
//    
//    if (keys.length === 0) return;
//    
//    for (const key of keys) {
//      try {
//        const postId = key.split(':')[1];
//        const counters = await redisClient.hgetall(key);
//        
//        // 同期フラグがある場合のみ処理
//        if (counters && counters.viewCounter && counters.pendingSync === '1') {
//          const viewCount = parseInt(counters.viewCounter, 10);
//          
//          // MongoDBを更新
//          await Post.findByIdAndUpdate(postId, { viewCounter: viewCount });
//          
//          // 同期フラグをクリア
//          await redisClient.hdel(key, 'pendingSync');
//          
//          console.log(`Synced view count for post ${postId}: ${viewCount}`);
//        }
//      } catch (err) {
//        console.error(`Error syncing post ${key.split(':')[1]}:`, err);
//      }
//    }
//  } catch (error) {
//    console.error('Error during view count sync job:', error);
//  }
//});

// ランキングエンドポイントの定義
router.get('/ranking', async (req, res) => {
  try {
    // 全てのPostドキュメントにviewCounterフィールドが無い場合は0に初期化
    await Post.updateMany(
      { viewCounter: { $exists: false } },
      { $set: { viewCounter: 0 } }
    );

    // viewCounterが高い順に30件のポストを取得
    const posts = await Post.find().populate('author').sort({ viewCounter: -1 }).limit(30);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching ranking:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// 投稿の一覧を取得
router.get('/', async (req, res) => {
  try {
    // クエリパラメータからページ番号を取得。デフォルトは1ページ目。
    const page = parseInt(req.query.page) || 1;
    const postsPerPage = 20; // 1ページあたりの投稿数

    // 投稿数をカウント
    const totalPosts = await Post.countDocuments();

    // 投稿を取得 (ページネーション対応)
    const posts = await Post.find()
      .populate('author')
      .populate('series')   // シリーズ情報を取得
      .sort({ createdAt: -1 }) // 新しい投稿から順に取得
      .skip((page - 1) * postsPerPage) // スキップする件数
      .limit(postsPerPage); // 取得する件数を制限

    // レスポンスとして投稿データと総投稿数を返す
    res.json({
      posts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / postsPerPage), // 総ページ数を計算
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: '投稿の取得に失敗しました。' });
  }
});

router.get('/tag/:tag', async (req, res) => {
  try {
    const { tag } = req.params;
    const page = parseInt(req.query.page) || 1;
    const postsPerPage = 10;  // 1ページに表示する投稿数

    // 🔍 Elasticsearch で該当タグの投稿を検索
    const esResponse = await esClient.search({
      index: 'posts',
      body: {
        query: {
          term: { "tags": tag }  // ✅ 完全一致検索
        },
        from: (page - 1) * postsPerPage,
        size: postsPerPage,
        sort: [{ createdAt: "desc" }]  // ✅ 投稿日時の降順
      }
    });

    const totalPosts = esResponse.hits.total.value;
    const postIds = esResponse.hits.hits.map(hit => hit._id);

    // 🔄 MongoDB から投稿データを取得
    const posts = await Post.find({ _id: { $in: postIds } })
      .populate('author')
      .populate('series');

    res.json({
      posts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / postsPerPage),
      currentPage: page,
    });

  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    res.status(500).json({ message: 'タグに関連する投稿の取得に失敗しました。' });
  }
});
// 特定の投稿を取得
router.get('/:id([0-9a-fA-F]{24})', async (req, res) => {
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
// 新規投稿エンドポイント
router.post('/', authenticateToken, async (req, res) => {
  const { 
    title, 
    content, 
    description, 
    tags, 
    original, 
    adultContent, 
    aiGenerated, 
    aiEvidence,  // AIツール情報と説明を含むオブジェクト
    charCount, 
    imageCount,  // 画像数を追加
    author, 
    series,
    isPublic,    // 公開/非公開設定
    allowComments // コメント許可/禁止設定
  } = req.body;
  console.log(adultContent)
  // バリデーション
  if (!title || !content || !description || !tags || tags.length === 0 || original === null || adultContent === null) {
    return res.status(400).json({ message: 'すべてのフィールドに入力してください。' });
  }
  // AIツール関連のバリデーション（aiGenerated は常にtrue）
  if (!aiEvidence || !aiEvidence.tools || aiEvidence.tools.length === 0 || !aiEvidence.description) {
    return res.status(400).json({ message: 'AI使用に関する情報は必須です。' });
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
      isAI: true,      // フィールド名を isAI に変更
      aiEvidence: {
        tools: aiEvidence.tools,  // 使用したAIツールのリスト
        url: aiEvidence.url,      // 証明URL（オプショナル）
        description: aiEvidence.description  // 使用説明
      },
      imageCount: imageCount || 0, // 画像数（指定がなければ0）

      wordCount: charCount,    // フィールド名を wordCount に変更
      author,
      series, // シリーズIDを追加
      isPublic: isPublic !== undefined ? isPublic : true,  // デフォルトは公開
      allowComments: allowComments !== undefined ? allowComments : true,  // デフォルトはコメント許可
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // データベースに保存
    const savedPost = await newPost.save();
    await NotificationGenerator.generateNewPostNotification(savedPost);

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
// 特定の投稿を更新するエンドポイント
router.post('/:id([0-9a-fA-F]{24})/update', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content, description, tags, original, adultContent, aiGenerated, charCount } = req.body;

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
// 特定の投稿の詳細を取得するエンドポイント
router.get('/:id([0-9a-fA-F]{24})/edit', authenticateToken, async (req, res) => {
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


router.get('/search', async (req, res) => {
  try {
    if (!esClient) {
      console.error('[ERROR] Elasticsearch クライアントが初期化されていません');
      return res.status(500).json({ message: 'Elasticsearch クライアントが初期化されていません。' });
    }

    console.log('[INFO] 検索開始: ', req.query.mustInclude);

    // 🌟 ページネーションのパラメータ
    const page = parseInt(req.query.page) || 1;  // 1ページ目をデフォルト
    const size = parseInt(req.query.size) || 10; // 1ページあたり10件 (デフォルト)
    const from = (page - 1) * size; // スキップする件数

    const mustInclude = req.query.mustInclude || '';
    const shouldInclude = req.query.shouldInclude || '';
    const mustNotInclude = req.query.mustNotInclude || '';
    const fields = req.query.fields ? req.query.fields.split(',') : ['title', 'content', 'tags'];
    const tagSearchType = req.query.tagSearchType || 'partial';

    // 🔍 検索キーワードを分割
    const mustIncludeTerms = mustInclude.split(/\s+/).filter(term => term.trim() !== "");
    const shouldIncludeTerms = shouldInclude.split(/\s+/).filter(term => term.trim() !== "");
    const mustNotIncludeTerms = mustNotInclude.split(/\s+/).filter(term => term.trim() !== "");

    // ✅ Elasticsearch のクエリ構築
    let query = { bool: { must: [], should: [], must_not: [], filter: [] } };

    // 🎯 AND検索 (must)
    if (mustIncludeTerms.length > 0) {
      query.bool.must = mustIncludeTerms.map(term => ({
        multi_match: {
          query: term,
          fields: fields,
          fuzziness: "AUTO",
          operator: "and"
        }
      }));
    }

    // 🎯 OR検索 (should)
    if (shouldIncludeTerms.length > 0) {
      query.bool.should = shouldIncludeTerms.map(term => ({
        multi_match: {
          query: term,
          fields: fields,
          fuzziness: "AUTO",
          operator: "or"
        }
      }));
    }

    // 🎯 除外検索 (must_not)
    if (mustNotIncludeTerms.length > 0) {
      query.bool.must_not = mustNotIncludeTerms.map(term => ({
        multi_match: {
          query: term,
          fields: fields,
          fuzziness: "AUTO"
        }
      }));
    }

    // 🔍 Elasticsearch 検索実行
    const response = await esClient.search({
      index: 'posts',
      body: {
        query,
        from: from, // ✅ ページネーション
        size: size, // ✅ 取得件数
        highlight: {  
          fields: {
            title: {},
            content: {}
          }
        }
      }
    });

    const postIds = response.hits.hits.map(hit => hit._id);
    const totalHits = response.hits.total.value; // 全件数を取得

    console.log(`[INFO] Elasticsearch から取得した _id の数: ${postIds.length}`);

    if (postIds.length === 0) {
      return res.json({ posts: [], total: 0, page, size });
    }

    // 🔄 MongoDB からデータを取得
    const posts = await Post.find({ _id: { $in: postIds } })
      .populate('author')
      .populate('series')   // シリーズ情報を取得
      .lean();

    console.log(`✅ MongoDB から取得したデータ数: ${posts.length}`);

    res.json({ posts, total: totalHits, page, size });
  } catch (error) {
    console.error('❌ 検索エンドポイントでのエラー:', error);
    res.status(500).json({ message: '検索結果の取得に失敗しました。' });
  }
});


// いいねした作品リストを取得するエンドポイント
router.get('/user/liked', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const likedPosts = await Good.find({ user: userId })
    .populate({
      path: 'post',
      select: 'title description author series tags viewCounter goodCounter bookShelfCounter wordCount isAdultContent isAI isOriginal aiEvidence',
      populate: [
        {
          path: 'author',
          select: 'nickname icon'
        },
        {
          path: 'series',
          select: 'title _id'
        }
      ]
    });

    res.status(200).json(likedPosts.map(good => good.post));
  } catch (error) {
    console.error('いいねした作品リストの取得に失敗しました:', error);
    res.status(500).json({ message: 'いいねした作品リストの取得に失敗しました。' });
  }
});

// server.js
router.post('/:id([0-9a-fA-F]{24})/good', authenticateToken, async (req, res) => {
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
      await NotificationGenerator.generateLikeNotification(req.user._id, post);

    }

    res.json({ goodCounter: updatedGoodCounter, hasLiked: !existingGood });
    console.log(req.user._id)

  } catch (error) {
    console.error('Error toggling good:', error);
    res.status(500).json({ message: 'いいねのトグルに失敗しました。', error });
  }
});
// server.js
router.get('/:id([0-9a-fA-F]{24})/isLiked', authenticateToken, async (req, res) => {
  try {
    const existingGood = await Good.findOne({ user: req.user._id, post: req.params.id });
    res.json({ hasLiked: !!existingGood });


  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ message: 'いいね状態の確認に失敗しました。', error });
  }
});

module.exports = router;

