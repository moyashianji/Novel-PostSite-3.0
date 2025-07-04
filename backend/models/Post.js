// models/Post.js
const mongoose = require('mongoose');
const { getEsClient } = require('../utils/esClient'); // 動的に取得
const sanitizeHtml = require('sanitize-html'); // HTMLタグを削除するライブラリ

const esClient = getEsClient(); // getEsClient() で取得

const replySchema = new mongoose.Schema({
  text: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // コメントの作者を参照
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // コメントの作者を参照
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now }
});
// AI証拠データのスキーマ
const aiEvidenceSchema = new mongoose.Schema({
  tools: [{ type: String }], // 使用したAIツールのリスト
  url: { type: String }, // 証拠URL（任意）
  description: { type: String, required: true } // AI使用の説明（必須）
});
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  description: { type: String, required: true, maxlength: 3000 },
  tags: [{ type: String, maxlength: 50 }],
  contestTags: [{ type: String, maxlength: 50 }], // コンテストから自動追加されるタグ
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [{ type: String }],
  imageCount: { type: Number, default: 0 }, // 画像数

  wordCount: { type: Number, required: true },
  isOriginal: {
    type: Boolean,
    required: false,
  },
  isAdultContent: {
    type: Boolean,
    required: false,
  },
  isAI: { type: Boolean, default: true, required: true  },
  aiEvidence: { type: aiEvidenceSchema }, // AI証拠
  // 表示設定

  
  publicityStatus: { 
  type: String, 
  enum: ['public', 'limited', 'private'], 
  default: 'public' 
},

  allowComments: { type: Boolean, default: true }, // コメント許可/禁止設定
  
  viewCounter: { type: Number, default: 0 }, // 閲覧数
  goodCounter: { type: Number, default: 0 }, // いいね数
  bookShelfCounter: { type: Number, default: 0 }, // 本棚追加数

  comments: [commentSchema],  // コメントを含む
  series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',  // シリーズ情報を保持するフィールドを追加
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },


  rankingScore: { type: Number, default: 0 }, // 総合評価スコア

  trendingScores: {
    dailyScore: { type: Number, default: 0 },
    weeklyScore: { type: Number, default: 0 },
    monthlyScore: { type: Number, default: 0 },
    yearlyScore: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: null }
  }
});
postSchema.index({ rankingScore: -1 });
postSchema.index({ 'trendingScores.dailyScore': -1 });
postSchema.index({ 'trendingScores.weeklyScore': -1 });
postSchema.index({ 'trendingScores.monthlyScore': -1 });
postSchema.index({ 'trendingScores.yearlyScore': -1 });


// models/Post.js の post('save') フックを更新
postSchema.post('save', async function (doc) {
  try {
    if (!esClient) throw new Error('❌ Elasticsearch client is undefined');

    // まず既存のドキュメントが存在するかチェック
    let existingDoc = null;
    try {
      const getResponse = await esClient.get({
        index: 'posts_fixed',
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
      const updateBody = {
        isAdultContent: doc.isAdultContent || false, // ✅ R18情報
        publicityStatus: doc.publicityStatus || 'public', // ✅ 公開設定情報
      };

      // 他のフィールドも変更されている場合は追加で更新
      if (doc.title !== existingDoc.title) updateBody.title = doc.title;
      if (doc.description !== existingDoc.description) updateBody.description = doc.description;
      
      // タグが変更されている場合
      const currentTags = JSON.stringify(doc.tags || []);
      const existingTags = JSON.stringify(existingDoc.tags || []);
      if (currentTags !== existingTags) updateBody.tags = doc.tags || [];

      // 🆕 コンテストタグが変更されている場合（常に更新してフィールド存在を保証）
      const currentContestTags = JSON.stringify(doc.contestTags || []);
      const existingContestTags = JSON.stringify(existingDoc.contestTags || []);
      if (currentContestTags !== existingContestTags) {
        updateBody.contestTags = doc.contestTags || [];
        console.log('🏷️ コンテストタグが更新されました:', updateBody.contestTags);
      }

      // コンテンツが変更されている場合のみサニタイズして更新
      if (doc.content !== existingDoc.content) {
        const cleanContent = sanitizeHtml(doc.content, {
          allowedTags: [],
          allowedAttributes: {}
        });
        updateBody.content = cleanContent;
      }

      // aiEvidenceフィールドがある場合は追加
      if (doc.aiEvidence) {
        updateBody.aiEvidence = {
          tools: doc.aiEvidence.tools || [],
          url: doc.aiEvidence.url || '',
          description: doc.aiEvidence.description || ''
        };
      }

      const response = await esClient.update({
        index: 'posts_fixed',
        id: doc._id.toString(),
        body: {
          doc: updateBody
        },
      });

      console.log('✅ Document updated in Elasticsearch:', response);
    } else {
      // 新しいドキュメントの場合は完全な内容でインデックス
      const cleanContent = sanitizeHtml(doc.content, {
        allowedTags: [],
        allowedAttributes: {}
      });

      const esBody = {
        title: doc.title,
        content: cleanContent,
        description: doc.description,
        tags: doc.tags || [],
        contestTags: doc.contestTags || [], // 🆕 コンテストタグフィールドを必ず含める（空配列でも）
        author: doc.author.toString(),
        createdAt: doc.createdAt,
        isAdultContent: doc.isAdultContent || false, // ✅ R18情報
        publicityStatus: doc.publicityStatus || 'public', // ✅ 公開設定情報
      };

      // aiEvidenceフィールドがある場合は追加
      if (doc.aiEvidence) {
        esBody.aiEvidence = {
          tools: doc.aiEvidence.tools || [],
          url: doc.aiEvidence.url || '',
          description: doc.aiEvidence.description || ''
        };
      }

      console.log('🆕 新規作品投稿 - Elasticsearchインデックス作成:', {
        id: doc._id.toString(),
        title: doc.title,
        contestTags: esBody.contestTags,
        hasContestTagsField: esBody.hasOwnProperty('contestTags')
      });

      const response = await esClient.index({
        index: 'posts_fixed',
        id: doc._id.toString(),
        body: esBody,
      });

      console.log('✅ Document indexed in Elasticsearch:', response);
      console.log('🏷️ コンテストタグフィールドが作成されました:', esBody.contestTags);
    }
  } catch (error) {
    console.error('❌ Error indexing/updating document in Elasticsearch:', error);
  }
});

postSchema.post('findOneAndDelete', async function (doc) {
  if (!doc) {
    console.warn('⚠️ Document not found for deletion in Elasticsearch');
    return;
  }

  try {
    const response = await esClient.delete({
      index: 'posts_fixed',
      id: doc._id.toString(),
    });

    console.log('✅ Document removed from Elasticsearch:', response);
  } catch (error) {
    if (error.meta && error.meta.statusCode === 404) {
      console.warn('⚠️ Document not found in Elasticsearch, skipping:', doc._id.toString());
    } else {
      console.error('❌ Error removing document from Elasticsearch:', error.meta ? error.meta.body : error);
    }
  }
});

module.exports = mongoose.model('Post', postSchema);