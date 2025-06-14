process.env.NODE_ENV = 'development';
process.env.TEST_MODE = 'true';
console.log(`
🔧 環境設定:
   NODE_ENV: ${process.env.NODE_ENV}
   TEST_MODE: ${process.env.TEST_MODE}
   PORT: ${process.env.PORT || 5000}
`);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const { getEsClient } = require('./utils/esClient');
const { migrateSeriesToElasticsearch } = require('./utils/migrateSeriesToElasticsearch');
const { ensureRedisConnection } = require('./utils/redisClient');
const authenticateToken = require('./middlewares/authenticateToken');
const { client: redisClient } = require('./utils/redisClient');

// モデルのインポート
const User = require('./models/User');
const Post = require('./models/Post');
const Series = require('./models/Series');
const ViewAnalytics = require('./models/ViewAnalytics');

// ミドルウェアのインポート
const { morganMiddleware } = require('./middlewares/logger');

// ルートのインポート
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const seriesRoutes = require('./routes/series');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const followRoutes = require('./routes/follow');
const bookshelfRoutes = require('./routes/bookshelf');
const tagRoutes = require('./routes/tags');
const viewanalytics = require('./routes/analytics');
const contestRoutes = require('./routes/contests');
const uploadRoutes = require('./routes/uploadRoutes');
const searchRoutes = require('./routes/search');
const notificationRoutes = require('./routes/notification');
const viewHistoryRoutes = require('./routes/viewHistory');
const trendingRoutes = require('./routes/trending');
const seriesFollowRoutes = require('./routes/seriesFollow');
const totalRankingRoutes = require('./routes/totalRanking');
const trendingJob = require('./jobs/trendingRankingJob');
const viewsRoutes = require('./routes/view');
const correctedViewTrackingService = require('./services/correctedViewTrackingService');

const { initializeSystem } = require('./utils/initializeTrending');

const app = express();
app.disable("x-powered-by");
app.set('trust proxy', true);  // または 1 - 直近のプロキシのみを信頼する場合

// PORTの定義を追加
const PORT = process.env.PORT || 5000;

// ✅ セキュリティ設定（最適化）
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  hsts: true,
  noSniff: true,
  xssFilter: true,
}));

