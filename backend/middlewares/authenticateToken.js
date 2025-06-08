// middlewares/authenticateToken.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;  // クッキー名が "token" であることを前提

  if (!token) {
    return res.status(401).json({ message: 'トークンがありません' }); // トークンがない場合
  }

  // トークンの検証
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: '無効なトークンです' }); // トークンが無効な場合
    }

    try {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'ユーザーが見つかりません' }); // ユーザーが見つからない場合
      }

      // ユーザー情報をリクエストに保存
      req.user = user;
      
      // 現在認証済みのユーザーID
      req.authUserId = decoded.id;
      
      // レスポンス送信前の処理をオーバーライド
      const originalJson = res.json;
      res.json = function(obj) {
        // ユーザー情報を返す場合で、認証済みユーザー自身の情報なら
        if (obj && obj._id && obj._id.toString() === req.authUserId) {
          // ユーザーオブジェクトのコピーを作成
          const userObj = { ...obj.toObject() };
          
          // 誕生日情報を取得して追加（モンゴースドキュメントから直接）
          userObj.dob = user.dob;
          
          // 修正したオブジェクトを返す
          return originalJson.call(this, userObj);
        }
        
        // それ以外は通常通り処理
        return originalJson.call(this, obj);
      };
      
      next(); // 次のミドルウェアへ
    } catch (error) {
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  });
};

module.exports = authenticateToken;