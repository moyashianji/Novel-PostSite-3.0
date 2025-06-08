const mongoose = require('mongoose');
const crypto = require('crypto');

// 閲覧履歴アイテムのスキーマ
const viewHistoryItemSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  viewedAt: { type: Date, default: Date.now },
});
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, 
    required: true 
  },
  resetPasswordToken: { type: String }, // パスワードリセット用のトークン
  resetPasswordExpires: { type: Date }, // トークンの有効期限
  
  nickname: { type: String, required: true },
  icon: { type: String}, // アイコン画像のURLを保存
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  description: { type: String, default: '' },
  xLink: { type: String, default: '' },
  pixivLink: { type: String, default: '' },
  otherLink: { type: String, default: '' },
  favoriteAuthors: [{ type: String }], // Add this field for favorite authors

  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // 追加: いいねした投稿のIDを保存
  
  followerCount: { type: Number, default: 0 },

  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // フォロワーのリスト
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // フォローしているユーザーのリスト
  followingSeries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Series' }],

  bookmarks: [
    {
      novelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
      position: Number,                 // スクロール位置
      pageNumber: { type: Number },     // ページ番号（あれば）
      textFragment: { type: String },   // 位置特定用のテキスト断片
      date: { type: Date, default: Date.now },
    },
  ],
  bookShelf: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // 本棚に追加されたポスト
  // その他のフィールド

    // 閲覧履歴 - 新しく追加
    viewHistory: [viewHistoryItemSchema],
  
  tagContainers: [
    {
      tag: { type: String, required: true },
      index: { type: Number, required: true }  // インデックスを明示的に保持

    }
  ]
}, {
  toJSON: {
    transform: function (doc, ret) {
      delete ret?.password;  // パスワードを常に削除
      delete ret?.email;  // パスワードを常に削除
      delete ret?.dob;  // パスワードを常に削除
      delete ret?.gender;  // パスワードを常に削除
      delete ret?.likedPosts;  // パスワードを常に削除
      delete ret?.following;  // パスワードを常に削除
      delete ret?.bookmarks;  // パスワードを常に削除
      delete ret?.bookShelf;  // パスワードを常に削除
      delete ret?.viewHistory; // 閲覧履歴も非表示に
      delete ret?.followingSeries; // フォローシリーズも非表示

      delete ret?.tagContainers;
      return ret;
    }
  }
}, { timestamps: true });



const User = mongoose.model('User', userSchema);

module.exports = User;
