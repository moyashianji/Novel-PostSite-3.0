// backend/models/TrendingRank.js - 最適化版
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 個別投稿のランキングデータ
const trendingPostEntrySchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  rank: {
    type: Number,
    required: true,
    min: 1
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  // スコア計算に使用したメトリクス（デバッグ用）
  metrics: {
    viewIncrease: { type: Number, default: 0 },
    likeIncrease: { type: Number, default: 0 },
    bookmarkIncrease: { type: Number, default: 0 },
    commentIncrease: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    timeDecay: { type: Number, default: 1.0 },
    momentumFactor: { type: Number, default: 1.0 },
    diversityFactor: { type: Number, default: 1.0 }
  },
  // 投稿の基本情報をキャッシュ（JOIN回避）
  cachedPostData: {
    title: String,
    description: String,
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    authorNickname: String,
    authorIcon: String,
    seriesId: { type: Schema.Types.ObjectId, ref: 'Series' },
    seriesTitle: String,
    tags: [String],
    isAdultContent: { type: Boolean, default: false },
    isAI: { type: Boolean, default: true },
    isOriginal: Boolean,
    viewCounter: { type: Number, default: 0 },
    goodCounter: { type: Number, default: 0 },
    bookShelfCounter: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 },
    createdAt: Date
  }
}, { _id: false });

// メインのトレンディングランクスキーマ
const trendingRankSchema = new Schema({
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true,
    index: true
  },
  // ランキングエントリ（スコア順でソート済み）
  rankings: {
    type: [trendingPostEntrySchema],
    default: [],
    validate: [arrayLimit, '{PATH} exceeds the limit of 1000'] // 最大1000件
  },
  // 統計情報
  statistics: {
    totalPosts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    topScore: { type: Number, default: 0 },
    calculationTime: { type: Number, default: 0 } // 計算にかかった時間（ms）
  },
  // 最終更新時刻
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  },
  // データのバージョン（キャッシュ無効化用）
  version: {
    type: Number,
    default: 1
  }
}, { 
  timestamps: true,
  // パフォーマンス最適化のためのオプション
  minimize: false, // 空のオブジェクトも保存
  strict: true
});

// 配列サイズ制限バリデーター
function arrayLimit(val) {
  return val.length <= 1000;
}

// 効率的なクエリのためのコンパウンドインデックス
trendingRankSchema.index({ period: 1, lastUpdated: -1 });
trendingRankSchema.index({ period: 1, version: -1 });
trendingRankSchema.index({ 'rankings.rank': 1, period: 1 });
trendingRankSchema.index({ 'rankings.score': -1, period: 1 });

// スタティックメソッド: 期間とページネーションでランキングを高速取得
trendingRankSchema.statics.getRankingByPeriod = async function(period, page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;
    
    // 最新のランキングドキュメントを取得
    const rankingDoc = await this.findOne({ period })
      .sort({ lastUpdated: -1 })
      .lean(); // lean()でMongooseオブジェクトのオーバーヘッドを削減
    
    if (!rankingDoc || !rankingDoc.rankings || rankingDoc.rankings.length === 0) {
      return {
        posts: [],
        totalCount: 0,
        page,
        limit,
        totalPages: 0,
        lastUpdated: null
      };
    }
    
    // 配列スライスによる超高速ページネーション（O(1)）
    const posts = rankingDoc.rankings.slice(skip, skip + limit);
    const totalCount = rankingDoc.rankings.length;
    
    return {
      posts,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      lastUpdated: rankingDoc.lastUpdated,
      statistics: rankingDoc.statistics
    };
  } catch (error) {
    console.error(`Error getting ${period} ranking:`, error);
    return {
      posts: [],
      totalCount: 0,
      page,
      limit,
      totalPages: 0,
      lastUpdated: null
    };
  }
};

// スタティックメソッド: フィルタリング付きランキング取得
trendingRankSchema.statics.getFilteredRanking = async function(period, filters = {}, page = 1, limit = 20) {
  try {
    const {
      ageFilter = 'all',
      contentType = 'all',
      genre = 'すべて'
    } = filters;
    
    const skip = (page - 1) * limit;
    
    // 最新のランキングドキュメントを取得
    const rankingDoc = await this.findOne({ period })
      .sort({ lastUpdated: -1 })
      .lean();
    
    if (!rankingDoc || !rankingDoc.rankings) {
      return { posts: [], totalCount: 0, page, limit, totalPages: 0 };
    }
    
    // フィルタリング処理（メモリ内で高速実行）
    let filteredRankings = rankingDoc.rankings;
    
    // 年齢制限フィルター
    if (ageFilter !== 'all') {
      filteredRankings = filteredRankings.filter(item => {
        if (ageFilter === 'r18') {
          return item.cachedPostData.isAdultContent === true;
        } else if (ageFilter === 'general') {
          return item.cachedPostData.isAdultContent === false;
        }
        return true;
      });
    }
    
    // 作品タイプフィルター
    if (contentType !== 'all') {
      filteredRankings = filteredRankings.filter(item => {
        if (contentType === 'series') {
          return item.cachedPostData.seriesId != null;
        } else if (contentType === 'standalone') {
          return item.cachedPostData.seriesId == null;
        }
        return true;
      });
    }
    
    // ジャンルフィルター
    if (genre !== 'すべて') {
      filteredRankings = filteredRankings.filter(item => {
        return item.cachedPostData.tags && item.cachedPostData.tags.includes(genre);
      });
    }
    
    // ページネーション
    const posts = filteredRankings.slice(skip, skip + limit);
    const totalCount = filteredRankings.length;
    
    return {
      posts,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      lastUpdated: rankingDoc.lastUpdated
    };
  } catch (error) {
    console.error(`Error getting filtered ${period} ranking:`, error);
    return { posts: [], totalCount: 0, page, limit, totalPages: 0 };
  }
};

// スタティックメソッド: ランキング一括更新（バッチ処理用）
trendingRankSchema.statics.updateRanking = async function(period, rankingData) {
  try {
    const startTime = Date.now();
    
    // 統計情報を計算
    const scores = rankingData.map(item => item.score).filter(score => score > 0);
    const statistics = {
      totalPosts: rankingData.length,
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      topScore: scores.length > 0 ? Math.max(...scores) : 0,
      calculationTime: 0 // 後で設定
    };
    
    // ランキングを作成（rank順でソート済み）
    const rankings = rankingData.map((item, index) => ({
      postId: item.postId,
      rank: index + 1,
      score: item.score,
      metrics: item.metrics || {},
      cachedPostData: item.cachedPostData
    }));
    
    statistics.calculationTime = Date.now() - startTime;
    
    // upsert操作で効率的に更新
    const result = await this.findOneAndUpdate(
      { period },
      {
        $set: {
          rankings,
          statistics,
          lastUpdated: new Date(),
          version: Date.now() // キャッシュ無効化のためのバージョン
        }
      },
      { 
        upsert: true, 
        new: true,
        lean: true // 軽量なオブジェクトを返す
      }
    );
    
    console.log(`✅ ${period}ランキング更新完了: ${rankings.length}件 (${statistics.calculationTime}ms)`);
    return result;
  } catch (error) {
    console.error(`Error updating ${period} ranking:`, error);
    throw error;
  }
};

// インデックス: 検索・ソート性能の最適化
trendingRankSchema.index({ period: 1, 'rankings.rank': 1 });
trendingRankSchema.index({ period: 1, 'rankings.score': -1 });
trendingRankSchema.index({ lastUpdated: -1 });

module.exports = mongoose.model('TrendingRank', trendingRankSchema);