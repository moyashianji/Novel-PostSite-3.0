// backend/utils/redisClient.js
const Redis = require('ioredis');

// 環境変数から Redis URL を取得
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'; 

// Redis クライアントを作成
const client = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  autoResubscribe: true,
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      // 読み取り専用エラーは再接続を試みる
      return true;
    }
    return false;
  }
});

// 接続イベントハンドラ
client.on('connect', () => {
  console.log('✅ Connected to Redis');
  client.status = 'connected';
});

client.on('ready', () => {
  console.log('✅ Redis is ready');
  client.status = 'ready';
});

client.on('error', (err) => {
  console.error('❌ Redis Client Error', err);
  client.status = 'error';
});

client.on('close', () => {
  console.warn('⚠️ Redis connection closed');
  client.status = 'closed';
});

// クライアントの接続確保関数
async function ensureRedisConnection() {
  try {
    // ioredisでは自動的に接続するため、
    // pingコマンドを送信して接続が確立されていることを確認
    await client.ping();
    console.log('✅ Redis connection confirmed');
    return client;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
}

module.exports = { client, ensureRedisConnection };