// ✅ セッション設定
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://host.docker.internal:27017/novel-site',
    ttl: 24 * 60 * 60, // 24時間
  }),
  cookie: {
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// ✅ CORS 設定（最適化）
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// ✅ ロガーミドルウェア
//app.use(morganMiddleware);

// ✅ 静的ファイルサーバー（画像など）
app.use('/uploads', cors({
  origin: ['http://localhost:3000'],
  credentials: true
}), express.static('uploads'));

// ✅ Elasticsearch クライアントの取得
const esClient = getEsClient();
console.log('🔍 Elasticsearch Client initialized');

// ✅ Elasticsearch の接続確認
async function checkElasticsearchConnection() {
  try {
    console.log('🔍 Elasticsearch 接続確認中...');
    await esClient.ping();
    console.log('✅ Elasticsearch is connected!');

    const info = await esClient.info();
    console.log(`📝 Elasticsearch クラスタ情報:
  - クラスタ名: ${info.cluster_name}
  - バージョン: ${info.version.number}
  - ノード名: ${info.name}
  - ステータス: ${info.tagline}`);

  } catch (error) {
    console.error('❌ Elasticsearch cluster is down!', error);
  }
}
checkElasticsearchConnection();

// ✅ MongoDB に接続
mongoose.connect('mongodb://host.docker.internal:27017/novel-site')
  .then(async () => {
    console.log('✅ MongoDB connected');
    //await migrateSeriesToElasticsearch();
        await initializePublicityStatus();

  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ セッションストアのエラーハンドリング
MongoStore.create({
  mongoUrl: 'mongodb://host.docker.internal:27017/novel-site',
  ttl: 24 * 60 * 60,
  autoRemove: 'native'
}).on('error', (error) => {
  console.error('❌ Session store error:', error);
});

// ✅ API ルートのマウント
app.use('/api', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/users', userRoutes);
app.use('/api', commentRoutes);
app.use('/api', followRoutes);
app.use('/api', bookshelfRoutes);
app.use('/api', tagRoutes);
app.use('/api', viewanalytics);
app.use('/api/contests', contestRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', viewHistoryRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api', seriesFollowRoutes); // シリーズフォロールート追加
app.use('/api/total', totalRankingRoutes);
app.use('/api/views', viewsRoutes);  // ←ここに追加
// publicityStatus初期化関数を追加（startServer関数の前に配置）
/**
 * publicityStatusフィールドの初期化
 */
async function initializePublicityStatus() {
  try {
    console.log('🔄 publicityStatus フィールドの初期化中...');
    
    // publicityStatusフィールドがない作品を検索
    const postsWithoutPublicityStatus = await Post.find({
      publicityStatus: { $exists: false }
    }).select('_id isPublic').lean();
    
    if (postsWithoutPublicityStatus.length === 0) {
      console.log('✅ 全ての作品に publicityStatus フィールドが存在します');
      return;
    }
    
    console.log(`📝 ${postsWithoutPublicityStatus.length}件の作品に publicityStatus を追加中...`);
    
    // バッチ処理で効率的に更新
    const bulkOps = postsWithoutPublicityStatus.map(post => {
      let publicityStatus = 'public'; // デフォルト値
      
      // isPublicフィールドが存在する場合はそれを基に判断
      if (post.isPublic !== undefined) {
        publicityStatus = post.isPublic ? 'public' : 'private';
      }
      
      return {
        updateOne: {
          filter: { _id: post._id },
          update: { 
            $set: { publicityStatus },
            $unset: { isPublic: "" } // isPublicフィールドを削除
          }
        }
      };
    });
    
    // バッチ実行
    const result = await Post.bulkWrite(bulkOps);
    
    console.log(`✅ publicityStatus 初期化完了: ${result.modifiedCount}件更新`);
    
    // 統計情報を表示
    const publicCount = await Post.countDocuments({ publicityStatus: 'public' });
    const privateCount = await Post.countDocuments({ publicityStatus: 'private' });
    const limitedCount = await Post.countDocuments({ publicityStatus: 'limited' });
    
    console.log(`📊 公開設定統計: 公開=${publicCount}件, 非公開=${privateCount}件, 限定公開=${limitedCount}件`);
    
  } catch (error) {
    console.error('❌ publicityStatus 初期化エラー:', error);
    // エラーがあってもサーバー起動は継続
  }
}

// サーバー起動時に初期化
const startServer = async () => {
  try {
    // Redis接続を確認・初期化
    await ensureRedisConnection();
    console.log('✅ Redis connection ensured');
    
    // 閲覧追跡システムとトレンドランキングの初期化
    await correctedViewTrackingService.initializeViewTracking();
    console.log('✅ View tracking service initialized');
    
    await trendingJob.initTrendingJob();
    console.log('✅ Trending ranking jobs initialized');
    
    // Cronジョブの初期化
    require('./jobs/viewAggregate');
    require('./jobs/newTrendingJob');
    console.log('✅ Maintenance jobs scheduled');
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// グレースフルシャットダウン
process.on('SIGTERM', async () => {
  console.log('🔄 Server shutting down gracefully...');
  
  // バッファをフラッシュ
  await correctedViewTrackingService.flushBuffers();
  console.log('✅ View buffer flushed');
  
  // データベース接続を閉じる
  await mongoose.disconnect();
  console.log('✅ MongoDB connection closed');
  
  // Redisクライアントを閉じる
  await redisClient.quit();
  console.log('✅ Redis connection closed');
  
  process.exit(0);
});

startServer();

// ✅ エラーハンドリング（統一）
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).send('Something broke!');
});

// 最後の app.listen() を削除