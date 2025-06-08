/**
 * 超最適化版 閲覧トラッキングサービス
 * 世界最高峰レベルの効率性を目指した実装
 */
const { client: redisClient } = require('../utils/redisClient');
const BinaryViewPacker = require('../utils/binaryPacking');
const ViewAnalytics = require('../models/ViewAnalytics');
const Post = require('../models/Post');
const cron = require('node-cron');

// 🚀 超最適化設定
const CACHE_TTL = 60; // 1分間のキャッシュ
const MAX_BATCH_SIZE = 1000; // バッチサイズを2倍に増加
const BINARY_BUFFER_SIZE = 2000; // バイナリバッファを4倍に増加
const SYNC_INTERVAL_MINUTES = 1; // 同期間隔を5分に延長（負荷軽減）

// 🔧 高性能データ構造
const VIEW_CACHE = new Map(); // メモリキャッシュ（最高速）
const BLOOM_FILTER_SIZE = 1000000; // ブルームフィルター（メモリ効率）
let bloomFilter = null; // 後で初期化

// バッファ管理
let viewBatch = [];
let binaryBuffer = [];
let processingViewBatch = false;
let processingBinaryBuffer = false;

// 🆕 統計情報（デバッグ・モニタリング用）
const stats = {
  totalViews: 0,
  uniqueViews: 0,
  duplicateViews: 0,
  batchesProcessed: 0,
  averageProcessingTime: 0,
  lastProcessingTime: null
};

/**
 * 🆕 シンプルブルームフィルター実装（省メモリ重複チェック）
 */
class SimpleBloomFilter {
  constructor(size = BLOOM_FILTER_SIZE) {
    this.size = size;
    this.bits = new Uint8Array(Math.ceil(size / 8));
    this.hashCount = 3; // ハッシュ関数の数
  }

  hash(str, seed = 0) {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash) % this.size;
  }

  add(item) {
    for (let i = 0; i < this.hashCount; i++) {
      const index = this.hash(item, i);
      const byteIndex = Math.floor(index / 8);
      const bitIndex = index % 8;
      this.bits[byteIndex] |= (1 << bitIndex);
    }
  }

  test(item) {
    for (let i = 0; i < this.hashCount; i++) {
      const index = this.hash(item, i);
      const byteIndex = Math.floor(index / 8);
      const bitIndex = index % 8;
      if (!(this.bits[byteIndex] & (1 << bitIndex))) {
        return false;
      }
    }
    return true;
  }

  // 定期的にリセット（偽陽性を防ぐため）
  reset() {
    this.bits.fill(0);
  }
}

/**
 * 閲覧トラッキング初期化（超最適化版）
 */
function initializeViewTracking() {
  console.log('🚀 超最適化版 閲覧トラッキングシステムを初期化中...');
  
  // ブルームフィルター初期化
  bloomFilter = new SimpleBloomFilter(BLOOM_FILTER_SIZE);
  
  // 🔧 最適化されたタイマー設定
  setInterval(processViewBatch, 1500); // 1.5秒ごと（より細かく処理）
  setInterval(processBinaryBuffer, 90 * 1000); // 1.5分ごと（バランス調整）
  setInterval(cleanupViewCache, 45000); // 45秒ごと（高頻度クリーンアップ）
  setInterval(resetBloomFilter, 10 * 60 * 1000); // 10分ごとにブルームフィルターリセット
  
  // 統計情報の定期出力
  setInterval(printStats, 60 * 1000); // 1分ごとに統計出力
  
  console.log('✅ 超最適化版システムが初期化されました');
  console.log(`📊 設定: バッチ${MAX_BATCH_SIZE}件, バイナリ${BINARY_BUFFER_SIZE}件, 同期${SYNC_INTERVAL_MINUTES}分`);
  return true;
}

/**
 * 超高速閲覧記録（三重重複チェック）
 */
