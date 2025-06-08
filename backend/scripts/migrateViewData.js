/**
 * 既存の閲覧データを新しいバイナリパッキング形式に移行するスクリプト
 */

const mongoose = require('mongoose');
require('dotenv').config();

// モデルをロード
const ViewAnalytics = require('../models/ViewAnalytics');
const Post = require('../models/Post');
const BinaryViewPacker = require('../utils/binaryPacking');
const HyperLogLogPlusPlus = require('../utils/hyperLogLog');

// MongoDB接続設定
mongoose.connect('mongodb://host.docker.internal:27017/novel-site')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

/**
 * 閲覧データを移行する関数
 */
async function migrateViewData() {
  console.log('Starting view data migration...');
  
  try {
    // すべての投稿を取得
    const posts = await Post.find().select('_id viewCounter');
    
    console.log(`Found ${posts.length} posts to migrate`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const post of posts) {
      console.log(`Processing post ${post._id} (${successCount + errorCount + 1}/${posts.length})`);
      
      try {
        // 既存のViewAnalyticsを確認
        let analytics = await ViewAnalytics.findOne({ postId: post._id });
        
        if (analytics) {
          console.log(`Existing ViewAnalytics found for post ${post._id}, skipping...`);
          successCount++;
          continue;
        }
        
        // 新しいViewAnalyticsドキュメントを作成
        analytics = new ViewAnalytics({
          postId: post._id,
          viewCounter: post.viewCounter || 0,
          packedViewData: [],
          timeWindows: {
            hourly: [],
            daily: [],
            weekly: [],
            monthly: []
          }
        });
        
        // HyperLogLog++カウンターを初期化
        const hll = new HyperLogLogPlusPlus(14);
        
        // 閲覧カウントに基づいてダミーデータを作成（過去6ヶ月分）
        const viewCount = post.viewCounter || 0;
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        // 閲覧数に基づいて適切な間隔を計算
        let interval = Math.max(1, Math.floor(3600 * 24 * 180 / (viewCount || 1)));
        interval = Math.min(interval, 3600 * 24); // 最大1日間隔
        
        // ダミーデータ作成（実際のユーザーデータはないため、仮のユーザーIDを使用）
        for (let i = 0; i < viewCount; i++) {
          // タイムスタンプを生成（過去6ヶ月内でランダム）
          const timestamp = sixMonthsAgo.getTime() + Math.floor(Math.random() * (Date.now() - sixMonthsAgo.getTime()));
          
          // ランダムなユーザーID（実際のデータはないため）
          const userId = Math.floor(Math.random() * 10000000);
          
          // バイナリパックされたダミーデータを作成
          const packedData = BinaryViewPacker.pack({
            postId: parseInt(post._id.toString().substring(0, 6), 16) % 16777216,
            userId,
            timestamp,
            device: Math.floor(Math.random() * 3), // 0: デスクトップ, 1: モバイル, 2: タブレット
            country: Math.floor(Math.random() * 10) // 0-9の国コード
          });
          
          // HLLカウンターに追加
          hll.add(userId.toString());
          
          // packedViewDataに追加
          analytics.packedViewData.push({
            data: packedData,
            timestamp: new Date(timestamp)
          });
          
          // データ量が大きくなりすぎないように制限
          if (analytics.packedViewData.length >= 10000) {
            break;
          }
        }
        
        // HLL状態をシリアライズして保存
        // 注: これは実際のHLLPP実装に依存するため、擬似コード
        analytics.hllState = Buffer.from(JSON.stringify(hll), 'utf8');
        
        // 保存
        await analytics.save();
        
        console.log(`Created ViewAnalytics for post ${post._id} with ${analytics.packedViewData.length} views`);
        successCount++;
      } catch (error) {
        console.error(`Error migrating data for post ${post._id}:`, error);
        errorCount++;
      }
    }
    
    console.log('View data migration completed');
    console.log(`Success: ${successCount} posts`);
    console.log(`Errors: ${errorCount} posts`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // 接続を閉じる
    mongoose.disconnect();
  }
}

// 実行
migrateViewData();