// backend/utils/seriesTrendingCalculator.js
const SeriesFollowerHistory = require('../models/SeriesFollowerHistory');
const Series = require('../models/Series');
const { client: redisClient } = require('../utils/redisClient');

// スコア計算関数群
const calculateBaseScore = (episodeAverageScore, followerIncrease) => {
  const WEIGHTS = {
    episode: 3,  // エピソードスコアの重み
    follower: 7  // フォロワー増加の重み（フォロワー増加を重視）
  };

  return (episodeAverageScore * WEIGHTS.episode) + (followerIncrease * WEIGHTS.follower);
};

const calculateTimeDecay = (timestamp, decayRate) => {
  const now = new Date();
  const hoursDiff = (now - new Date(timestamp)) / (1000 * 60 * 60);
  return Math.exp(-decayRate * hoursDiff);
};

const calculateMomentum = (currentRate, previousRate, momentumWeight) => {
  const safeRate = previousRate || 0.01;
  const accelerationRatio = currentRate / safeRate;
  return Math.min(Math.log10(accelerationRatio + 1) * momentumWeight, 5);
};

const adjustParametersByPeriod = (period) => {
  switch (period) {
    case 'daily':
      return {
        decayRate: 0.1,
        momentumWeight: 3.0,  // シリーズのモメンタムはより重視
        hours: 24
      };
    case 'weekly':
      return {
        decayRate: 0.05,
        momentumWeight: 2.5,
        hours: 24 * 7
      };
    case 'monthly':
      return {
        decayRate: 0.02,
        momentumWeight: 1.5,
        hours: 24 * 30
      };
    case 'yearly':
      return {
        decayRate: 0.005,
        momentumWeight: 1.0,
        hours: 24 * 365
      };
    default:
      return {
        decayRate: 0.05,
        momentumWeight: 2.0,
        hours: 24
      };
  }
};

const calculateSeriesTrendingScore = (seriesData, period) => {
  const params = adjustParametersByPeriod(period);

  const baseScore = calculateBaseScore(
    seriesData.episodeAverageScore,
    seriesData.followerIncrease
  );

  const timeDecay = calculateTimeDecay(
    seriesData.lastActivityTimestamp || seriesData.updatedAt,
    params.decayRate
  );

  const currentRate = seriesData.followerIncrease / params.hours;
  const previousRate = seriesData.previousStats?.followerRate || 0.01;
  const momentum = calculateMomentum(
    currentRate,
    previousRate,
    params.momentumWeight
  );

  // シリーズの場合はエピソード数に応じてボーナスを追加
  const episodeBonusMultiplier = 1 + Math.log10(seriesData.episodeCount + 1) * 0.1;

  // 小数点2桁まで保持（四捨五入）
  const finalScore = baseScore * timeDecay * (1 + momentum) * episodeBonusMultiplier;
  return Math.round(finalScore * 100) / 100;
};

// 期間の開始日を取得
const getPeriodStartDate = (period) => {
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  
  switch(period) {
    case 'daily':
      return new Date(now.getTime() - msPerDay);
    case 'weekly':
      return new Date(now.getTime() - 7 * msPerDay);
    case 'monthly':
      return new Date(now.getTime() - 30 * msPerDay);
    case 'yearly':
      return new Date(now.getTime() - 365 * msPerDay);
    default:
      return new Date(now.getTime() - msPerDay);
  }
};

// フォロワー増加数を取得
const getFollowerIncrease = async (seriesId, period) => {
  try {
    const startDate = getPeriodStartDate(period);
    
    // 期間開始時点のフォロワー数
    const startHistory = await SeriesFollowerHistory.findOne({
      seriesId,
      timestamp: { $lte: startDate }
    }).sort({ timestamp: -1 });
    
    // 現在のフォロワー数
    const series = await Series.findById(seriesId).select('followerCount');
    const currentCount = series?.followerCount || 0;
    
    const startCount = startHistory?.followerCount || 0;
    
    return Math.max(0, currentCount - startCount);
  } catch (error) {
    console.error('Error getting follower increase:', error);
    return 0;
  }
};

// エピソードの平均スコアを取得
const getEpisodeAverageScore = (series, period) => {
  if (!series.posts || series.posts.length === 0) return 0;
  
  let totalScore = 0;
  let scoreCount = 0;
  
  series.posts.forEach(post => {
    if (post.postId && post.postId.trendingScores) {
      let score = 0;
      switch (period) {
        case 'daily':
          score = post.postId.trendingScores.dailyScore || 0;
          break;
        case 'weekly':
          score = post.postId.trendingScores.weeklyScore || 0;
          break;
        case 'monthly':
          score = post.postId.trendingScores.monthlyScore || 0;
          break;
        case 'yearly':
          score = post.postId.trendingScores.yearlyScore || 0;
          break;
        case 'cumulative':
          score = post.postId.trendingScores.totalScore || 0;
          break;
      }
      
      if (score > 0) {
        totalScore += score;
        scoreCount++;
      }
    }
  });
  
  return scoreCount > 0 ? totalScore / scoreCount : 0;
};

// 前回の統計データを取得
const getPreviousStats = async (seriesId, period) => {
  const cacheKey = `prev_stats:series:${seriesId}:${period}`;
  const prevStats = await redisClient.get(cacheKey);
  return prevStats ? JSON.parse(prevStats) : null;
};

// 最後の活動タイムスタンプを取得
const getSeriesLastActivity = async (seriesId) => {
  try {
    const series = await Series.findById(seriesId);
    if (!series) return new Date(0);

    const timestamps = [series.updatedAt];
    
    // フォロワー履歴の最新の更新時刻
    const latestFollowerHistory = await SeriesFollowerHistory.findOne({
      seriesId
    }).sort({ timestamp: -1 });
    
    if (latestFollowerHistory) {
      timestamps.push(new Date(latestFollowerHistory.timestamp));
    }

    return new Date(Math.max(...timestamps.map(t => t.getTime())));
  } catch (error) {
    console.error('Error getting series last activity:', error);
    return new Date(0);
  }
};

module.exports = {
  calculateSeriesTrendingScore,
  adjustParametersByPeriod,
  getPeriodStartDate,
  getFollowerIncrease,
  getEpisodeAverageScore,
  getPreviousStats,
  getSeriesLastActivity
};