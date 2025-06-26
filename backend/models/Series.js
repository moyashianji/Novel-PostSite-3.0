const mongoose = require('mongoose');
const { getEsClient } = require('../utils/esClient'); // 動的に取得
const sanitizeHtml = require('sanitize-html'); // HTMLタグを削除するライブラリ

const esClient = getEsClient(); // getEsClient() で取得
const seriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 400,
  },
  description: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 2000,
  },
  tags: {
    type: [String],
    maxlength: 10,
  },
  isOriginal: {
    type: Boolean,
    required: true,
  },
  isAdultContent: {
    type: Boolean,
    required: true,
  },
  aiGenerated: {
    type: Boolean,
    required: true,
  },
  // 🆕 公開設定フィールドを追加
  publicityStatus: {
    type: String,
    enum: ['public', 'limited', 'private'],
    default: 'public'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isCompleted: {   // 完結済みかどうかを示すフィールドを追加
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  posts: [
    {
      postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
      episodeNumber: { type: Number }
    }
  ],
  // シリーズフォロー機能追加
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followerCount: {
    type: Number,
    default: 0
  },
  rankingScore: { type: Number, default: 0 }, // 総合評価スコア

  // シリーズトレンディングスコア追加
  trendingScores: {
    averageEpisodeScore: { type: Number, default: 0 },
    followerScore: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: null }
  }
}, { timestamps: true });
seriesSchema.index({ rankingScore: -1 });

// シリーズの総合スコアを計算するメソッド
seriesSchema.methods.calculateTrendingScore = function() {
  // エピソードの平均スコア
  const episodeCount = this.posts.length;
  let totalEpisodeScore = 0;
  
  this.posts.forEach(post => {
    if (post.postId && post.postId.trendingScores && post.postId.trendingScores.totalScore) {
      totalEpisodeScore += post.postId.trendingScores.totalScore;
    }
  });
  
  // エピソードが0の場合は平均スコアも0
  const averageEpisodeScore = episodeCount > 0 ? totalEpisodeScore / episodeCount : 0;
  
  // フォロワースコア：フォロワー数を重視したスコアリング
  // 対数スケールを使い、フォロワー数が多いほど高いスコアを与える
  // 基数を20に設定し、20人のフォロワーで10ポイント、200人で20ポイントなど
  const followerScore = this.followerCount > 0 ? Math.log(this.followerCount + 1) / Math.log(20) * 10 : 0;
  
  // 総合スコア：フォロワーに重きを置く（フォロワー60% + エピソード平均40%）
  // フォロワー数をより重視するように調整
  const totalScore = (averageEpisodeScore * 0.4) + (followerScore * 0.6);
  
  // デバッグ用ログ
  console.log(`[SERIES TRENDING] ${this.title}: 
    Episodes: ${episodeCount}, 
    Avg Score: ${averageEpisodeScore.toFixed(2)},
    Followers: ${this.followerCount},
    Follower Score: ${followerScore.toFixed(2)},
    Total Score: ${totalScore.toFixed(2)}`);
  
  this.trendingScores.averageEpisodeScore = Math.round(averageEpisodeScore * 100) / 100;
  this.trendingScores.followerScore = Math.round(followerScore * 100) / 100;
  this.trendingScores.totalScore = Math.round(totalScore * 100) / 100;
  this.trendingScores.lastUpdated = new Date();
  
  return this.trendingScores;
};
// 🆕 シリーズ保存後のElasticsearch自動更新フック（Postモデルと同じ仕組み）
seriesSchema.post('save', async function (doc) {
  try {
    if (!esClient) {
      console.warn('⚠ Elasticsearch client is undefined - スキップ');
      return;
    }

    console.log(`🔄 ES自動同期開始: ${doc._id}`);

    // まず既存のドキュメントが存在するかチェック
    let existingDoc = null;
    try {
      const getResponse = await esClient.get({
        index: 'series',
        id: doc._id.toString(),
      });
      existingDoc = getResponse._source;
    } catch (getError) {
      // ドキュメントが存在しない場合は null のまま
      if (getError.statusCode !== 404) {
        throw getError;
      }
    }

    if (existingDoc) {
      // 既存のドキュメントがある場合は部分更新
      const updateBody = {};

      // 各フィールドの変更をチェック
      if (doc.isAdultContent !== existingDoc.isAdultContent) {
        updateBody.isAdultContent = doc.isAdultContent || false;
      }

      if (doc.publicityStatus !== existingDoc.publicityStatus) {
        updateBody.publicityStatus = doc.publicityStatus || 'public';
      }

      if (doc.title !== existingDoc.title) {
        updateBody.title = doc.title;
      }

      if (doc.description !== existingDoc.description) {
        updateBody.description = sanitizeHtml(doc.description, {
          allowedTags: [],
          allowedAttributes: {}
        });
      }

      if (JSON.stringify(doc.tags || []) !== JSON.stringify(existingDoc.tags || [])) {
        updateBody.tags = doc.tags || [];
      }

      // 変更があった場合のみ更新
      if (Object.keys(updateBody).length > 0) {
        console.log(`🔄 ES部分更新: ${doc._id} | 更新フィールド:`, Object.keys(updateBody));

        await esClient.update({
          index: 'series',
          id: doc._id.toString(),
          body: {
            doc: updateBody
          }
        });

        console.log(`✅ ES部分更新完了: ${doc._id}`);
      } else {
        console.log(`ℹ️ ES更新スキップ: ${doc._id} - 変更なし`);
      }
    } else {
      // 新規ドキュメントの場合は全体を送信
      if (!doc.title || !doc.description) {
        console.warn(`⚠ ES新規登録スキップ: ${doc._id} - title または description が不足`);
        return;
      }

      const cleanDescription = sanitizeHtml(doc.description, {
        allowedTags: [],
        allowedAttributes: {}
      });

      const newDocBody = {
        title: doc.title,
        description: cleanDescription,
        tags: doc.tags || [],
        isAdultContent: doc.isAdultContent || false,
        publicityStatus: doc.publicityStatus || 'public',
        createdAt: doc.createdAt
      };

      console.log(`➕ ES新規登録: ${doc._id}`);

      await esClient.index({
        index: 'series',
        id: doc._id.toString(),
        body: newDocBody
      });

      console.log(`✅ ES新規登録完了: ${doc._id}`);
    }

  } catch (error) {
    console.error(`❌ ES自動同期エラー (${doc._id}):`, error.message);
    
    // 🔧 エラーの詳細情報を記録
    if (error.meta) {
      console.error('❌ ES エラー詳細:', JSON.stringify(error.meta.body || error.meta, null, 2));
    }
  }
});

