/**
 * 修正版：バイナリパッキングユーティリティ
 * タイムスタンプの精度とオーバーフロー問題を解決
 */
class BinaryViewPacker {
  /**
   * 閲覧データをバイナリにパックする - 修正版
   * @param {Object} viewData - 閲覧データ
   * @param {Number} viewData.postId - 投稿ID (24ビット)
   * @param {Number} viewData.userId - ユーザーID (24ビット)
   * @param {Number|undefined} viewData.timestamp - タイムスタンプ (デフォルト: 現在時刻)
   * @param {Number|undefined} viewData.device - デバイスコード (4ビット)
   * @param {Number|undefined} viewData.country - 国コード (4ビット)
   * @returns {Buffer} - 10バイトの圧縮データ（1バイト増加）
   */
  static pack(viewData) {
    // ✅ 修正：2020年1月1日を基準とし、分単位ではなく時間単位で保存
    const timestamp = viewData.timestamp || Date.now();
    
    // 2020年1月1日からの経過時間数で表現（32ビット）
    const baseTime = new Date('2020-01-01T00:00:00Z').getTime();
    const hoursSinceBase = Math.floor((timestamp - baseTime) / (60 * 60 * 1000));
    
    // 各部分を別々にBigIntに変換して計算
    const postIdPart = BigInt(viewData.postId & 0xFFFFFF) << 40n;
    const userIdPart = BigInt(viewData.userId & 0xFFFFFF) << 16n;
    const timestampPart = BigInt(hoursSinceBase & 0xFFFF); // 16ビットで時間を表現
    
    // BigInt演算で組み合わせる
    const packed = postIdPart | userIdPart | timestampPart;
    
    // デバイス・国情報を1バイトに圧縮
    const device = viewData.device || 0;
    const country = viewData.country || 0;
    const flags = ((device & 0xF) << 4) | (country & 0xF);
    
    // 10バイトのバッファ作成（1バイト増加）
    const buffer = Buffer.alloc(10);
    
    // 最初の8バイトに64ビット整数を書き込み
    buffer.writeBigUInt64BE(packed, 0);
    
    // 9バイト目にフラグを書き込み
    buffer.writeUInt8(flags, 8);
    
    // ✅ 新追加：10バイト目に分単位の精度を保存（0-59分）
    const minutesInHour = Math.floor((timestamp % (60 * 60 * 1000)) / (60 * 1000));
    buffer.writeUInt8(minutesInHour, 9);
    
    return buffer;
  }
    
  /**
   * バイナリデータを元のオブジェクトに戻す - 修正版
   * @param {Buffer} buffer - 9-10バイトのバッファ（後方互換性対応）
   * @returns {Object} - 元の閲覧データ
   */
  static unpack(buffer) {
    // 後方互換性：9バイトの場合は従来のロジック、10バイトの場合は新ロジック
    const isOldFormat = buffer.length === 9;
    
    if (isOldFormat) {
      // 従来のロジック（2000年基準、分単位）
      const packed = buffer.readBigUInt64BE(0);
      const flags = buffer.readUInt8(8);
      
      const postId = Number((packed >> 40n) & 0xFFFFFFn);
      const userId = Number((packed >> 16n) & 0xFFFFFFn);
      const minutesSinceEpoch = Number(packed & 0xFFFFn);
      
      // 2000年1月1日基準からの変換
      const timestamp = (minutesSinceEpoch + 26298240) * 60000;
      
      const device = (flags >> 4) & 0xF;
      const country = flags & 0xF;
      
      return {
        postId,
        userId,
        timestamp,
        device,
        country,
        format: 'old'
      };
    } else {
      // ✅ 新ロジック（2020年基準、時間+分単位）
      const packed = buffer.readBigUInt64BE(0);
      const flags = buffer.readUInt8(8);
      const minutesInHour = buffer.readUInt8(9);
      
      const postId = Number((packed >> 40n) & 0xFFFFFFn);
      const userId = Number((packed >> 16n) & 0xFFFFFFn);
      const hoursSinceBase = Number(packed & 0xFFFFn);
      
      // 2020年1月1日基準からの変換（時間単位 + 分精度）
      const baseTime = new Date('2020-01-01T00:00:00Z').getTime();
      const timestamp = baseTime + (hoursSinceBase * 60 * 60 * 1000) + (minutesInHour * 60 * 1000);
      
      const device = (flags >> 4) & 0xF;
      const country = flags & 0xF;
      
      return {
        postId,
        userId,
        timestamp,
        device,
        country,
        format: 'new'
      };
    }
  }
  
  /**
   * ✅ 新機能：タイムスタンプの有効期間を計算
   * @param {string} format - 'old' または 'new'
   * @returns {Object} - {start: Date, end: Date}
   */
  static getValidTimeRange(format = 'new') {
    if (format === 'old') {
      // 旧形式：2000年基準、16ビット分単位
      const baseTime = new Date('2000-01-01T00:00:00Z');
      const maxMinutes = 0xFFFF;
      const endTime = new Date(baseTime.getTime() + maxMinutes * 60 * 1000);
      
      return {
        start: baseTime,
        end: endTime,
        range: `${maxMinutes} minutes (~${Math.floor(maxMinutes / (24 * 60))} days)`
      };
    } else {
      // 新形式：2020年基準、16ビット時間単位
      const baseTime = new Date('2020-01-01T00:00:00Z');
      const maxHours = 0xFFFF;
      const endTime = new Date(baseTime.getTime() + maxHours * 60 * 60 * 1000);
      
      return {
        start: baseTime,
        end: endTime,
        range: `${maxHours} hours (~${Math.floor(maxHours / (24 * 365))} years)`
      };
    }
  }
  
  /**
   * デバイスタイプをコードに変換
   * @param {string} userAgent - ユーザーエージェント文字列
   * @returns {number} - デバイスコード
   */
  static detectDevice(userAgent) {
    if (!userAgent) return 0;
    
    const ua = userAgent.toLowerCase();
    
    if (/(android|webos|iphone|ipod|blackberry|iemobile|opera mini)/i.test(ua)) {
      return 1; // スマートフォン
    } else if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
      return 2; // タブレット
    }
    
    return 0; // デスクトップ (デフォルト)
  }
  
  /**
   * 国コードを生成
   * @param {string} ip - IPアドレス
   * @returns {number} - 国コード
   */
  static detectCountry(ip) {
    // 実際の実装では、GeoIPデータベースを使用して国を特定します
    // ここでは簡易的に日本(9)を返します
    return 9; // デフォルト：日本
  }
  
  /**
   * ✅ 新機能：バイナリデータのテスト・検証
   * @param {Object} testData - テスト用データ
   * @returns {Object} - テスト結果
   */
  static test(testData = null) {
    const defaultTestData = {
      postId: Math.floor(Math.random() * 0xFFFFFF),
      userId: Math.floor(Math.random() * 0xFFFFFF),
      timestamp: Date.now(),
      device: 1,
      country: 9
    };
    
    const data = testData || defaultTestData;
    
    try {
      // パック
      const packed = this.pack(data);
      
      // アンパック
      const unpacked = this.unpack(packed);
      
      // 検証
      const timeDiff = Math.abs(data.timestamp - unpacked.timestamp);
      const isAccurate = timeDiff < 60000; // 1分以内の誤差
      
      return {
        success: true,
        original: data,
        packed: packed,
        unpacked: unpacked,
        timeDifference: timeDiff,
        isAccurate: isAccurate,
        packedSize: packed.length,
        format: unpacked.format
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        original: data
      };
    }
  }
}

module.exports = BinaryViewPacker;