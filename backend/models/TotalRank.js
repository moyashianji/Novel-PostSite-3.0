// backend/models/TotalRank.js
const mongoose = require('mongoose');

const totalRankSchema = new mongoose.Schema({
  posts: [{
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    score: { type: Number, required: true },
    metrics: {
      commentScore: Number,
      bookmarkScore: Number,
      likeScore: Number,
      viewScore: Number,
      uniqueUsersCount: Number,
      engagementFactor: Number
    }
  }],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('TotalRank', totalRankSchema);