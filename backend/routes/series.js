// routes/series.js

const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const User = require('../models/User');
const Post = require('../models/Post');
const Good = require('../models/Good');
const Series = require('../models/Series');
const Follow = require('../models/Follow'); // Followモデルのインポート

const router = express.Router();

router.get('/:id([0-9a-fA-F]{24})/works', async (req, res) => {
  try {
    const seriesId = req.params.id;

    // シリーズを取得し、投稿とその作者情報を完全にpopulateして取得
    const series = await Series.findById(seriesId)
      .populate({
        path: 'posts.postId',
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
      })
      .populate('author', '_id nickname icon'); // シリーズの作者情報も取得

    if (!series) {
      console.log('Series not found:', seriesId);
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    console.log('Series found:', series.title);

    // シリーズ情報をレスポンスに含める
    const seriesInfo = {
      _id: series._id,
      title: series.title,
      description: series.description,
      tags: series.tags,
      isOriginal: series.isOriginal,
      isAdultContent: series.isAdultContent,
      aiGenerated: series.aiGenerated,
      author: series.author, // 作者情報
      createdAt: series.createdAt
    };

    // シリーズ内の投稿情報を取得して整理
    const works = series.posts
      .filter(post => {
        const hasPostId = !!post.postId;
        return hasPostId; // postIdが存在するか確認
      })
      .map(post => {
        const postData = post.postId;
        return {
          _id: postData._id,
          title: postData.title,
          description: postData.description,
          content: postData.content?.substring(0, 150), // 内容の一部（最初の150文字）
          wordCount: postData.wordCount,
          episodeNumber: post.episodeNumber,
          author: postData.author, // 作者情報
          tags: postData.tags,
          createdAt: postData.createdAt,
          updatedAt: postData.updatedAt,
          viewCounter: postData.viewCounter,
          goodCounter: postData.goodCounter,
          isAdultContent: postData.isAdultContent,
          isOriginal: postData.isOriginal,
          aiEvidence: postData.aiEvidence
        };
      });

    console.log(`Found ${works.length} works in series`);
    
    // シリーズ情報と作品一覧を含む完全なレスポンス
    res.status(200).json({
      series: seriesInfo,
      works: works
    });
  } catch (error) {
    console.error('Error fetching works in series:', error);
    res.status(500).json({ message: '作品一覧の取得に失敗しました。', error: error.message });
  }
});
// シリーズの詳細情報を取得するエンドポイント
router.get('/:id([0-9a-fA-F]{24})', authenticateToken, async (req, res) => {
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
      isCompleted: series.isCompleted || false, // isCompletedフィールドを追加

      posts: populatedPosts,
    });
  } catch (error) {
    console.error('Error fetching series details:', error);
    res.status(500).json({ message: 'シリーズの詳細情報を取得できませんでした。', error });
  }
});
router.get('/:id([0-9a-fA-F]{24})/posts', async (req, res) => {
  try {
    const seriesId = req.params.id;

    // シリーズを取得し、posts.postId を完全にポピュレート
    const series = await Series.findById(seriesId).populate({
      path: 'posts.postId',
      select: 'title description viewCounter goodCounter bookShelfCounter wordCount isAdultContent isAI isOriginal tags'
    });

    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    // エピソード番号の小さい順に並び替え
    const postsWithEpisodes = series.posts
      .filter(post => post.postId) // 無効なpostIdを除外
      .map(post => ({
        _id: post.postId._id,
        title: post.postId.title,
        description: post.postId.description,
        episodeNumber: post.episodeNumber,
        viewCounter: post.postId.viewCounter,
        goodCounter: post.postId.goodCounter,
        bookShelfCounter: post.postId.bookShelfCounter,
        wordCount: post.postId.wordCount,
        isAdultContent: post.postId.isAdultContent,
        isOriginal: post.postId.isOriginal,
        tags: post.postId.tags,
      }))
      .sort((a, b) => a.episodeNumber - b.episodeNumber); // 並び替え

    res.status(200).json(postsWithEpisodes);
  } catch (error) {
    console.error('Error fetching series posts:', error);
    res.status(500).json({ message: 'シリーズの投稿を取得できませんでした。', error });
  }
});
// シリーズに投稿を追加するエンドポイント

