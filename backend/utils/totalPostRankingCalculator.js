// backend/utils/totalPostRankingCalculator.js
const Post = require('../models/Post');
const ViewAnalytics = require('../models/ViewAnalytics');

// 総合ランキングのスコア計算関数
const calculateTotalScore = async (post, viewData) => {
    // ベーススコア: コメント数、本棚追加数、いいね数の重み付け合計
    const WEIGHTS = {
      comment: 2.5,     // コメントの重み
      bookmark: 2.0,    // 本棚追加の重み
      like: 1.0,        // いいねの重み
      view: 0.1         // 閲覧数の重み
    };
  
    // 各メトリクスのスコア計算
    const commentScore = (post.comments?.length || 0) * WEIGHTS.comment;
    const bookmarkScore = (post.bookShelfCounter || 0) * WEIGHTS.bookmark;
    const likeScore = (post.goodCounter || 0) * WEIGHTS.like;
    
    // ユニークユーザー数の取得
    const uniqueUsersCount = viewData?.uniqueViewers?.length || 0;
    const viewScore = (uniqueUsersCount || 0) * WEIGHTS.view;
  
    // 基本スコア
    const baseScore = commentScore + bookmarkScore + likeScore + viewScore;
    
    // ユニークユーザー係数: ユニークユーザー数が多いほどスコアが高くなる
    // ユニークユーザーが0の場合は係数を1.0（影響なし）とする
    const uniqueUserFactor = uniqueUsersCount > 0 
        ? Math.min(1.0 + (uniqueUsersCount * 0.005), 2.0)  // 200人で最大2.0になる
        : 1.0;
  
    // 最終スコアを計算（小数点2桁まで）
    const finalScore = Math.round(baseScore * uniqueUserFactor * 100) / 100;
    
    // デバッグ情報
    console.log(`[RANKING] Calculating score for post ${post._id} (${post.title || 'Untitled'})`);
    console.log(`  Comments: ${post.comments?.length || 0} (${commentScore})`);
    console.log(`  Bookmarks: ${post.bookShelfCounter || 0} (${bookmarkScore})`);
    console.log(`  Likes: ${post.goodCounter || 0} (${likeScore})`);
    console.log(`  Unique viewers: ${uniqueUsersCount} (${viewScore})`);
    console.log(`  Unique user factor: ${uniqueUserFactor.toFixed(2)}`);
    console.log(`  Final score: ${finalScore.toFixed(2)}`);
    
    // 計算したスコアをPostモデルに保存
    try {
      await Post.findByIdAndUpdate(post._id, {
        rankingScore: finalScore
      });
      
      console.log(`[RANKING] Updated score for post ${post._id}: ${finalScore}`);
    } catch (error) {
      console.error(`[RANKING] Error updating post ${post._id}:`, error);
    }
    
    return {
      totalScore: finalScore,
      metrics: {
        commentScore,
        bookmarkScore,
        likeScore,
        viewScore,
        uniqueUsersCount,
        uniqueUserFactor
      }
    };
  };
module.exports = {
  calculateTotalScore
};