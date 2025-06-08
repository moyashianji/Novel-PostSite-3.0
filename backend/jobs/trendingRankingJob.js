/**
 * 最適化された急上昇ランキング計算ジョブ
 * スコア計算 → TrendingRankに直接保存 → 超高速取得
 */

const cron = require('node-cron');
const optimizedTrendingService = require('../services/trendingService');
const { client: redisClient } = require('../utils/redisClient');

// テスト環境判定
const isTestEnv = process.env.NODE_ENV === 'development' || process.env.TEST_MODE === 'true';

// 各期間ごとの更新頻度設定（負荷分散）
const SCHEDULE = {
  daily: isTestEnv ? '*/1 * * * *' : '*/5 * * * *',    // テスト:2分ごと, 本番:5分ごと
  weekly: isTestEnv ? '*/1 * * * *' : '*/15 * * * *',  // テスト:3分ごと, 本番:15分ごと
  monthly: isTestEnv ? '*/1 * * * *' : '0 * * * *',    // テスト:4分ごと, 本番:1時間ごと
  yearly: isTestEnv ? '*/1 * * * *' : '0 */6 * * *'    // テスト:5分ごと, 本番:6時間ごと
};

// ロック機構（同時実行防止）
const LOCK_TTL = 120; // 2分
const locks = {};

/**
 * トレンディングジョブを初期化
 */
async function initTrendingJob() {
  try {
    console.log('🚀 最適化された急上昇ランキングジョブを初期化...');
    
    // WASMモジュールを初期化
    const wasmInitialized = await optimizedTrendingService.initTrendingService();
    console.log(`[TRENDING JOB] WASM ${wasmInitialized ? '初期化成功' : '初期化失敗 - JS代替使用'}`);
    
    // サーバー起動時に初回実行（順次実行で負荷分散）
    const periods = ['daily', 'weekly', 'monthly', 'yearly'];
    for (let i = 0; i < periods.length; i++) {
      const period = periods[i];
      const delay = (i + 1) * 30; // 30秒ずつずらして実行
      
      setTimeout(async () => {
        try {
          console.log(`🔄 初回${period}ランキング計算を開始...`);
          await executeTrendingCalculation(period);
        } catch (error) {
          console.error(`❌ 初回${period}ランキング計算エラー:`, error);
        }
      }, delay * 1000);
      
      console.log(`📅 初回${period}ランキング計算を${delay}秒後に実行予定`);
    }
    
    // 定期実行をスケジュール
    for (const [period, schedule] of Object.entries(SCHEDULE)) {
      cron.schedule(schedule, async () => {
        // ロックを確認して同時実行を防止
        if (await acquireLock(period)) {
          try {
            console.log(`🔄 ${period}ランキング計算を開始...`);
            await executeTrendingCalculation(period);
          } catch (error) {
            console.error(`❌ ${period}ランキング計算エラー:`, error);
          } finally {
            releaseLock(period);
          }
        } else {
          console.log(`⏳ ${period}ランキング計算をスキップ（実行中）`);
        }
      });
      
      console.log(`📅 ${period}ランキング定期実行: ${schedule}`);
    }
    
    // 全体のランキング再計算ジョブ（深夜2時）
    const fullRecalcSchedule = isTestEnv ? '*/10 * * * *' : '0 2 * * *';
    cron.schedule(fullRecalcSchedule, async () => {
      if (await acquireLock('full_recalc')) {
        try {
          console.log('🔄 全期間のランキング一括再計算を開始...');
          const result = await optimizedTrendingService.calculateAndSaveAllRankings();
          console.log('✅ 全期間のランキング一括再計算完了:', result);
        } catch (error) {
          console.error('❌ 全期間のランキング一括再計算エラー:', error);
        } finally {
          releaseLock('full_recalc');
        }
      }
    });
    
    console.log(`📅 全体再計算ジョブ: ${fullRecalcSchedule}`);
    console.log('✅ 最適化された急上昇ランキングジョブの初期化完了');
    
    return true;
  } catch (error) {
    console.error('❌ 急上昇ランキングジョブの初期化エラー:', error);
    return false;
  }
}

/**
 * ロック取得
 */
