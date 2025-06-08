// backend/utils/totalSeriesRankingCalculator.js
const Series = require('../models/Series');
const Post = require('../models/Post');

// シリーズの総合ランキングスコア計算関数
const calculateTotalSeriesScore = async (series, averagePostScore) => {
    // シリーズの重み付け係数
    const WEIGHTS = {
      follower: 0.6,      // フォロワー数の重み（60%）
      episodes: 0.4       // エピソードスコアの重み（40%）
    };
  
    // フォロワースコア: フォロワー数を対数スケールで評価
    // 基数を10にして、10人で10点、100人で20点、1000人で30点など
    // フォロワーがない場合は 0 点（エピソードスコアのみで評価）
    const followerScore = series.followerCount > 0 
      ? Math.log10(series.followerCount + 1) * 10
      : 0;
    
    // エピソードスコア: 含まれるエピソードの平均スコア
    // エピソードスコアが0や未定義の場合は、作品数に応じた最小スコアを設定
    const episodeCount = series.posts?.length || 0;
    const defaultEpisodeScore = episodeCount > 0 ? episodeCount * 2 : 0;
    const episodeScore = averagePostScore > 0 ? averagePostScore : defaultEpisodeScore;
    
    // 完結状態によるボーナス（完結済みシリーズには10%のボーナス）
    const completedBonus = series.isCompleted ? 1.1 : 1.0;
    
    // 最終スコアを計算
    // フォロワーがない場合はエピソードスコアが100%の重みを持つ
    let rawScore;
    if (followerScore > 0) {
      // 通常計算: フォロワーとエピソードの重み付け
      rawScore = (followerScore * WEIGHTS.follower) + (episodeScore * WEIGHTS.episodes);
    } else {
      // フォロワーなし: エピソードスコアのみで計算
      rawScore = episodeScore;
    }
    
    // 完結ボーナスを適用し、小数点2桁に丸める
    const finalScore = Math.round(rawScore * completedBonus * 100) / 100;
    
    // 重要: 最終スコアが 0 の場合は最小値として 0.01 を設定
    // これにより、フォロワーやエピソードスコアがなくても最低限のランキングに表示される
    const actualFinalScore = finalScore > 0 ? finalScore : 0.01;
    
    // デバッグ情報
    console.log(`[POPULARITY] Calculating score for series ${series._id} (${series.title || 'Untitled'})`);
    console.log(`  Followers: ${series.followerCount || 0} (${followerScore.toFixed(2)})`);
    console.log(`  Average episode score: ${episodeScore.toFixed(2)}`);
    console.log(`  Episode count: ${episodeCount}`);
    console.log(`  Is completed: ${series.isCompleted ? 'Yes' : 'No'} (bonus: ${completedBonus})`);
    console.log(`  Raw score: ${rawScore.toFixed(2)}`);
    console.log(`  Final score: ${actualFinalScore.toFixed(2)}`);
    
    // 計算したスコアをSeriesモデルに保存
    try {
      // シリーズが実際のMongooseドキュメントの場合、findByIdAndUpdateを使用
      if (series._id) {
        await Series.findByIdAndUpdate(series._id, {
          rankingScore: actualFinalScore
        });
        console.log(`[POPULARITY] Updated score for series ${series._id}: ${actualFinalScore}`);
      } else {
        console.warn(`[POPULARITY] Could not update series: No valid _id field`);
      }
    } catch (error) {
      console.error(`[POPULARITY] Error updating series ${series._id}:`, error);
    }
    
    return {
      totalScore: actualFinalScore,
      metrics: {
        followerScore,
        episodeScore,
        completedBonus
      }
    };
  };

module.exports = {
  calculateTotalSeriesScore
};