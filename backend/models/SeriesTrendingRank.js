// backend/models/SeriesTrendingRank.js
const mongoose = require('mongoose');

const seriesTrendingRankSchema = new mongoose.Schema({
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'cumulative'],
    required: true
  },
  series: [{
    seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series' },
    score: { type: Number, required: true },
    episodeAverageScore: { type: Number, default: 0 },
    followerIncrease: { type: Number, default: 0 },
    episodeCount: { type: Number, default: 0 },
    lastActivityTimestamp: { type: Date },
    previousStats: {
      type: {
        followerCount: Number,
        followerRate: Number,
        totalScore: Number
      },
      default: {}
    }
  }],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

seriesTrendingRankSchema.index({ period: 1, lastUpdated: -1 });

module.exports = mongoose.model('SeriesTrendingRank', seriesTrendingRankSchema);