async function recordView(viewData) {
  const startTime = performance.now();
  
  try {
    const { postId, userId, sessionId, userAgent, ip } = viewData;
    
    // IPベース識別
    const identifier = userId || ip;
    const userType = userId ? 'authenticated' : 'guest';
    
    // 🚀 最適化: キャッシュキー生成を高速化
    const timeWindow = Math.floor(Date.now() / (CACHE_TTL * 1000));
    const cacheKey = `${postId}:${identifier}:${timeWindow}`;
    
    stats.totalViews++;
    
    // 🔧 三重重複チェック（超高速）
    
    // 1. メモリキャッシュ（最高速 - O(1)）
    if (VIEW_CACHE.has(cacheKey)) {
      stats.duplicateViews++;
      return { success: true, unique: false, userType, cached: 'memory' };
    }
    
    // 2. ブルームフィルター（省メモリ高速 - O(k)）
    if (bloomFilter.test(cacheKey)) {
      // ブルームフィルターで陽性の場合、Redisで確認
      const redisKey = `view_dedup:${cacheKey}`;
      const exists = await redisClient.get(redisKey);
      
      if (exists) {
        stats.duplicateViews++;
        return { success: true, unique: false, userType, cached: 'redis' };
      }
    }
    
    // 3. 新規閲覧として記録
    const timestamp = Date.now();
    
    // Redis重複防止キー設定
    const redisKey = `view_dedup:${cacheKey}`;
    await redisClient.set(redisKey, '1', 'EX', CACHE_TTL);
    
    // メモリキャッシュとブルームフィルターに追加
    VIEW_CACHE.set(cacheKey, timestamp);
    bloomFilter.add(cacheKey);
    
    stats.uniqueViews++;
    
    // 🔧 最適化: バッチデータ構造を簡素化
    viewBatch.push({
      p: postId,      // 短縮キー名でメモリ効率化
      u: userId,
      s: identifier,
      a: userAgent,
      i: ip,
      t: timestamp,
      y: userType
    });
    
    // バイナリパッキング（省メモリ）
    const packedData = BinaryViewPacker.pack({
      postId: parseInt(postId.toString().substring(0, 8), 16) % 0xFFFFFF,
      userId: userId ? 
        parseInt(userId.toString().substring(0, 8), 16) % 0xFFFFFF : 
        hashString(ip),
      timestamp,
      device: BinaryViewPacker.detectDevice(userAgent),
      country: BinaryViewPacker.detectCountry(ip)
    });
    
    binaryBuffer.push({
      p: postId,      // 短縮キー名
      d: packedData,  // data -> d
      t: new Date(timestamp),
      y: userType
    });
    
    // 🚀 最適化: 適応的バッチ処理
    const currentLoad = viewBatch.length / MAX_BATCH_SIZE;
    if (currentLoad > 0.8 && !processingViewBatch) {
      // 負荷が80%を超えたら即座に処理
      setImmediate(processViewBatch);
    }
    
    if (binaryBuffer.length >= BINARY_BUFFER_SIZE && !processingBinaryBuffer) {
      setImmediate(processBinaryBuffer);
    }
    
    const processingTime = performance.now() - startTime;
    updatePerformanceStats(processingTime);
    
    return { 
      success: true, 
      unique: true, 
      userType,
      processingTime: Math.round(processingTime * 100) / 100 
    };
    
  } catch (error) {
    console.error('Error recording view:', error);
    return { success: false, unique: false, error: error.message };
  }
}

/**
 * 🚀 超高速バッチ処理（最適化済み）
 */
async function processViewBatch() {
  if (viewBatch.length === 0 || processingViewBatch) return;
  
  const batchStartTime = performance.now();
  processingViewBatch = true;
  const batch = [...viewBatch];
  viewBatch.length = 0; // 高速クリア
  
  console.log(`🔄 超高速バッチ処理中... (${batch.length}件)`);
  
  try {
    // 🔧 最適化: Map使用でO(1)集約
    const postCounts = new Map();
    const userViews = [];
    
    // 高速集約処理
    for (const view of batch) {
      const count = postCounts.get(view.p) || 0;
      postCounts.set(view.p, count + 1);
      
      if (view.u) {
        userViews.push({
          userId: view.u,
          postId: view.p,
          timestamp: view.t
        });
      }
    }
    
    // 🚀 最適化: 単一パイプラインで全処理
    const pipeline = redisClient.pipeline();
    
    // 投稿カウンター更新（増分方式）
    for (const [postId, count] of postCounts) {
      pipeline.hincrby(`post:${postId}:increments`, 'viewIncrement', count);
      pipeline.hset(`post:${postId}:increments`, 'pendingSync', '1');
      pipeline.expire(`post:${postId}:increments`, 86400);
      pipeline.zadd('active:posts', Date.now(), postId);
    }
    
    // ユーザー閲覧履歴（重複除去最適化）
    const userPostMap = new Map();
    for (const view of userViews) {
      userPostMap.set(`${view.userId}-${view.postId}`, view);
    }
    
    for (const view of userPostMap.values()) {
      pipeline.zadd(`user:${view.userId}:viewHistory`, view.timestamp, view.postId);
      pipeline.zremrangebyrank(`user:${view.userId}:viewHistory`, 0, -51);
    }
    
    // 🔧 最適化: パイプライン一括実行
    await pipeline.exec();
    
    const batchTime = performance.now() - batchStartTime;
    stats.batchesProcessed++;
    stats.averageProcessingTime = (stats.averageProcessingTime + batchTime) / 2;
    stats.lastProcessingTime = new Date();
    
    console.log(`✅ 超高速バッチ処理完了: ${postCounts.size}投稿、${batch.length}閲覧 (${Math.round(batchTime)}ms)`);
    
  } catch (error) {
    console.error('❌ バッチ処理エラー:', error);
    // エラー時の復旧処理
    if (batch.length > 0) {
      viewBatch.unshift(...batch.slice(0, MAX_BATCH_SIZE)); // サイズ制限付き復旧
    }
  } finally {
    processingViewBatch = false;
    
    // 継続処理の最適化
    if (viewBatch.length > MAX_BATCH_SIZE * 0.5) {
      setImmediate(processViewBatch); // 50%超えたら即座処理
    }
  }
}

