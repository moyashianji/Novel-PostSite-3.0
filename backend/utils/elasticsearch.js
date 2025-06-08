// utils/elasticsearch.js
const getEsClient = require('./esClient');
const Post = require('../models/Post');
const Series = require('../models/Series');
const sanitizeHtml = require('sanitize-html'); // インストールが必要
const esClient = getEsClient();

async function migrateDataToElasticsearch() {
    try {
      console.log('🔍 Elasticsearch へデータを送信中...');
  
      // まだ Elasticsearch に送信していないデータを取得
      const posts = await Post.find({});
  
      console.log(`📝 MongoDB から取得したデータ (${posts.length} 件)`);
  
      if (!posts || posts.length === 0) {
        console.log('✅ すべてのデータが Elasticsearch に送信済みです。');
        return;
      }
  
      posts.forEach((post) => {
        if (!post.title || !post.content) {
          console.warn(`⚠ スキップ: 投稿 ${post._id} は title または content が不足しています。`);
        }
      });
  
      // Elasticsearch にデータを一括登録 (Bulk API)
      const body = posts.flatMap((post) => {
        if (!post.title || !post.content) return [];
  
        // ✅ タグを除去
        const cleanContent = sanitizeHtml(post.content, {
          allowedTags: [],
          allowedAttributes: {}
        });
  
        console.log(`🔍 ID: ${post._id} | 🛠 サニタイズ後のコンテンツ:`, cleanContent);
  
        return [
          { index: { _index: 'posts', _id: post._id.toString() } },
          {
            title: post.title,
            content: cleanContent,
            tags: post.tags || [],
            author: post.author.toString(),
            createdAt: post.createdAt
          }
        ];
      });
  
      if (body.length === 0) {
        console.log('✅ 送信するデータがありません。スキップします。');
        return;
      }
  
      console.log('📤 送信データ:', JSON.stringify(body, null, 2));

      const bulkResponse = await esClient.bulk({ refresh: "wait_for", body });
      
      console.log('🔍 bulkResponse:', JSON.stringify(bulkResponse, null, 2));
      
      if (!bulkResponse || !bulkResponse.items) {
        console.error('❌ Elasticsearch へのデータ送信失敗: bulkResponse が不正');
        return;
      }
      
      if (bulkResponse.errors) {
        console.error('❌ Elasticsearch への一部データ送信に失敗:', JSON.stringify(bulkResponse.items.filter(item => item.index && item.index.error), null, 2));
      } else {
        console.log(`✅ ${bulkResponse.items.length} 件のデータを Elasticsearch に送信しました。`);
      }
    } catch (error) {
      console.error('❌ Elasticsearch へのデータ移行エラー:', error);
    }
  }
  


  module.exports = { migrateDataToElasticsearch };