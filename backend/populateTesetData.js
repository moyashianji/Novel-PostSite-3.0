const mongoose = require('mongoose');

// MongoDBモデル
const analyticsSchema = new mongoose.Schema({
  postId: { type: String, required: true },
  views: [
    {
      timestamp: { type: Date, required: true },
      count: { type: Number, required: true },
    },
  ],
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

// MongoDB接続
mongoose.connect('mongodb://localhost:27017/novel-site', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// テストデータ生成関数
const generateTestData = async () => {
  const postId = '645ed5e58f1e3e5d439e1234'; // 固定のポストID

  // 現在の時間を基準に過去24時間分のデータを生成
  const now = new Date();
  const views = [];
  for (let i = 0; i < 1440; i++) { // 1440分 = 24時間
    const timestamp = new Date(now.getTime() - i * 60000); // 1分前ずつ
    const count = Math.floor(Math.random() * 10) + 1; // ランダムな閲覧数（1～10）
    views.push({ timestamp, count });
  }

  // データ挿入
  try {
    await Analytics.deleteOne({ postId }); // 同じpostIdのデータを削除
    const analytics = new Analytics({ postId, views });
    await analytics.save();
    console.log('Test data inserted successfully');
  } catch (error) {
    console.error('Error inserting test data:', error);
  } finally {
    mongoose.connection.close();
  }
};

generateTestData();