/**
 * 🔧 最適化: 超高速バイナリバッファ処理
 */
async function processBinaryBuffer() {
  if (binaryBuffer.length === 0 || processingBinaryBuffer) return;
  
  processingBinaryBuffer = true;
  const buffer = [...binaryBuffer];
  binaryBuffer.length = 0;
  
  console.log(`📦 超高速バイナリ処理中... (${buffer.length}件)`);
  
  try {
    // 🚀 最適化: Map使用でO(1)グループ化
    const postGroups = new Map();
    for (const item of buffer) {
      if (!postGroups.has(item.p)) {
        postGroups.set(item.p, []);
      }
      postGroups.get(item.p).push(item);
    }
    
    // 🔧 最適化: 並列処理用Promise配列
    const operations = [];
    const updatePromises = [];
    
    for (const [postId, items] of postGroups) {
      // 非同期で各投稿を処理
      updatePromises.push(
        (async () => {
          try {
            let analytics = await ViewAnalytics.findOne({ postId: postId });
            
            if (!analytics) {
              analytics = new ViewAnalytics({
                postId: postId,
                packedViewData: [],
                timeWindows: [],
                previousMetrics: [],
                lastUpdated: new Date()
              });
            }
            
            // バイナリデータを効率的に追加
            const newPackedData = items.map(item => ({
              data: item.d, // 短縮キー
              timestamp: item.t
            }));
            
            analytics.packedViewData.push(...newPackedData);
            analytics.lastUpdated = new Date();
            
            return analytics.save();
          } catch (error) {
            console.error(`❌ 投稿 ${postId} 処理エラー:`, error);
            return null;
          }
        })()
      );
    }
    
    // 🚀 並列実行で最大速度
    const results = await Promise.allSettled(updatePromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    console.log(`✅ 超高速バイナリ処理完了: ${successCount}/${postGroups.size}投稿成功`);
    
  } catch (error) {
    console.error('❌ バイナリ処理エラー:', error);
    binaryBuffer.unshift(...buffer); // 復旧
  } finally {
    processingBinaryBuffer = false;
  }
}

/**
 * 🔧 最適化: 適応的MongoDB同期（負荷分散）
 */
cron.schedule(`*/${SYNC_INTERVAL_MINUTES} * * * *`, async () => {
  const syncStartTime = performance.now();
  
  try {
    // 🚀 最適化: 一括取得で効率化
    const keys = await redisClient.keys('post:*:increments');
    
    if (keys.length === 0) return;
    
    console.log(`🔄 適応的MongoDB同期中... (${keys.length}投稿)`);
    
    // 🔧 最適化: 並列処理でスループット向上
    const CONCURRENT_LIMIT = 10; // 同時処理数制限
    const chunks = [];
    for (let i = 0; i < keys.length; i += CONCURRENT_LIMIT) {
      chunks.push(keys.slice(i, i + CONCURRENT_LIMIT));
    }
    
    let successCount = 0;
    let totalIncrement = 0;
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (key) => {
        try {
          const postId = key.split(':')[1];
          const increments = await redisClient.hgetall(key);
          
          if (increments?.viewIncrement && increments?.pendingSync === '1') {
            const incrementCount = parseInt(increments.viewIncrement, 10);
            
            // MongoDB原子的更新
            const result = await Post.findByIdAndUpdate(
              postId,
              { $inc: { viewCounter: incrementCount } },
              { new: true, upsert: false }
            );
            
            if (result) {
              await redisClient.del(key); // 成功時のみ削除
              totalIncrement += incrementCount;
              successCount++;
              return { postId, increment: incrementCount, total: result.viewCounter };
            }
          }
          return null;
        } catch (error) {
          console.error(`❌ 投稿同期エラー: ${key}`, error);
          return null;
        }
      });
      
      await Promise.allSettled(chunkPromises);
    }
    
    const syncTime = performance.now() - syncStartTime;
    console.log(`✅ MongoDB同期完了: ${successCount}件成功, 合計+${totalIncrement}閲覧 (${Math.round(syncTime)}ms)`);
    
  } catch (error) {
    console.error('❌ MongoDB同期エラー:', error);
  }
});

