const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const nodemailer = require('nodemailer');
const upload = require('../middlewares/upload');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit')
const authenticateToken = require('../middlewares/authenticateToken');
const crypto = require('crypto');


const router = express.Router();
// ユーザーごとにログイン試行回数を追跡するためのストア
const loginAttempts = {};
const LOGIN_ATTEMPT_LIMIT = 10; // 10回以上失敗でレートリミット
const CAPTCHA_REQUIRED_LIMIT = 3; // 3回以上失敗でCAPTCHA表示

// リミット設定: 15分間に5回までリクエストを許可
const registerStep3Limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分
  max: 20, // 5分間に20回まで
  headers: true, // レスポンスヘッダーにレートリミット情報を含める
  handler: (req, res) => {
    res.status(429).json({
      message: 'リクエストの回数制限に達しました。5分後に再試行してください。',
    });
  },
});

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15分間のウィンドウ
  max: 20, // 5回までリクエスト許可
  headers: true, // レスポンスヘッダーにレートリミット情報を含める
  handler: (req, res) => {
    res.status(429).json({
      message: 'リクエストの回数制限に達しました。5分後に再試行してください。',
    });
  },
  keyGenerator: (req) => req.ip,  // ユーザーのIPアドレスをベースに制限
});

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // 本番環境でのみHTTPSに制限
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, // 1日間有効
};
// Nodemailerの設定 (メール送信用)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // 587 を使う場合は false
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ReCAPTCHA検証用の関数
const verifyRecaptcha = async (recaptchaToken) => {
  const recaptchaSecret = process.env.RECAPTCHA_SECRET;
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
  });
  const data = await response.json();
  return data.success;
};

const verifyTooManyLoginRecaptcha = async (recaptchaToken) => {
  const secretKey = process.env.RECAPTCHA_SECRET;
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`, {
    method: 'POST',
  });
  const data = await response.json();
  return data.success;
};

// ReCAPTCHA検証
const verifyForgotPassReCAPTCHA = async (token) => {
  const secret = process.env.RECAPTCHA_SECRET;
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`, {
    method: 'POST',
  });
  const data = await response.json();
  return data.success;
};