async function acquireLock(period) {
  const lockKey = `lock:trending_optimized:${period}`;
  
  try {
    // メモリロックをチェック
    if (locks[period] && locks[period] > Date.now()) {
      return false;
    }
    
    // Redisロックをチェック
    const result = await redisClient.set(lockKey, '1', 'EX', LOCK_TTL, 'NX');
    
    if (result === 'OK') {
      // メモリロックも設定
      locks[period] = Date.now() + (LOCK_TTL * 1000);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ ${period}のロック取得エラー:`, error);
    return false;
  }
}

/**
 * ロック解放
 */
async function releaseLock(period) {
  const lockKey = `lock:trending_optimized:${period}`;
  
  try {
    // メモリロックを解放
    delete locks[period];
    
    // Redisロックを解放
    await redisClient.del(lockKey);
  } catch (error) {
    console.error(`❌ ${period}のロック解放エラー:`, error);
  }
}

/**
 * トレンディング計算実行
 */
async function executeTrendingCalculation(period) {
  const startTime = Date.now();
  
  try {
    // 最適化されたサービスでランキング計算・保存
    const result = await optimizedTrendingService.calculateAndSavePeriodRanking(period);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`✅ ${period}ランキング計算・保存完了: ${result.count}件 (${duration.toFixed(2)}秒)`);
    
    // Redisキャッシュをクリア（新しいデータを反映）
    await clearTrendingCache(period);
    
    return result;
  } catch (error) {
    console.error(`❌ ${period}ランキング計算失敗:`, error);
    throw error;
  }
}

/**
 * トレンディングキャッシュをクリア
 */
async function clearTrendingCache(period) {
  try {
    // period関連のキャッシュを全削除
    const pattern = `trending_fast:${period}:*`;
    const keys = await redisClient.keys(pattern);
    
    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log(`🧹 ${period}関連キャッシュをクリア: ${keys.length}件`);
    }
  } catch (error) {
    console.error(`❌ ${period}キャッシュクリアエラー:`, error);
  }
}

/**
 * 手動でランキング再計算
 */
async function manualRecalculation(period = 'all') {
  try {
    if (period === 'all') {
      if (await acquireLock('manual_all')) {
        try {
          console.log('🔧 手動で全期間のランキング再計算を実行...');
          const result = await optimizedTrendingService.calculateAndSaveAllRankings();
          
          // 全キャッシュをクリア
          const patterns = ['trending_fast:daily:*', 'trending_fast:weekly:*', 'trending_fast:monthly:*', 'trending_fast:yearly:*'];
          for (const pattern of patterns) {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
              await redisClient.del(...keys);
            }
          }
          
          console.log('✅ 手動全期間再計算完了:', result);
          return result;
        } finally {
          releaseLock('manual_all');
        }
      } else {
        throw new Error('全期間の計算が既に実行中です');
      }
    } else {
      if (await acquireLock(`manual_${period}`)) {
        try {
          console.log(`🔧 手動で${period}ランキング再計算を実行...`);
          const result = await optimizedTrendingService.calculateAndSavePeriodRanking(period);
          
          // 該当期間のキャッシュをクリア
          await clearTrendingCache(period);
          
          console.log(`✅ 手動${period}再計算完了:`, result);
          return result;
        } finally {
          releaseLock(`manual_${period}`);
        }
      } else {
        throw new Error(`${period}の計算が既に実行中です`);
      }
    }
  } catch (error) {
    console.error('❌ 手動再計算エラー:', error);
    throw error;
  }
}

/**
 * システム状態チェック
 */
async function getSystemStatus() {
  try {
    const TrendingRank = require('../models/TrendingRank');
    
    const periods = ['daily', 'weekly', 'monthly', 'yearly'];
    const statusPromises = periods.map(async (period) => {
      const ranking = await TrendingRank.findOne({ period })
        .select('lastUpdated statistics')
        .lean();
      
      const isLocked = locks[period] && locks[period] > Date.now();
      
      return {
        period,
        lastUpdated: ranking?.lastUpdated || null,
        count: ranking?.statistics?.totalPosts || 0,
        averageScore: ranking?.statistics?.averageScore || 0,
        topScore: ranking?.statistics?.topScore || 0,
        calculationTime: ranking?.statistics?.calculationTime || 0,
        isLocked,
        nextRun: getNextRunTime(period)
      };
    });
    
    const statuses = await Promise.all(statusPromises);
    
    return {
      wasm: await optimizedTrendingService.initTrendingService(),
      redis: redisClient.status || 'unknown',
      rankings: statuses,
      environment: process.env.NODE_ENV || 'unknown',
      testMode: isTestEnv
    };
  } catch (error) {
    console.error('❌ システム状態チェックエラー:', error);
    throw error;
  }
}

/**
 * 次回実行時間を取得
 */
function getNextRunTime(period) {
  // cron式を解析して次回実行時間を計算（簡易版）
  const schedule = SCHEDULE[period];
  const now = new Date();
  
  if (schedule.startsWith('*/')) {
    const interval = parseInt(schedule.split('/')[1].split(' ')[0]);
    const nextRun = new Date(now);
    nextRun.setMinutes(Math.ceil(now.getMinutes() / interval) * interval, 0, 0);
    if (nextRun <= now) {
      nextRun.setMinutes(nextRun.getMinutes() + interval);
    }
    return nextRun;
  }
  
  return null; // 複雑なcron式の場合はnullを返す
}

module.exports = {
  initTrendingJob,
  manualRecalculation,
  getSystemStatus,
  executeTrendingCalculation
};