/**
 * 🆕 パフォーマンス統計の更新
 */
function updatePerformanceStats(processingTime) {
  // 移動平均でスムージング
  if (stats.averageProcessingTime === 0) {
    stats.averageProcessingTime = processingTime;
  } else {
    stats.averageProcessingTime = stats.averageProcessingTime * 0.9 + processingTime * 0.1;
  }
}

/**
 * 🆕 統計情報の出力
 */
function printStats() {
  const memoryUsage = process.memoryUsage();
  console.log(`📊 システム統計:
    総閲覧: ${stats.totalViews.toLocaleString()}
    ユニーク: ${stats.uniqueViews.toLocaleString()}
    重複: ${stats.duplicateViews.toLocaleString()}
    重複率: ${((stats.duplicateViews / stats.totalViews) * 100).toFixed(1)}%
    バッチ処理: ${stats.batchesProcessed}回
    平均処理時間: ${stats.averageProcessingTime.toFixed(2)}ms
    メモリ使用量: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB
    バッファ状況: view=${viewBatch.length}, binary=${binaryBuffer.length}`);
}

/**
 * ブルームフィルターのリセット
 */
function resetBloomFilter() {
  if (bloomFilter) {
    bloomFilter.reset();
    console.log('🔄 ブルームフィルターをリセットしました');
  }
}

/**
 * 高速キャッシュクリーンアップ
 */
function cleanupViewCache() {
  const now = Date.now();
  const beforeSize = VIEW_CACHE.size;
  
  // 🔧 最適化: 一括削除でO(n)
  const keysToDelete = [];
  for (const [key, timestamp] of VIEW_CACHE) {
    if (now - timestamp > CACHE_TTL * 1000) {
      keysToDelete.push(key);
    }
  }
  
  for (const key of keysToDelete) {
    VIEW_CACHE.delete(key);
  }
  
  const cleanedCount = beforeSize - VIEW_CACHE.size;
  if (cleanedCount > 0) {
    console.log(`🧹 高速クリーンアップ: ${cleanedCount}件削除, 残り${VIEW_CACHE.size}件`);
  }
}

/**
 * 🆕 現在の閲覧数取得（超高速版）
 */
async function getCurrentViewCount(postId) {
  try {
    // 並列取得で高速化
    const [post, pendingIncrement] = await Promise.all([
      Post.findById(postId).select('viewCounter').lean(),
      redisClient.hget(`post:${postId}:increments`, 'viewIncrement')
    ]);
    
    const baseCount = post?.viewCounter || 0;
    const pendingCount = pendingIncrement ? parseInt(pendingIncrement, 10) : 0;
    const totalCount = baseCount + pendingCount;
    
    return { baseCount, pendingCount, totalCount };
  } catch (error) {
    console.error(`❌ 閲覧数取得エラー ${postId}:`, error);
    return { baseCount: 0, pendingCount: 0, totalCount: 0 };
  }
}

/**
 * 文字列ハッシュ（高速版）
 */
function hashString(str) {
  if (!str) return 0;
  
  let hash = 0;
  const len = str.length;
  for (let i = 0; i < len; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash) % 16777216;
}

/**
 * バッファフラッシュ（緊急時用）
 */
async function flushBuffers() {
  const promises = [];
  
  if (viewBatch.length > 0 && !processingViewBatch) {
    promises.push(processViewBatch());
  }
  
  if (binaryBuffer.length > 0 && !processingBinaryBuffer) {
    promises.push(processBinaryBuffer());
  }
  
  if (promises.length > 0) {
    await Promise.allSettled(promises);
    console.log('✅ 緊急バッファフラッシュ完了');
  }
}

/**
 * システム状態の取得
 */
function getSystemStatus() {
  return {
    stats: { ...stats },
    buffers: {
      viewBatch: viewBatch.length,
      binaryBuffer: binaryBuffer.length,
      cacheSize: VIEW_CACHE.size
    },
    processing: {
      viewBatch: processingViewBatch,
      binaryBuffer: processingBinaryBuffer
    },
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };
}

module.exports = {
  initializeViewTracking,
  recordView,
  flushBuffers,
  processViewBatch,
  processBinaryBuffer,
  getCurrentViewCount,
  getSystemStatus,
  stats // 統計情報のエクスポート
};