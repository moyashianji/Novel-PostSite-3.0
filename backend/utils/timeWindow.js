/**
 * 時間窓集約システム
 * 閲覧データを時間間隔で効率的に集約
 */
class TimeWindowAggregator {
  /**
   * 時間窓集約クラスを初期化
   * @param {Object} options - 設定オプション
   * @param {number} options.windowSizeMinutes - 各時間窓のサイズ（分）
   * @param {number} options.maxWindowsToKeep - 保持する時間窓の最大数
   */
  constructor(options = {}) {
    this.windowSizeMs = (options.windowSizeMinutes || 10) * 60 * 1000;
    this.maxWindowsToKeep = options.maxWindowsToKeep || 144; // デフォルト24時間分(10分単位)
    this.windows = new Map(); // postId => 時間窓データのマップ
  }

  /**
   * 現在のタイムスタンプが属する時間窓の開始時間を取得
   * @param {number} timestamp - タイムスタンプ(ms)
   * @returns {number} - 時間窓の開始時間(ms)
   */
  getWindowStartTime(timestamp) {
    return Math.floor(timestamp / this.windowSizeMs) * this.windowSizeMs;
  }

  /**
   * イベントを追加
   * @param {Object} event - イベントデータ
   * @param {number} event.postId - 投稿ID
   * @param {number} event.userId - ユーザーID
   * @param {number} event.timestamp - タイムスタンプ
   */
  addEvent(event) {
    const { postId, userId, timestamp = Date.now() } = event;
    const windowStart = this.getWindowStartTime(timestamp);
    
    // 投稿IDごとの時間窓データを取得または初期化
    if (!this.windows.has(postId)) {
      this.windows.set(postId, new Map());
    }
    
    const postWindows = this.windows.get(postId);
    
    // 時間窓データを取得または初期化
    if (!postWindows.has(windowStart)) {
      postWindows.set(windowStart, this._createEmptyWindow(windowStart));
    }
    
    const windowData = postWindows.get(windowStart);
    
    // イベントを集約
    windowData.metrics.totalViews++;
    
    // ユニークユーザー追跡
    if (!windowData.metrics.uniqueUsers.has(userId)) {
      windowData.metrics.uniqueUsers.add(userId);
    }
    
    // タイムスタンプ更新
    windowData.lastUpdated = Math.max(windowData.lastUpdated, timestamp);
    
    // 古い時間窓を削除
    this._cleanOldWindows(postId);
  }

  /**
   * 投稿IDの全時間窓データを取得
   * @param {number} postId - 投稿ID
   * @returns {Array<Object>} - 時間窓データの配列
   */
  getWindowsForPost(postId) {
    if (!this.windows.has(postId)) {
      return [];
    }
    
    const postWindows = this.windows.get(postId);
    const result = [];
    
    // 時間順にソート
    const windowStarts = [...postWindows.keys()].sort();
    
    for (const windowStart of windowStarts) {
      const windowData = postWindows.get(windowStart);
      result.push({
        startTime: windowStart,
        endTime: windowStart + this.windowSizeMs,
        metrics: {
          uniqueUsers: windowData.metrics.uniqueUsers.size,
          totalViews: windowData.metrics.totalViews,
        },
        lastUpdated: windowData.lastUpdated
      });
    }
    
    return result;
  }

  /**
   * 集約データを時間範囲で取得
   * @param {number} postId - 投稿ID
   * @param {number} startTime - 開始時間
   * @param {number} endTime - 終了時間
   * @returns {Object} - 集約データ
   */
  getAggregatedMetrics(postId, startTime, endTime) {
    const windows = this.getWindowsForPost(postId).filter(
      window => window.startTime >= startTime && window.endTime <= endTime
    );
    
    // 集約結果の初期化
    const result = {
      uniqueUsers: new Set(),
      totalViews: 0,
      windowsCount: windows.length
    };
    
    // 時間窓データを集約
    for (const window of windows) {
      result.totalViews += window.metrics.totalViews;
    }
    
    // ユニークユーザー数を集計（実際には直接カウントできないので推定値）
    result.uniqueUsersCount = windows.reduce(
      (sum, window) => sum + window.metrics.uniqueUsers, 
      0
    );
    
    // ユニークユーザー数の推定係数（重複を考慮）
    // 窓数が多いほど重複が発生するため、調整係数を適用
    const correctionFactor = Math.max(0.7, 1 - (windows.length * 0.01));
    result.uniqueUsersEstimate = Math.round(result.uniqueUsersCount * correctionFactor);
    
    return result;
  }

