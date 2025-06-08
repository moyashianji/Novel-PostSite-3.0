// models/Notification.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 通知スキーマ定義
const NotificationSchema = new Schema({
  // 通知の受信者（ユーザーID）
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    index: true // ユーザーIDでのクエリが頻繁に行われるためインデックスを作成
  },
  
  // 通知タイプ
  type: {
    type: String,
    enum: ['post', 'follow', 'system', 'comment', 'like'],
    required: true,
    index: true // タイプでフィルタリングされることが多いためインデックスを作成
  },
  
  // 通知タイトル
  title: {
    type: String,
    required: true
  },
  
  // 通知メッセージ
  message: {
    type: String,
    required: true
  },
  
  // 既読フラグ
  read: {
    type: Boolean,
    default: false,
    index: true // 未読・既読フィルタリングのためにインデックスを作成
  },
  
  // 通知に関連するデータ（タイプにより構造が異なる）
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  
  // 作成日時
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // 時系列順に取得することが多いためインデックスを作成
  },
  
  // 有効期限（任意）
  expiresAt: {
    type: Date,
    default: null
  }
});

// 有効期限が設定されているものは自動的に削除するための TTL インデックス
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 作成時のスタティックメソッド
NotificationSchema.statics.createNotification = async function(
  userId, 
  type, 
  title, 
  message, 
  data = {}, 
  expiresInDays = null
) {
  try {
    // 有効期限の計算（指定がある場合）
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) 
      : null;
    
    // 通知を作成
    const notification = new this({
      user: userId,
      type,
      title,
      message,
      data,
      expiresAt
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('通知作成エラー:', error);
    throw error;
  }
};

// インスタンスメソッド
NotificationSchema.methods.markAsRead = async function() {
  if (!this.read) {
    this.read = true;
    return this.save();
  }
  return this;
};

module.exports = mongoose.model('notification', NotificationSchema);