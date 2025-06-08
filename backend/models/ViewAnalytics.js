// models/ViewAnalytics.js（大幅改修版）
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// バイナリパックされた閲覧データスキーマ
const packedViewDataSchema = new Schema({
  data: {
    type: Buffer,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// 時間窓データスキーマ（hour, day, week, month, yearの5レベル）
const timeWindowSchema = new Schema({
  period: {
    type: String,
    enum: ['hour', 'day', 'week', 'month', 'year'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  uniqueUsers: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  aggregatedFrom: {
    type: [mongoose.Types.ObjectId], // 集約元の窓IDを保持
    default: []
  }
});

// 前回の増加率を記録するスキーマ
const previousMetricsSchema = new Schema({
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  viewIncreaseRate: {
    type: Number,
    default: 0.01 // 最小値
  },
  lastCalculated: {
    type: Date,
    default: Date.now
  }
});

// ViewAnalyticsスキーマ
const viewAnalyticsSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  packedViewData: [packedViewDataSchema],
  timeWindows: [timeWindowSchema],
  previousMetrics: [previousMetricsSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// 効率的なクエリのためのインデックス
viewAnalyticsSchema.index({ postId: 1, 'timeWindows.period': 1, 'timeWindows.startTime': -1 });
viewAnalyticsSchema.index({ 'packedViewData.timestamp': 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 }); // 7日でバイナリデータ削除

// スタティックメソッド：期間内の集約データを取得
viewAnalyticsSchema.statics.getAggregatedDataForPeriod = async function(postId, period, startTime, endTime) {
  try {
    const analytics = await this.findOne({ postId });
    if (!analytics || !analytics.timeWindows) return { totalViews: 0, uniqueUsers: 0 };

    // 指定された期間のデータのみを取得
    const relevantWindows = analytics.timeWindows.filter(window => 
      window.period === period &&
      window.startTime >= startTime &&
      window.endTime <= endTime
    );

    // 合計を計算
    const totalViews = relevantWindows.reduce((sum, window) => sum + window.totalViews, 0);
    const uniqueUsers = relevantWindows.reduce((sum, window) => sum + window.uniqueUsers, 0);

    return { totalViews, uniqueUsers };
  } catch (error) {
    console.error(`Error getting aggregated data for post ${postId}:`, error);
    return { totalViews: 0, uniqueUsers: 0 };
  }
};

// スタティックメソッド：前回の増加率を取得/更新
viewAnalyticsSchema.statics.getPreviousIncreaseRate = async function(postId, period) {
  try {
    const analytics = await this.findOne({ postId });
    if (!analytics || !analytics.previousMetrics) return 0.01;

    const metric = analytics.previousMetrics.find(m => m.period === period);
    return metric ? metric.viewIncreaseRate : 0.01;
  } catch (error) {
    console.error(`Error getting previous increase rate for post ${postId}:`, error);
    return 0.01;
  }
};

viewAnalyticsSchema.statics.updatePreviousIncreaseRate = async function(postId, period, rate) {
  try {
    await this.updateOne(
      { postId },
      { 
        $push: { 
          previousMetrics: {
            $each: [{ period, viewIncreaseRate: rate, lastCalculated: new Date() }],
            $slice: -10 // 最新10件のみ保持
          }
        }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error(`Error updating previous increase rate for post ${postId}:`, error);
  }
};

// バイナリデータをJSONに変換する際に省略
viewAnalyticsSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    if (ret.packedViewData) {
      ret.packedViewDataCount = ret.packedViewData.length;
      delete ret.packedViewData;
    }
    return ret;
  }
});

module.exports = mongoose.model('ViewAnalytics', viewAnalyticsSchema);