  /**
   * 新しい空の時間窓データを作成
   * @param {number} windowStart - 時間窓の開始時間
   * @returns {Object} - 空の時間窓データ
   */
  _createEmptyWindow(windowStart) {
    return {
      startTime: windowStart,
      endTime: windowStart + this.windowSizeMs,
      metrics: {
        uniqueUsers: new Set(),
        totalViews: 0,
      },
      lastUpdated: windowStart
    };
  }

  /**
   * 古い時間窓を削除してメモリを節約
   * @param {number} postId - 投稿ID
   */
  _cleanOldWindows(postId) {
    if (!this.windows.has(postId)) return;
    
    const postWindows = this.windows.get(postId);
    if (postWindows.size <= this.maxWindowsToKeep) return;
    
    // 時間窓を時間順でソート
    const windowStarts = [...postWindows.keys()].sort();
    
    // 最古の時間窓から削除
    const toRemove = windowStarts.length - this.maxWindowsToKeep;
    for (let i = 0; i < toRemove; i++) {
      postWindows.delete(windowStarts[i]);
    }
  }

  /**
   * 指定した期間の時間窓を圧縮
   * @param {number} postId - 投稿ID
   * @param {number} startTime - 開始時間
   * @param {number} endTime - 終了時間
   * @param {string} targetPeriod - 圧縮先の期間 ('hour', 'day', 'week', 'month')
   * @returns {Object} - 圧縮された時間窓データ
   */
  compressWindows(postId, startTime, endTime, targetPeriod) {
    // 時間窓をフィルタリング
    const windows = this.getWindowsForPost(postId).filter(
      window => window.startTime >= startTime && window.endTime <= endTime
    );
    
    if (windows.length === 0) {
      return null;
    }
    
    // 集約データの初期化
    const aggregatedData = {
      startTime,
      endTime,
      uniqueUsers: 0,
      totalViews: 0
    };
    
    // ユニークユーザーの集合（全期間）
    let allUniqueUsers = new Set();
    
    // 総閲覧数の集計
    let totalViews = 0;
    
    // 各時間窓のデータを集計
    for (const window of windows) {
      totalViews += window.metrics.totalViews;
      
      // 現実には直接マージできないので、概算値
      allUniqueUsers.size += window.metrics.uniqueUsers;
    }
    
    // 重複率を推定
    const DUPLICATION_FACTORS = {
      'hour': 0.95, // 1時間以内の重複は少ない
      'day': 0.7,   // 1日間なら30%程度が重複
      'week': 0.5,  // 1週間なら半分程度が重複
      'month': 0.3  // 1月なら70%程度が重複
    };
    
    // ユニークユーザー数を推定
    const duplicationFactor = DUPLICATION_FACTORS[targetPeriod] || 0.5;
    aggregatedData.uniqueUsers = Math.round(allUniqueUsers.size * duplicationFactor);
    aggregatedData.totalViews = totalViews;
    
    return aggregatedData;
  }

  /**
   * 時間窓データをシリアライズ
   * @returns {string} - JSON文字列
   */
  serialize() {
    const serialized = {};
    
    // 各投稿の時間窓をシリアライズ
    for (const [postId, postWindows] of this.windows.entries()) {
      serialized[postId] = {};
      
      for (const [windowStart, windowData] of postWindows.entries()) {
        serialized[postId][windowStart] = {
          metrics: {
            uniqueUsers: Array.from(windowData.metrics.uniqueUsers),
            totalViews: windowData.metrics.totalViews
          },
          lastUpdated: windowData.lastUpdated
        };
      }
    }
    
    return JSON.stringify(serialized);
  }

  /**
   * シリアライズされたデータから復元
   * @param {string} serialized - シリアライズされたJSON文字列
   */
  deserialize(serialized) {
    const data = JSON.parse(serialized);
    this.windows.clear();
    
    // 各投稿の時間窓を復元
    for (const [postId, serializedWindows] of Object.entries(data)) {
      const postWindows = new Map();
      
      for (const [windowStart, windowData] of Object.entries(serializedWindows)) {
        const start = parseInt(windowStart);
        
        const restored = {
          startTime: start,
          endTime: start + this.windowSizeMs,
          metrics: {
            uniqueUsers: new Set(windowData.metrics.uniqueUsers),
            totalViews: windowData.metrics.totalViews
          },
          lastUpdated: windowData.lastUpdated
        };
        
        postWindows.set(start, restored);
      }
      
      this.windows.set(parseInt(postId), postWindows);
    }
  }
}

module.exports = TimeWindowAggregator;