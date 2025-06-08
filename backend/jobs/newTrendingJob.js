/**
 * 新しい急上昇ランキングジョブ
 */
const cron = require('node-cron');
const trendingService = require('../services/trendingService');

// ロック機構
let isRunning = false;

// テスト環境判定
const isTestEnv = process.env.NODE_ENV === 'development' || process.env.TEST_MODE === 'true';

// 急上昇スコアの計算スケジュール
// テスト環境では短い間隔、プロダクションでは適切な間隔

// 日次スコア: 1時間ごと
cron.schedule(isTestEnv ? '*/2 * * * *' : '0 * * * *', async () => {
  console.log('🔥 急上昇スコア計算ジョブを開始します...');
  await runTrendingCalculation();
});

/**
 * 急上昇スコア計算を実行
 */
async function runTrendingCalculation() {
  if (isRunning) {
    console.log('⚠️ 急上昇スコア計算が既に実行中です。スキップします。');
    return;
  }
  
  try {
    isRunning = true;
    console.log('🚀 急上昇スコア計算を開始...');
    
    const startTime = Date.now();
    
    // 全投稿の急上昇スコアを計算
    const result = await trendingService.calculateAllTrendingScores();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`✅ 急上昇スコア計算が完了しました`);
    console.log(`📊 処理結果: 成功 ${result.success}/${result.processed} 件`);
    console.log(`⏱️ 処理時間: ${duration.toFixed(2)}秒`);
    
    // 統計を出力
    if (result.processed > 0) {
      const successRate = (result.success / result.processed * 100).toFixed(1);
      console.log(`📈 成功率: ${successRate}%`);
    }
  } catch (error) {
    console.error('❌ 急上昇スコア計算でエラーが発生しました:', error);
  } finally {
    isRunning = false;
    console.log('🔄 急上昇スコア計算ジョブが終了しました\n');
  }
}

/**
 * 手動で急上昇スコア計算を実行
 */
async function manualCalculation() {
  if (isRunning) {
    console.log('⚠️ 急上昇スコア計算が既に実行中です。');
    return false;
  }
  
  console.log('🔧 手動で急上昇スコア計算を実行します...');
  await runTrendingCalculation();
  return true;
}

module.exports = {
  runTrendingCalculation,
  manualCalculation
};