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



// 一括更新エンドポイント
router.post('/bulk-update', authenticateToken, async (req, res) => {
  try {
    const { postIds, action } = req.body;
    const userId = req.user._id;

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({ message: '更新する作品を選択してください' });
    }

    const posts = await Post.find({ 
      _id: { $in: postIds }, 
      author: userId 
    });

    if (posts.length === 0) {
      return res.status(404).json({ message: '更新可能な作品が見つかりません' });
    }

    // publicityStatus のみを更新
    let updateData = {};
    switch (action) {
      case 'public':
        updateData = { publicityStatus: 'public' };
        break;
      case 'limited':
        updateData = { publicityStatus: 'limited' };
        break;
      case 'private':
        updateData = { publicityStatus: 'private' };
        break;
      default:
        return res.status(400).json({ message: '無効な操作です' });
    }

    const result = await Post.updateMany(
      { _id: { $in: posts.map(p => p._id) } },
      { $set: updateData }
    );

    res.json({ 
      message: `${result.modifiedCount}件の作品を更新しました`,
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('一括更新エラー:', error);
    res.status(500).json({ message: '一括更新に失敗しました' });
  }
});
// 一括削除エンドポイント
router.post('/bulk-delete', authenticateToken, async (req, res) => {
  try {
    const { postIds } = req.body;
    const userId = req.user._id;

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({ message: '削除する作品を選択してください' });
    }

    // 自分の作品のみを対象とする
    const posts = await Post.find({ 
      _id: { $in: postIds }, 
      author: userId 
    });

    if (posts.length === 0) {
      return res.status(404).json({ message: '削除可能な作品が見つかりません' });
    }

    const postIdsToDelete = posts.map(p => p._id);

    // 作品削除
    await Post.deleteMany({ _id: { $in: postIdsToDelete } });

    // 対応するViewAnalyticsも削除
    await ViewAnalytics.deleteMany({ postId: { $in: postIdsToDelete } });

    res.json({ 
      message: `${posts.length}件の作品を削除しました`,
      deletedCount: posts.length
    });

  } catch (error) {
    console.error('一括削除エラー:', error);
    res.status(500).json({ message: '一括削除に失敗しました' });
  }
});
// ランキングエンドポイントの定義
router.get('/ranking', async (req, res) => {
  try {
    // 全てのPostドキュメントにviewCounterフィールドが無い場合は0に初期化
    await Post.updateMany(
      { viewCounter: { $exists: false } },
      { $set: { viewCounter: 0 } }
    );

    // 公開作品のみでランキング生成（限定公開は除外）
    const posts = await Post.find({ 
      publicityStatus: 'public' 
    })
      .populate('author')
      .sort({ viewCounter: -1 })
      .limit(30);
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching ranking:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//// 投稿の一覧を取得
//router.get('/', async (req, res) => {
//  try {
//    // クエリパラメータからページ番号を取得。デフォルトは1ページ目。
//    const page = parseInt(req.query.page) || 1;
//    const postsPerPage = 20; // 1ページあたりの投稿数
//
//    // 投稿数をカウント
//    const totalPosts = await Post.countDocuments();
//
//    // 投稿を取得 (ページネーション対応)
//    const posts = await Post.find()
//      .populate('author')
//      .populate('series')   // シリーズ情報を取得
//      .sort({ createdAt: -1 }) // 新しい投稿から順に取得
//      .skip((page - 1) * postsPerPage) // スキップする件数
//      .limit(postsPerPage); // 取得する件数を制限
//
//    // レスポンスとして投稿データと総投稿数を返す
//    res.json({
//      posts,
//      totalPosts,
//      totalPages: Math.ceil(totalPosts / postsPerPage), // 総ページ数を計算
//      currentPage: page,
//    });
//  } catch (error) {
//    console.error('Error fetching posts:', error);
//    res.status(500).json({ message: '投稿の取得に失敗しました。' });
//  }
//});
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 公開作品のみを取得（限定公開は検索結果に含めない）
    const posts = await Post.find({ 
      publicityStatus: 'public' // publicityStatus のみ使用
    })
      .populate('author', 'nickname icon')
      .populate('series')   // シリーズ情報を取得
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ 
      publicityStatus: 'public' 
    });

    res.json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('投稿取得エラー:', error);
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
//// 特定の投稿を取得
//router.get('/:id([0-9a-fA-F]{24})', async (req, res) => {
//  try {
//    const post = await Post.findById(req.params.id).populate('author').exec();
//    if (!post) {
//      return res.status(404).json({ message: '投稿が見つかりません。' });
//    }
//    res.json(post);
//  } catch (error) {
//    res.status(500).json({ message: '投稿の取得に失敗しました。' });
//  }
//});
// 新規投稿エンドポイント

// 個別作品取得時のアクセス制御

// 個別作品取得時のアクセス制御（詳細なログ付き）
router.get('/:id([0-9a-fA-F]{24})', authenticateToken, async (req, res) => {
 try {
   const post = await Post.findById(req.params.id).populate('author').exec();
   
   if (!post) {
     return res.status(404).json({ message: '投稿が見つかりません。' });
   }

   // 作者かどうかをチェック
   const isAuthor = req.user && req.user._id && post.author && post.author._id && 
                    req.user._id.toString() === post.author._id.toString();

   // アクセス制御ロジック
   if (post.publicityStatus === 'private' && !isAuthor) {
     return res.status(403).json({ message: 'この作品にはアクセスできません。' });
   }
   
   res.json(post);
 } catch (error) {
   console.error('作品取得エラー:', error);
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
    publicityStatus,    // isPublic削除
    allowComments // コメント許可/禁止設定
  } = req.body;

  console.log(adultContent);
  
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
      publicityStatus: publicityStatus || 'public',  // isPublic削除
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
router.post('/:id([0-9a-fA-F]{24})/update', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const { 
      title, 
      content, 
      description, 
      tags, 
      original, 
      adultContent, 
      aiGenerated, 
      aiEvidence,
      charCount,
      series,
      imageCount,
      publicityStatus,
      allowComments
    } = req.body;

    console.log('Update request body:', req.body);

    // 投稿をデータベースから取得し、認証チェック
    const post = await Post.findOne({ _id: postId, author: userId });

    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりませんでした。または編集権限がありません。' });
    }

    // バリデーション
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'タイトルは必須です。' });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'コンテンツは必須です。' });
    }
    
    if (!description || !description.trim()) {
      return res.status(400).json({ message: '作品説明は必須です。' });
    }
    
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ message: 'タグは少なくとも1つ必要です。' });
    }
    
    if (original === null || original === undefined) {
      return res.status(400).json({ message: 'オリジナル作品の設定は必須です。' });
    }
    
    if (adultContent === null || adultContent === undefined) {
      return res.status(400).json({ message: '年齢制限の設定は必須です。' });
    }
    
    if (aiGenerated === null || aiGenerated === undefined) {
      return res.status(400).json({ message: 'AI生成の設定は必須です。' });
    }

    // AI生成の場合、AI関連情報のバリデーション
    if (aiGenerated) {
      if (!aiEvidence || !aiEvidence.tools || !Array.isArray(aiEvidence.tools) || aiEvidence.tools.length === 0) {
        return res.status(400).json({ message: 'AI生成の場合、使用したAIツールの情報は必須です。' });
      }
      
      if (!aiEvidence.description || !aiEvidence.description.trim()) {
        return res.status(400).json({ message: 'AI生成の場合、使用説明は必須です。' });
      }
    }

    // 既存のシリーズから削除（シリーズが変更された場合）
    if (post.series && post.series.toString() !== (series || '')) {
      try {
        await Series.findByIdAndUpdate(
          post.series, 
          { $pull: { posts: { postId: postId } } }
        );
      } catch (error) {
        console.warn('旧シリーズからの削除でエラー:', error);
      }
    }

    // 投稿の各フィールドを更新
    post.title = title.trim();
    post.content = content;
    post.description = description.trim();
    post.tags = tags;
    post.isOriginal = Boolean(original);
    post.isAdultContent = Boolean(adultContent);
    post.isAI = Boolean(aiGenerated);
    
    // AI証拠情報の更新
    if (aiGenerated && aiEvidence) {
      post.aiEvidence = {
        tools: aiEvidence.tools,
        url: aiEvidence.url || null,
        description: aiEvidence.description
      };
    } else if (!aiGenerated) {
      // AI生成でない場合はaiEvidenceをクリア
      post.aiEvidence = null;
    }
    
    post.wordCount = charCount || 0;
    post.imageCount = imageCount || 0;
    post.publicityStatus = publicityStatus || 'public';
    post.allowComments = allowComments !== undefined ? Boolean(allowComments) : true;
    post.series = series || null;
    post.updatedAt = new Date();

    // 更新内容を保存（これでpost('save')フックが発火してES更新される）
    await post.save();

    // Elasticsearchに手動で更新を送信（保険として）
    try {
      const { getEsClient } = require('../utils/esClient');
      const sanitizeHtml = require('sanitize-html');
      const esClient = getEsClient();
      
      if (esClient) {
        const cleanContent = sanitizeHtml(post.content, {
          allowedTags: [],
          allowedAttributes: {}
        });
        
        const esBody = {
          title: post.title,
          content: cleanContent,
          description: post.description,
          tags: post.tags || [],
          author: post.author.toString(),
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        };

        // aiEvidenceフィールドがある場合は追加
        if (post.aiEvidence) {
          esBody.aiEvidence = {
            tools: post.aiEvidence.tools || [],
            url: post.aiEvidence.url || '',
            description: post.aiEvidence.description || ''
          };
        }

        await esClient.index({
          index: 'posts',
          id: post._id.toString(),
          body: esBody,
        });
        
        console.log('✅ Post updated in Elasticsearch:', post._id);
      }
    } catch (esError) {
      console.warn('⚠️ Elasticsearch update failed (but MongoDB updated):', esError.message);
    }

    // 新しいシリーズに追加（シリーズが指定された場合）
    if (series && series !== post.series) {
      try {
        const seriesDoc = await Series.findById(series);
        if (seriesDoc) {
          // 重複チェック
          const existingPost = seriesDoc.posts.find(p => p.postId && p.postId.toString() === postId);
          if (!existingPost) {
            // エピソード番号を設定（既存の最大値 + 1）
            const maxEpisode = seriesDoc.posts.length > 0 
              ? Math.max(...seriesDoc.posts.map(p => p.episodeNumber || 0)) 
              : 0;
            
            seriesDoc.posts.push({
              postId: postId,
              episodeNumber: maxEpisode + 1
            });
            await seriesDoc.save();
          }
        }
      } catch (error) {
        console.warn('新シリーズへの追加でエラー:', error);
      }
    }

    // 更新された投稿を返す
    const updatedPost = await Post.findById(postId)
      .populate('author', 'nickname')
      .populate('series', 'title');

    res.status(200).json({ 
      message: '投稿が更新されました。', 
      post: updatedPost 
    });

  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ 
      message: '投稿の更新に失敗しました。', 
      error: error.message 
    });
  }
});
// 特定の投稿の編集用詳細を取得するエンドポイント（完全修正版）
router.get('/:id([0-9a-fA-F]{24})/edit', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    // 投稿を探し、かつその投稿のauthorが現在のユーザーであるかを確認
    const post = await Post.findOne({ _id: postId, author: userId })
      .populate('series', '_id title')
      .populate('author', 'nickname');

    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりませんでした。または編集権限がありません。' });
    }

    // フロントエンド用にデータを整形
    const editData = {
      _id: post._id,
      title: post.title,
      content: post.content,
      description: post.description,
      tags: post.tags || [],
      original: post.isOriginal !== undefined ? post.isOriginal : null,
      adultContent: post.isAdultContent !== undefined ? post.isAdultContent : null,
      aiGenerated: post.isAI !== undefined ? post.isAI : null,
      aiEvidence: post.aiEvidence || {
        tools: [],
        url: '',
        description: ''
      },
      charCount: post.wordCount || 0,
      imageCount: post.imageCount || 0,
      publicityStatus: post.publicityStatus || 'public',
      allowComments: post.allowComments !== undefined ? post.allowComments : true,
      series: post.series ? post.series._id : null,
      seriesTitle: post.series ? post.series.title : null,
      author: post.author,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    };

    res.status(200).json(editData);

  } catch (error) {
    console.error('Error fetching post details for edit:', error);
    res.status(500).json({ 
      message: '投稿の取得に失敗しました。', 
      error: error.message 
    });
  }
});

