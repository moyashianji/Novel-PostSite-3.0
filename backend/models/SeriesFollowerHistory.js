// backend/models/SeriesFollowerHistory.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// シリーズフォロワー履歴スキーマ
const seriesFollowerHistorySchema = new Schema({
  seriesId: {
    type: Schema.Types.ObjectId,
    ref: 'Series',
    required: true,
    index: true
  },
  followerCount: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// シリーズごとにデータを効率的に取得するためのインデックス
seriesFollowerHistorySchema.index({ seriesId: 1, timestamp: -1 });

const SeriesFollowerHistory = mongoose.model('SeriesFollowerHistory', seriesFollowerHistorySchema);

module.exports = SeriesFollowerHistory;