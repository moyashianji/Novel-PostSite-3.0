/**
* Redis キャッシュクリーンアップ
* 超最小限の機能のみ
*/
const cron = require('node-cron');
const { client: redisClient } = require('../utils/redisClient');

// 毎週日曜日の深夜3時に実行
cron.schedule('0 3 * * 0', async () => {
 console.log('🧹 Redisクリーンアップ開始');
 
 try {
   // 90日以上前の非アクティブ投稿を削除
   const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
   const removedPosts = await redisClient.zremrangebyscore('active:posts', '-inf', ninetyDaysAgo);
   
   // 対応するHLLカウンターも削除
   if (removedPosts > 0) {
     const hllKeys = await redisClient.keys('post:*:hll');
     let expiredHllCount = 0;
     
     for (const key of hllKeys) {
       const postId = key.split(':')[1];
       const score = await redisClient.zscore('active:posts', postId);
       
       if (!score) {
         await redisClient.del(key);
         expiredHllCount++;
       }
     }
     
     console.log(`✅ 削除完了: active:posts ${removedPosts}件, HLL ${expiredHllCount}件`);
   } else {
     console.log('✅ 削除対象なし');
   }
   
 } catch (error) {
   console.error('❌ クリーンアップエラー:', error);
 }
});