router.post('/:id([0-9a-fA-F]{24})/addPost', authenticateToken, async (req, res) => {
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
// シリーズ情報更新エンドポイント（ES同期対応）
router.post('/:id([0-9a-fA-F]{24})/update', authenticateToken, async (req, res) => {
  try {
    const seriesId = req.params.id;
    const { 
      title, 
      description, 
      tags, 
      isOriginal, 
      isAdultContent, 
      aiGenerated,
      isCompleted,
      publicityStatus // 🆕 公開設定を追加
    } = req.body;

    console.log('🔄 シリーズ個別更新開始:', seriesId, { publicityStatus });

    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。' });
    }

    // 認証ユーザーがこのシリーズの所有者であることを確認
    if (series.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'このシリーズを編集する権限がありません。' });
    }

    // 変更前の値を保存（ES同期用）
    const oldValues = {
      title: series.title,
      description: series.description,
      tags: series.tags,
      isAdultContent: series.isAdultContent,
      publicityStatus: series.publicityStatus
    };

    // シリーズ情報を更新
    series.title = title;
    series.description = description;
    series.tags = tags;
    series.isOriginal = isOriginal;
    series.isAdultContent = isAdultContent;
    series.aiGenerated = aiGenerated;
    series.isCompleted = isCompleted;
    series.publicityStatus = publicityStatus || 'public'; // 🆕 公開設定を追加

    // MongoDBに保存（これによりpost('save')フックが自動実行されESも更新される）
    await series.save();

    console.log('📝 MongoDB個別更新完了');

    // 念のため手動でES同期も実行（post('save')フックと重複するが安全のため）
    try {
      if (esClient) {
        console.log('🔄 手動ES同期開始...');
        
        // 変更されたフィールドのみを特定
        const esUpdateBody = {};
        
        if (oldValues.title !== title) {
          esUpdateBody.title = title;
        }
        
        if (oldValues.description !== description) {
          // HTMLタグを除去
          const sanitizeHtml = require('sanitize-html');
          esUpdateBody.description = sanitizeHtml(description, {
            allowedTags: [],
            allowedAttributes: {}
          });
        }
        
        if (JSON.stringify(oldValues.tags) !== JSON.stringify(tags)) {
          esUpdateBody.tags = tags || [];
        }
        
        if (oldValues.isAdultContent !== isAdultContent) {
          esUpdateBody.isAdultContent = isAdultContent || false;
        }
        
        if (oldValues.publicityStatus !== publicityStatus) {
          esUpdateBody.publicityStatus = publicityStatus || 'public';
        }

        // 変更があった場合のみES更新
        if (Object.keys(esUpdateBody).length > 0) {
          console.log('🔄 ES更新フィールド:', Object.keys(esUpdateBody));
          
          await esClient.update({
            index: 'series',
            id: seriesId.toString(),
            body: {
              doc: esUpdateBody
            }
          });

          console.log('✅ 手動ES同期完了');
        } else {
          console.log('ℹ️ ES更新不要（変更なし）');
        }
      }
    } catch (esError) {
      console.error('❌ 手動ES同期エラー:', esError.message);
      // ESエラーは非致命的として処理継続
    }

    res.status(200).json(series);
  } catch (error) {
    console.error('❌ シリーズ個別更新エラー:', error);
    res.status(500).json({ message: 'シリーズ情報を更新できませんでした。', error });
  }
});
router.post('/:id([0-9a-fA-F]{24})/updatePosts', authenticateToken, async (req, res) => {
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
// Series のタイトルを取得するエンドポイント
router.get('/:id([0-9a-fA-F]{24})/title', async (req, res) => {
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

// シリーズ作成エンドポイント
router.post('', authenticateToken, async (req, res) => {
  try {
    const { title, description, tags, isOriginal, isAdultContent, aiGenerated ,isCompleted,publicityStatus } = req.body;

    const newSeries = new Series({
      title,
      description,
      tags,
      isOriginal,
      isAdultContent,
      aiGenerated,
      isCompleted: isCompleted || false, // デフォルトはfalse
      publicityStatus: publicityStatus || 'public', // 🆕 公開設定を追加
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
router.get('', authenticateToken, async (req, res) => {
  try {
    const series = await Series.find({ author: req.user._id });
    res.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ message: 'シリーズ取得に失敗しました。' });
  }
});

router.post('/:id([0-9a-fA-F]{24})/removePost', authenticateToken, async (req, res) => {
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

    // 認証ユーザーがこのシリーズの所有者であることを確認
    if (series.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'このシリーズを編集する権限がありません。' });
    }

    // シリーズの投稿リストから該当の投稿を削除
    const initialLength = series.posts.length;
    series.posts = series.posts.filter(post => {
      // postIdが文字列の場合とObjectIdの場合の両方に対応
      const currentPostId = post.postId instanceof mongoose.Types.ObjectId
        ? post.postId.toString()
        : post.postId?.toString();
        
      return currentPostId !== postId;
    });

    // 投稿が見つからなかった場合
    if (initialLength === series.posts.length) {
      return res.status(404).json({ message: '指定された投稿がシリーズ内に見つかりませんでした。' });
    }

    // 変更を保存
    await series.save();

    // Post モデルの series フィールドからシリーズIDを削除
    const post = await Post.findById(postId);
    if (post) {
      // postのseriesフィールドをクリア
      post.series = undefined;
      await post.save();
    }

    res.status(200).json({ 
      message: '作品がシリーズから削除されました。',
      success: true,
      remainingPostsCount: series.posts.length
    });
  } catch (error) {
    console.error('Error removing post from series:', error);
    res.status(500).json({ message: 'シリーズから作品を削除できませんでした。', error: error.message });
  }
});

// 🆕 個別シリーズ削除エンドポイント（ES同期対応）
router.delete('/:id([0-9a-fA-F]{24})', authenticateToken, async (req, res) => {
  try {
    const seriesId = req.params.id;
    const userId = req.user._id;

    console.log('🗑️ シリーズ個別削除開始:', seriesId);

    // シリーズを検索し、所有者であることを確認
    const series = await Series.findOne({ _id: seriesId, author: userId });
    if (!series) {
      return res.status(404).json({ message: 'シリーズが見つかりませんでした。または削除権限がありません。' });
    }

    // シリーズに含まれる全ての作品のseriesフィールドをクリア
    if (series.posts && series.posts.length > 0) {
      const postIds = series.posts.map(post => post.postId);
      await Post.updateMany(
        { _id: { $in: postIds } },
        { $unset: { series: "" } }
      );
    }

   // // ユーザーのfollowingSeriesからこのシリーズを削除
   // await User.updateMany(
   //   { followingSeries: seriesId },
   //   { $pull: { followingSeries: seriesId } }
   // );

    // MongoDBからシリーズを削除
    await Series.deleteOne({ _id: seriesId });

    console.log('📝 MongoDB個別削除完了');

    // 🆕 Elasticsearch同期処理（個別削除用）
    try {
      if (esClient) {
        console.log('🔄 Elasticsearch個別削除同期開始...');
        
        await esClient.delete({
          index: 'series',
          id: seriesId.toString(),
        });

        console.log('✅ ES個別削除完了');
      }
    } catch (esError) {
      if (esError.statusCode === 404) {
        console.log('⚠ ES個別削除: ドキュメントは既に存在しません');
      } else {
        console.error('❌ Elasticsearch個別削除同期エラー:', esError.message);
      }
      // ESエラーは非致命的として処理継続
    }

    res.status(200).json({ 
      message: 'シリーズが削除されました',
      deletedSeriesId: seriesId
    });

  } catch (error) {
    console.error('❌ シリーズ個別削除エラー:', error);
    res.status(500).json({ message: 'シリーズの削除に失敗しました。', error: error.message });
  }
});

// 🆕 シリーズ一括削除エンドポイント（ES同期対応）
router.post('/bulk-delete', authenticateToken, async (req, res) => {
  try {
    const { seriesIds } = req.body;
    const userId = req.user._id;

    console.log('🗑️ シリーズ一括削除開始:', seriesIds);

    if (!seriesIds || !Array.isArray(seriesIds) || seriesIds.length === 0) {
      return res.status(400).json({ message: '削除するシリーズを選択してください' });
    }

    // 自分のシリーズのみを対象とする
    const series = await Series.find({ 
      _id: { $in: seriesIds }, 
      author: userId 
    });

    if (series.length === 0) {
      return res.status(404).json({ message: '削除可能なシリーズが見つかりません' });
    }

    const seriesIdsToDelete = series.map(s => s._id);

    // 各シリーズに含まれる作品のseriesフィールドをクリア
    for (const seriesItem of series) {
      if (seriesItem.posts && seriesItem.posts.length > 0) {
        const postIds = seriesItem.posts.map(post => post.postId);
        await Post.updateMany(
          { _id: { $in: postIds } },
          { $unset: { series: "" } }
        );
      }
    }


    // MongoDBからシリーズを削除
    await Series.deleteMany({ _id: { $in: seriesIdsToDelete } });

    console.log(`📝 MongoDB削除完了: ${series.length}件`);

    // 🆕 Elasticsearch同期処理
    try {
      if (esClient && seriesIdsToDelete.length > 0) {
        console.log('🔄 Elasticsearch削除同期開始...');
        
        // Elasticsearch一括削除のためのBulk APIボディを作成
        const esBulkBody = seriesIdsToDelete.flatMap((seriesId) => [
          { 
            delete: { 
              _index: 'series', 
              _id: seriesId.toString()
            } 
          }
        ]);

        if (esBulkBody.length > 0) {
          const esBulkResponse = await esClient.bulk({ 
            refresh: "wait_for", 
            body: esBulkBody 
          });

          if (esBulkResponse.errors) {
            const errorItems = esBulkResponse.items.filter(item => item.delete && item.delete.error);
            // 404エラー（ドキュメントが存在しない）は正常として扱う
            const realErrors = errorItems.filter(item => 
              item.delete.error.type !== 'version_conflict_engine_exception' && 
              item.delete.error.status !== 404
            );
            
            if (realErrors.length > 0) {
              console.error('❌ ES一括削除で実エラー:', JSON.stringify(realErrors, null, 2));
            }
            
            const successCount = esBulkResponse.items.length - realErrors.length;
            console.log(`✅ ES削除成功: ${successCount}件, 実エラー: ${realErrors.length}件`);
          } else {
            console.log(`✅ ES一括削除完了: ${esBulkResponse.items.length}件`);
          }
        }
      }
    } catch (esError) {
      console.error('❌ Elasticsearch削除同期エラー:', esError.message);
      // ESエラーは非致命的として処理継続
    }

    res.json({ 
      message: `${series.length}件のシリーズを削除しました`,
      deletedCount: series.length
    });

  } catch (error) {
    console.error('❌ シリーズ一括削除エラー:', error);
    res.status(500).json({ message: 'シリーズ一括削除に失敗しました' });
  }
});
// 🆕 シリーズ一括更新エンドポイント（ES同期対応）
router.post('/bulk-update', authenticateToken, async (req, res) => {
  try {
    const { seriesIds, updateData } = req.body;
    const userId = req.user._id;

    console.log('🔄 シリーズ一括更新開始:', { seriesIds, updateData });

    if (!seriesIds || !Array.isArray(seriesIds) || seriesIds.length === 0) {
      return res.status(400).json({ message: '更新するシリーズを選択してください' });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: '更新データが提供されていません' });
    }

    // 自分のシリーズのみを対象とする
    const series = await Series.find({ 
      _id: { $in: seriesIds }, 
      author: userId 
    });

    if (series.length === 0) {
      return res.status(404).json({ message: '更新可能なシリーズが見つかりません' });
    }

    const seriesIdsToUpdate = series.map(s => s._id);

    // MongoDB一括更新実行
    const result = await Series.updateMany(
      { _id: { $in: seriesIdsToUpdate } },
      { $set: updateData }
    );

    console.log(`📝 MongoDB更新完了: ${result.modifiedCount}件`);

    // 🆕 Elasticsearch同期処理
    try {
      if (esClient && result.modifiedCount > 0) {
        console.log('🔄 Elasticsearch同期開始...');
        
        // Elasticsearch一括更新のためのBulk APIボディを作成
        const esBulkBody = seriesIdsToUpdate.flatMap((seriesId) => [
          { 
            update: { 
              _index: 'series', 
              _id: seriesId.toString(),
              retry_on_conflict: 3
            } 
          },
          {
            doc: updateData,
            doc_as_upsert: false // 既存ドキュメントのみ更新
          }
        ]);

        if (esBulkBody.length > 0) {
          const esBulkResponse = await esClient.bulk({ 
            refresh: "wait_for", 
            body: esBulkBody 
          });

          if (esBulkResponse.errors) {
            const errorItems = esBulkResponse.items.filter(item => item.update && item.update.error);
            console.error('❌ ES一括更新で一部エラー:', JSON.stringify(errorItems, null, 2));
            
            const successCount = esBulkResponse.items.length - errorItems.length;
            console.log(`✅ ES更新成功: ${successCount}件, エラー: ${errorItems.length}件`);
          } else {
            console.log(`✅ ES一括更新完了: ${esBulkResponse.items.length}件`);
          }
        }
      }
    } catch (esError) {
      console.error('❌ Elasticsearch同期エラー:', esError.message);
      // ESエラーは非致命的として処理継続
    }

    res.json({ 
      message: `${result.modifiedCount}件のシリーズを更新しました`,
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('❌ シリーズ一括更新エラー:', error);
    res.status(500).json({ message: 'シリーズ一括更新に失敗しました' });
  }
});
module.exports = router;

