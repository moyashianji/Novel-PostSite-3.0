// backend/models/TotalSeriesRank.js
const mongoose = require('mongoose');

const totalSeriesRankSchema = new mongoose.Schema({
  series: [{
    seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series' },
    score: { type: Number, required: true },
    metrics: {
      followerScore: Number,
      episodeScore: Number,
      completedBonus: Number
    },
    episodeCount: { type: Number, default: 0 },
    followerCount: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false }
  }],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('TotalSeriesRank', totalSeriesRankSchema);