// 🆕 シリーズ削除後のElasticsearch自動削除フック
seriesSchema.post('deleteOne', { document: true, query: false }, async function (doc) {
  try {
    if (!esClient) throw new Error('❌ Elasticsearch client is undefined');

    console.log(`🗑️ ES シリーズ削除: ${doc._id}`);

    await esClient.delete({
      index: 'series',
      id: doc._id.toString(),
    });

    console.log(`✅ ES シリーズ削除完了: ${doc._id}`);
  } catch (error) {
    if (error.statusCode === 404) {
      console.log(`⚠ ES シリーズ削除: ${doc._id} - ドキュメントは既に存在しません`);
    } else {
      console.error(`❌ ES シリーズ削除エラー (${doc._id}):`, error.message);
    }
  }
});

// 🆕 findOneAndDelete対応
seriesSchema.post('findOneAndDelete', async function (doc) {
  if (!doc) return;
  
  try {
    if (!esClient) throw new Error('❌ Elasticsearch client is undefined');

    console.log(`🗑️ ES シリーズ削除 (findOneAndDelete): ${doc._id}`);

    await esClient.delete({
      index: 'series',
      id: doc._id.toString(),
    });

    console.log(`✅ ES シリーズ削除完了 (findOneAndDelete): ${doc._id}`);
  } catch (error) {
    if (error.statusCode === 404) {
      console.log(`⚠ ES シリーズ削除 (findOneAndDelete): ${doc._id} - ドキュメントは既に存在しません`);
    } else {
      console.error(`❌ ES シリーズ削除エラー (findOneAndDelete) (${doc._id}):`, error.message);
    }
  }
});

module.exports = mongoose.model('Series', seriesSchema);