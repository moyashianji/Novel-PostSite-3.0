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
  isPublic: { type: Boolean, default: true }, // 公開/非公開設定
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


// Post.jsのpostSchema.post('save')フックを更新
postSchema.post('save', async function (doc) {
  try {
    if (!esClient) throw new Error('❌ Elasticsearch client is undefined');

    // 🔍 HTMLタグを削除
    const cleanContent = sanitizeHtml(doc.content, {
      allowedTags: [],  // 🚀 すべてのHTMLタグを削除
      allowedAttributes: {}  // 🔹 すべての属性も削除
    });

    console.log('🔍 元のコンテンツ:', doc.content);
    console.log('🛠 サニタイズ後のコンテンツ:', cleanContent);

    // Elasticsearch に保存するデータを準備
    const esBody = {
      title: doc.title,
      content: cleanContent,  // 🔥 タグ除去後のコンテンツを使用
      description: doc.description,
      tags: doc.tags || [],
      author: doc.author.toString(),
      createdAt: doc.createdAt,
    };

    // aiEvidenceフィールドがある場合は追加
    if (doc.aiEvidence) {
      esBody.aiEvidence = {
        tools: doc.aiEvidence.tools || [],
        url: doc.aiEvidence.url || '',
        description: doc.aiEvidence.description || ''
      };
    }

    // Elasticsearch に保存
    const response = await esClient.index({
      index: 'posts',
      id: doc._id.toString(),
      body: esBody,
    });

    console.log('✅ Document indexed in Elasticsearch:', response);
  } catch (error) {
    console.error('❌ Error indexing document in Elasticsearch:', error);
  }
});

postSchema.post('findOneAndDelete', async function (doc) {
  if (!doc) {
    console.warn('⚠️ Document not found for deletion in Elasticsearch');
    return;
  }

  try {
    const response = await esClient.delete({
      index: 'posts',
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
