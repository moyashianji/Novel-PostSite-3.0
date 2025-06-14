// middlewares/authenticateToken.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    // トークンがない場合はゲストとして続行
    return next();
  }

  // トークンの検証
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      // 無効なトークンでもゲストとして続行
      return next();
    }

    try {
      // JWTのペイロードからユーザーIDを取得（decoded.id または decoded.userId）
      const userId = decoded.id || decoded.userId;
      
      if (!userId) {
        return next();
      }

      const user = await User.findById(userId);
      if (!user) {
        return next(); // ユーザーが見つからない場合もゲストとして続行
      }

      // ユーザー情報をリクエストに保存
      req.user = user;
      
      // 現在認証済みのユーザーID
      req.authUserId = userId;
      
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
      return next(); // エラーが発生してもゲストとして続行
    }
  });
};

module.exports = authenticateToken;