const verifyResetPasswordRecaptcha = async (recaptchaToken) => {
  const secretKey = process.env.RECAPTCHA_SECRET;
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`, {
    method: 'POST',
  });
  const data = await response.json();
  return data.success;
};

// パスワードリセットトークンの生成
const generateResetToken = () => {
  // 32バイトのランダムな値を生成し、16進数で返す
  return crypto.randomBytes(32).toString('hex');
};
// Step 1: 仮登録と確認コードの送信
router.post('/register-step1', [
  body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
  body('password').isLength({ min: 8 }).withMessage('パスワードは8文字以上である必要があります'),
  body('passwordConfirmation').custom((value, { req }) => value === req.body.password)
    .withMessage('パスワード確認が一致しません'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, recaptchaToken } = req.body;

  // ReCAPTCHA検証
  const recaptchaVerified = await verifyRecaptcha(recaptchaToken);
  if (!recaptchaVerified) {
    return res.status(400).json({ message: 'ReCAPTCHA verification failed' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'メールアドレスは既に登録されています' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 確認コード生成
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6桁のコード

    // 確認コードをメールで送信
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification Code',
      text: `Your verification code is: ${verificationCode}`,
    });

    // 仮登録情報と確認コードをセッションに保存
    req.session.tempUserData = { email, password: hashedPassword, verificationCode };
   // デバッグ用にセッション内容をコンソールに表示
   console.log('Step 1 - Session ID:', req.sessionID);

   console.log('Session saved:', req.session);
    res.status(200).json({ message: '仮登録が成功しました。メールで送られた確認コードを入力してください。' });
  } catch (error) {
    console.error('Error in register-step1:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// Step 2: 確認コードの検証
router.post('/register-step2',
  registerStep3Limiter, [
  body('verificationCode')
    .isLength({ min: 6, max: 6 })
    .withMessage('確認コードは6桁の数字である必要があります')
    .isNumeric()
    .withMessage('確認コードは半角数字のみです'),
  ], (req, res) => {
  // セッション内容とIDを確認
  console.log('Step 2 - Session ID:', req.sessionID);
  console.log('Step 2 - Session data:', req.session.tempUserData);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

    // セッション内容をデバッグログに出力
    console.log('Session data:', req.session);

    
  const { verificationCode } = req.body;
  const tempUserData = req.session.tempUserData;

  if (!tempUserData) {
    return res.status(400).json({ message: '仮登録情報がありません。もう一度最初から登録してください。' });
  }

  if (parseInt(verificationCode) !== tempUserData.verificationCode) {
    return res.status(400).json({ message: '確認コードが一致しません。' });
  }

  // 確認コードが正しければ次のステップへ進む
  res.status(200).json({ message: '確認コードが一致しました。次のステップへ進んでください。' });
});

// 確認コード再発行
router.post('/resend-verification-code', async (req, res) => {
  const tempUserData = req.session.tempUserData;

  if (!tempUserData) {
    return res.status(400).json({ message: '仮登録情報がありません。もう一度最初から登録してください。' });
  }

  try {
    const verificationCode = Math.floor(100000 + Math.random() * 900000);  // 新しい6桁のコード
    const expirationTime = new Date(new Date().getTime() + 5 * 60 * 1000);  // 5分後に失効

    // 新しい確認コードをメールで送信
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: tempUserData.email,
      subject: 'New Verification Code',
      text: `Your new verification code is: ${verificationCode}`
    });

    // セッションの確認コードと有効期限を更新
    req.session.tempUserData.verificationCode = verificationCode;
    req.session.tempUserData.verificationExpires = expirationTime;

    res.status(200).json({ message: '新しい確認コードが送信されました。' });
  } catch (error) {
    console.error('Error in resend-verification-code:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});
// Step 3: 本登録用のエンドポイント
router.post('/register-step3', 
  registerStep3Limiter,
  upload.single('icon'), [
  body('nickname')
    .not().isEmpty().withMessage('ニックネームを入力してください')
    .isLength({ max: 30 }).withMessage('ニックネームは30文字以内で入力してください')
    .trim().escape(),  // 特殊文字をエスケープしてサニタイズ
  body('dob').not().isEmpty().withMessage('生年月日を入力してください'),
  body('gender').not().isEmpty().withMessage('性別を選択してください'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // 日付をDateオブジェクトに変換
  const dob = new Date(req.body.dob);
  
  if (isNaN(dob.getTime())) {
    return res.status(400).json({ message: '有効な生年月日を入力してください' });
  }
    // セッション内容とIDを確認
    console.log('Step 3 - Session ID:', req.sessionID);
    console.log('Step 3 - Session data:', req.session.tempUserData);

  const { nickname, gender } = req.body;
  const iconPath = req.file ? `/uploads/${req.file.filename}` : '';

  const tempUserData = req.session.tempUserData;

  if (!tempUserData) {
    return res.status(400).json({ message: '仮登録情報がありません。もう一度最初から登録してください。' });
  }

  try {
    const newUser = new User({
      email: tempUserData.email,
      password: tempUserData.password,
      nickname,
      dob,
      gender,
      icon: iconPath,
    });

    await newUser.save();

      // JWTトークンの生成
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });


      // クッキーにJWTを設定
      res.cookie('token', token, cookieOptions);
    // 登録完了後、セッションから仮登録データを削除
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'サーバーエラーが発生しました' });
      }
      
      // JWTトークンの生成
      //const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });

      // セッション削除後に応答
      res.status(201).json({ message: 'ユーザー登録が完了しました', token });
    });

  } catch (error) {
    console.error('Error in register-step3:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});
// ログイン失敗回数を追跡する関数
const trackFailedLoginAttempt = (ip) => {
  if (!loginAttempts[ip]) {
    loginAttempts[ip] = 1;
  } else {
    loginAttempts[ip] += 1;
  }
};

// ログイン試行回数をリセットする関数
const resetLoginAttempts = (ip) => {
  loginAttempts[ip] = 0;
};

// ログインのエンドポイント
router.post('/login',
  loginLimiter, [
  body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
  body('password').isLength({ min: 8 }).withMessage('パスワードは8文字以上である必要があります'),
], async (req, res) => {
  const { email, password,recaptchaToken } = req.body;

  const ip = req.ip;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      trackFailedLoginAttempt(ip);
      if (loginAttempts[ip] >= CAPTCHA_REQUIRED_LIMIT) {
        return res.status(429).json({ message: 'Too many attempts' });
      }
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      trackFailedLoginAttempt(ip);
      if (loginAttempts[ip] >= CAPTCHA_REQUIRED_LIMIT) {
        return res.status(429).json({ message: 'Too many attempts' });
      }
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // CAPTCHAが必要な場合、ReCAPTCHAトークンを確認
    if (loginAttempts[ip] >= CAPTCHA_REQUIRED_LIMIT) {
      if (!recaptchaToken) {
        return res.status(400).json({ message: 'CAPTCHA is required' });
      }
      const isHuman = await verifyTooManyLoginRecaptcha(recaptchaToken);
      if (!isHuman) {
        return res.status(400).json({ message: 'Failed CAPTCHA verification' });
      }
    }

    // ログイン成功
    resetLoginAttempts(ip); // 失敗回数をリセット
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true });
    res.status(200).json({ message: 'ログインに成功しました。' });

  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ message: 'ログイン処理に失敗しました。' });
  }
});

// ミドルウェアを使用するルートの例
router.get('/user/me', authenticateToken, (req, res) => {
  res.json(req.user); // 認証されたユーザー情報を返す
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 5, // 最大5回まで
  message: 'Too many reset attempts, please try again later.',
});

// パスワードリセットのリクエスト
router.post('/forgot-password', resetLimiter, async (req, res) => {
  const { email, recaptchaToken } = req.body;

  try {
    console.log('Received password reset request');
    console.log('Email:', email);

    // reCAPTCHA 検証
    const recaptchaValid = await verifyForgotPassReCAPTCHA(recaptchaToken);
    if (!recaptchaValid) {
      console.error('CAPTCHA verification failed');
      return res.status(400).json({ message: 'Failed CAPTCHA verification' });
    }
    console.log('CAPTCHA verification succeeded');

    // メールアドレスが存在するかチェック
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`No user found with email: ${email}`);
      return res.status(400).json({ message: 'Email not found' });
    }
    console.log(`User found: ${user.email}`);

    // パスワードリセットトークンを生成
    const resetToken = generateResetToken();
    console.log(`Generated reset token: ${resetToken}`);

    // リセットトークンと有効期限を保存
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1時間有効
    await user.save();
    console.log('Reset token and expiration saved to user');

    // パスワードリセットメールの送信
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification Code',
      text: `Please reset your password by clicking the following link: http://localhost:3000/reset-password?token=${resetToken}`,

    });
    console.log(`Password reset email sent to ${email}`);

    // 正常終了
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    // エラー発生時のログ
    console.error('Error during password reset process:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// パスワードリセットの処理
router.post('/reset-password/:token', [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password)
  .withMessage('パスワード確認が一致しません'),
], async (req, res) => {
  const { token } = req.params;  // URLからトークンを取得
  const { password,  recaptchaToken } = req.body;
 
  // ReCAPTCHA検証
  const recaptchaVerified = await verifyResetPasswordRecaptcha(recaptchaToken);
  if (!recaptchaVerified) {
    return res.status(400).json({ message: 'ReCAPTCHA verification failed' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    return res.status(400).json({ errors: errors.array() });
  }


  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // トークンの有効期限を確認
    });

    if (!user) {
      return res.status(400).json({ message: '無効または期限切れのトークンを使用しています。' });
    }

    // パスワードをハッシュ化して更新
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined; // トークンを削除
    user.resetPasswordExpires = undefined; // 有効期限を削除

    await user.save();

    res.status(200).json({ message: 'Password has been updated' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 認証をチェックするエンドポイント
router.get('/check-auth', authenticateToken, async (req, res) => {
  try {
    // トークンが有効で、ユーザーが見つかった場合、認証済みとしてステータス200を返す
    res.status(200).json({ message: 'Authenticated', user: req.user });
  } catch (error) {
    console.error('Error in check-auth:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});
router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions); // JWTトークンのクッキーを削除
  res.status(200).json({ message: 'ログアウトしました' });
});
module.exports = router;