// 検索エンドポイント
router.get('/search', async (req, res) => {
  try {
    if (!esClient) {
      console.error('[ERROR] Elasticsearch クライアントが初期化されていません');
      return res.status(500).json({ message: 'Elasticsearch クライアントが初期化されていません。' });
    }

    console.log('[INFO] 検索開始: ', req.query.mustInclude);

    // ページネーションのパラメータ
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const from = (page - 1) * size;

    const mustInclude = req.query.mustInclude || '';
    const shouldInclude = req.query.shouldInclude || '';
    const mustNotInclude = req.query.mustNotInclude || '';
    const fields = req.query.fields ? req.query.fields.split(',') : ['title', 'content', 'tags'];
    const tagSearchType = req.query.tagSearchType || 'partial';

    // 検索キーワードを分割
    const mustIncludeTerms = mustInclude.split(/\s+/).filter(term => term.trim() !== "");
    const shouldIncludeTerms = shouldInclude.split(/\s+/).filter(term => term.trim() !== "");
    const mustNotIncludeTerms = mustNotInclude.split(/\s+/).filter(term => term.trim() !== "");

    // Elasticsearch のクエリ構築
    let query = { 
      bool: { 
        must: [], 
        should: [], 
        must_not: [], 
        filter: [
          { term: { "publicityStatus": "public" } } // 公開のみを検索対象に
        ]
      } 
    };

    // AND検索 (must)
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

    // OR検索 (should)
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

    // 除外検索 (must_not)
    if (mustNotIncludeTerms.length > 0) {
      query.bool.must_not = mustNotIncludeTerms.map(term => ({
        multi_match: {
          query: term,
          fields: fields,
          fuzziness: "AUTO"
        }
      }));
    }

    // Elasticsearch 検索実行
    const response = await esClient.search({
      index: 'posts',
      body: {
        query,
        from: from,
        size: size,
        highlight: {  
          fields: {
            title: {},
            content: {}
          }
        }
      }
    });

    const postIds = response.hits.hits.map(hit => hit._id);
    const totalHits = response.hits.total.value;

    console.log(`[INFO] Elasticsearch から取得した _id の数: ${postIds.length}`);

    if (postIds.length === 0) {
      return res.json({ posts: [], total: 0, page, size });
    }

    // MongoDB からデータを取得
    const posts = await Post.find({ _id: { $in: postIds } })
      .populate('author')
      .populate('series')
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
        match: { 
          $or: [
            { publicityStatus: 'public' },
            { publicityStatus: 'limited' },
            { author: userId } // 自分の作品は公開設定に関係なく表示
          ]
        },
        select: 'title description author series tags viewCounter goodCounter bookShelfCounter wordCount isAdultContent isAI isOriginal aiEvidence publicityStatus',
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

    // nullでない投稿のみをフィルタリング
    const validLikedPosts = likedPosts
      .filter(good => good.post !== null)
      .map(good => good.post);

    res.status(200).json(validLikedPosts);
  } catch (error) {
    console.error('いいねした作品リストの取得に失敗しました:', error);
    res.status(500).json({ message: 'いいねした作品リストの取得に失敗しました。' });
  }
});


// いいね機能
router.post('/:id([0-9a-fA-F]{24})/good', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '投稿が見つかりません。' });
    }

    // 非公開作品へのいいねは作者以外不可
    const isAuthor = req.user._id.toString() === post.author.toString();
    if (post.publicityStatus === 'private' && !isAuthor) {
      return res.status(403).json({ message: 'この作品にはアクセスできません。' });
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
    console.log(req.user._id);

  } catch (error) {
    console.error('Error toggling good:', error);
    res.status(500).json({ message: 'いいねのトグルに失敗しました。', error });
  }
});

// いいね状態確認
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

