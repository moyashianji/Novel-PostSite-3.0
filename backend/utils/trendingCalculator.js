// backend/utils/trendingCalculator.js
const Good = require('../models/Good');
const ViewAnalytics = require('../models/ViewAnalytics');
const Post = require('../models/Post');
const { client: redisClient } = require('../utils/redisClient');

// スコア計算関数群
const calculateBaseScore = (viewIncrease, likeIncrease, bookmarkCount, commentIncrease) => {
  const WEIGHTS = {
    view: 1,
    like: 3,
    bookmark: 5,
    comment: 2
  };

  return (viewIncrease * WEIGHTS.view) +
    (likeIncrease * WEIGHTS.like) +
    (bookmarkCount * WEIGHTS.bookmark) +
    (commentIncrease * WEIGHTS.comment);
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

const calculateUserDiversity = (uniqueUsers, totalInteractions, diversityWeight) => {
  if (totalInteractions === 0) return 1;
  const diversityRatio = uniqueUsers / totalInteractions;
  return 1 + (diversityRatio * diversityWeight);
};

const adjustParametersByPeriod = (period) => {
  switch (period) {
    case 'day':
      return {
        decayRate: 0.1,
        momentumWeight: 2.0,
        diversityWeight: 1.5,
        hours: 24
      };
    case 'week':
      return {
        decayRate: 0.05,
        momentumWeight: 1.5,
        diversityWeight: 1.8,
        hours: 24 * 7
      };
    case 'month':
      return {
        decayRate: 0.02,
        momentumWeight: 1.0,
        diversityWeight: 2.0,
        hours: 24 * 30
      };
    case 'year':
      return {
        decayRate: 0.005,
        momentumWeight: 0.5,
        diversityWeight: 2.5,
        hours: 24 * 365
      };
    default:
      return {
        decayRate: 0.05,
        momentumWeight: 1.0,
        diversityWeight: 1.5,
        hours: 24
      };
  }
};

const calculateTrendingScore = (postData, periodType) => {
  const params = adjustParametersByPeriod(periodType);

  const baseScore = calculateBaseScore(
    postData.viewIncrease,
    postData.likeIncrease,
    postData.bookmarkCount,
    postData.commentIncrease
  );

  const timeDecay = calculateTimeDecay(
    postData.lastActivityTimestamp || postData.updatedAt,
    params.decayRate
  );

  const currentRate = postData.viewIncrease / params.hours;
  const previousRate = postData.previousStats?.viewRate || 0.01;
  const momentum = calculateMomentum(
    currentRate,
    previousRate,
    params.momentumWeight
  );

  const diversity = calculateUserDiversity(
    postData.uniqueUserCount,
    postData.totalInteractions,
    params.diversityWeight
  );

  // 小数点2桁まで保持（四捨五入）
  const finalScore = baseScore * timeDecay * (1 + momentum) * diversity;
  return Math.round(finalScore * 100) / 100;
  };
  const formatScore = (score) => {
    // 必要に応じて小数点桁数をカスタマイズ
    return score.toFixed(2);
  };
  
module.exports = {
  calculateTrendingScore,
  adjustParametersByPeriod
};