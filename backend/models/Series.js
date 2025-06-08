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
// Series.js の Elasticsearch インデックス処理の部分
seriesSchema.post('save', async function (doc) {
  try {
    if (!esClient) throw new Error('❌ Elasticsearch client is undefined');

    // Elasticsearch に保存するデータを準備
    const esBody = {
      title: doc.title,
      description: doc.description,
      tags: doc.tags || [],
      author: doc.author.toString(),
      createdAt: doc.createdAt,
      isAdultContent: doc.isAdultContent || false,
      isCompleted: doc.isCompleted || false, // 完結状態を追加
    };

    // Elasticsearch に保存
    const response = await esClient.index({
      index: 'series',
      id: doc._id.toString(),
      body: esBody,
    });

    console.log('✅ Series indexed in Elasticsearch:', response);
  } catch (error) {
    console.error('❌ Error indexing series in Elasticsearch:', error);
  }
});
const Series = mongoose.model('Series', seriesSchema);

module.exports = Series;