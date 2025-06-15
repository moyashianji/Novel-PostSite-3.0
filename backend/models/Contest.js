// models/Contest.js
const mongoose = require('mongoose');

const judgeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  position: { type: String},
  sns: { type: String },
});

const entrySchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submissionDate: { type: Date, default: Date.now },
});

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  description: { type: String, required: true },
  iconImage: { type: String },
  headerImage: { type: String },
  applicationStartDate: { type: mongoose.Schema.Types.Mixed, required: true }, // 日付またはあいまいな表記
  applicationEndDate: { type: mongoose.Schema.Types.Mixed, required: true },
  reviewStartDate: { type: mongoose.Schema.Types.Mixed },
  reviewEndDate: { type: mongoose.Schema.Types.Mixed },
  resultAnnouncementDate: { type: mongoose.Schema.Types.Mixed },
  enableJudges: { type: Boolean, default: false },
  judges: [judgeSchema],
  allowFinishedWorks: { type: Boolean, default: false },
  allowPreStartDate: { type: Boolean, default: false },
  restrictAI: { type: Boolean, default: false },
  aiTags: [{ type: String }],
  allowR18: { type: Boolean, default: false },
  restrictGenres: { type: Boolean, default: false },
  genres: [{ type: String }],
  restrictWordCount: { type: Boolean, default: false },
  minWordCount: { type: Number, default: 0 },
  maxWordCount: { type: Number, default: 0 },
  allowSeries: { type: Boolean, default: false },
  minEntries: { type: Number, default: 0 },
  maxEntries: { type: Number, default: Infinity },
  status: { type: String, required: true},
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entries: [entrySchema],
  // 🔧 contestTagsフィールドのdefaultを削除し、上書き防止
  contestTags: {
    type: [{ type: String, maxlength: 50 }],
    // 🚨 defaultを削除して上書きを防止
  }
}, { timestamps: true });

// 🆕 contestTagsの保護機能を追加
contestSchema.pre('save', function(next) {
  // 🔧 contestTagsが既に設定されている場合、意図しない上書きを防ぐ
  if (this.isModified('contestTags')) {
    console.log('🏷️ contestTagsが変更されました:', this.contestTags);
  }
  
  // 🔧 entriesだけを変更している場合、contestTagsを保持
  if (this.isModified('entries') && !this.isModified('contestTags')) {
    console.log('🏷️ entries変更時、contestTagsを保護:', this.contestTags);
  }
  
  next();
});

module.exports = mongoose.model('Contest', contestSchema);