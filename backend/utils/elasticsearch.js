// utils/elasticsearch.js
const { getEsClient } = require('./esClient');
const Post = require('../models/Post');
const Series = require('../models/Series');
const sanitizeHtml = require('sanitize-html'); // インストールが必要
const esClient = getEsClient();

async function addIsAdultContentToExistingDocuments() {
    try {
      console.log('🔍 既存のElasticsearchドキュメントにisAdultContentフィールドを追加中...');
  
      // MongoDBから全投稿のIDとisAdultContent情報を取得
      const posts = await Post.find({}, { _id: 1, isAdultContent: 1 });
  
      console.log(`📝 MongoDB から取得したデータ (${posts.length} 件)`);
  
      if (!posts || posts.length === 0) {
        console.log('✅ 更新するデータがありません。');
        return;
      }
  
      // Elasticsearch に既存のドキュメントを部分更新 (Bulk API)
      const body = posts.flatMap((post) => [
        { 
          update: { 
            _index: 'posts_fixed', 
            _id: post._id.toString(),
            retry_on_conflict: 3 // 競合時のリトライ回数
          } 
        },
        {
          doc: {
            isAdultContent: post.isAdultContent || false // ✅ R18情報のみを追加/更新
          },
          doc_as_upsert: false // 既存ドキュメントのみ更新
        }
      ]);
  
      if (body.length === 0) {
        console.log('✅ 更新するデータがありません。スキップします。');
        return;
      }
  
      console.log(`📤 ${posts.length} 件のドキュメントにisAdultContentフィールドを追加中...`);

      const bulkResponse = await esClient.bulk({ refresh: "wait_for", body });
      
      console.log('🔍 bulkResponse:', JSON.stringify(bulkResponse, null, 2));
      
      if (!bulkResponse || !bulkResponse.items) {
        console.error('❌ Elasticsearch への部分更新失敗: bulkResponse が不正');
        return;
      }
      
      if (bulkResponse.errors) {
        const errorItems = bulkResponse.items.filter(item => item.update && item.update.error);
        console.error('❌ Elasticsearch への一部更新に失敗:', JSON.stringify(errorItems, null, 2));
        
        // 成功した件数も表示
        const successCount = bulkResponse.items.length - errorItems.length;
        console.log(`✅ ${successCount} 件のドキュメントにisAdultContentフィールドを追加しました。`);
      } else {
        console.log(`✅ ${bulkResponse.items.length} 件のドキュメントにisAdultContentフィールドを追加しました。`);
      }
    } catch (error) {
      console.error('❌ Elasticsearch への部分更新エラー:', error);
    }
  }

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
          { index: { _index: 'posts_fixed', _id: post._id.toString() } },
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
  
// publicityStatusのみを全作品に追加する関数
async function addPublicityStatusToExistingDocuments() {
    try {
      console.log('🔍 既存のElasticsearchドキュメントにpublicityStatusフィールドを追加中...');
  
      // MongoDBから全投稿のIDとpublicityStatus情報を取得
      const posts = await Post.find({}, { _id: 1, publicityStatus: 1 });
  
      console.log(`📝 MongoDB から取得したデータ (${posts.length} 件)`);
  
      if (!posts || posts.length === 0) {
        console.log('✅ 更新するデータがありません。');
        return;
      }
  
      // Elasticsearch に既存のドキュメントを部分更新 (Bulk API)
      const body = posts.flatMap((post) => [
        { 
          update: { 
            _index: 'posts_fixed', 
            _id: post._id.toString(),
            retry_on_conflict: 3 // 競合時のリトライ回数
          } 
        },
        {
          doc: {
            publicityStatus: post.publicityStatus || 'public' // ✅ 公開設定情報のみを追加/更新
          },
          doc_as_upsert: false // 既存ドキュメントのみ更新
        }
      ]);
  
      if (body.length === 0) {
        console.log('✅ 更新するデータがありません。スキップします。');
        return;
      }
  
      console.log(`📤 ${posts.length} 件のドキュメントにpublicityStatusフィールドを追加中...`);

      const bulkResponse = await esClient.bulk({ refresh: "wait_for", body });
      
      console.log('🔍 bulkResponse:', JSON.stringify(bulkResponse, null, 2));
      
      if (!bulkResponse || !bulkResponse.items) {
        console.error('❌ Elasticsearch への部分更新失敗: bulkResponse が不正');
        return;
      }
      
      if (bulkResponse.errors) {
        const errorItems = bulkResponse.items.filter(item => item.update && item.update.error);
        console.error('❌ Elasticsearch への一部更新に失敗:', JSON.stringify(errorItems, null, 2));
        
        // 成功した件数も表示
        const successCount = bulkResponse.items.length - errorItems.length;
        console.log(`✅ ${successCount} 件のドキュメントにpublicityStatusフィールドを追加しました。`);
      } else {
        console.log(`✅ ${bulkResponse.items.length} 件のドキュメントにpublicityStatusフィールドを追加しました。`);
      }
    } catch (error) {
      console.error('❌ Elasticsearch への部分更新エラー:', error);
    }
  }

// 🆕 contestTagsのみを全作品に追加する関数
async function addContestTagsToExistingDocuments() {
    try {
      console.log('🔍 既存のElasticsearchドキュメントにcontestTagsフィールドを追加中...');
  
      // MongoDBから全投稿のIDとcontestTags情報を取得
      const posts = await Post.find({}, { _id: 1, contestTags: 1 });
  
      console.log(`📝 MongoDB から取得したデータ (${posts.length} 件)`);
  
      if (!posts || posts.length === 0) {
        console.log('✅ 更新するデータがありません。');
        return;
      }
  
      // Elasticsearch に既存のドキュメントを部分更新 (Bulk API)
      const body = posts.flatMap((post) => [
        { 
          update: { 
            _index: 'posts_fixed', 
            _id: post._id.toString(),
            retry_on_conflict: 3 // 競合時のリトライ回数
          } 
        },
        {
          doc: {
            contestTags: post.contestTags || [] // 🆕 コンテストタグフィールドのみを追加/更新
          },
          doc_as_upsert: false // 既存ドキュメントのみ更新
        }
      ]);
  
      if (body.length === 0) {
        console.log('✅ 更新するデータがありません。スキップします。');
        return;
      }
  
      console.log(`📤 ${posts.length} 件のドキュメントにcontestTagsフィールドを追加中...`);

      const bulkResponse = await esClient.bulk({ refresh: "wait_for", body });
      
      console.log('🔍 bulkResponse:', JSON.stringify(bulkResponse, null, 2));
      
      if (!bulkResponse || !bulkResponse.items) {
        console.error('❌ Elasticsearch への部分更新失敗: bulkResponse が不正');
        return;
      }
      
      if (bulkResponse.errors) {
        const errorItems = bulkResponse.items.filter(item => item.update && item.update.error);
        console.error('❌ Elasticsearch への一部更新に失敗:', JSON.stringify(errorItems, null, 2));
        
        // 成功した件数も表示
        const successCount = bulkResponse.items.length - errorItems.length;
        console.log(`✅ ${successCount} 件のドキュメントにcontestTagsフィールドを追加しました。`);
      } else {
        console.log(`✅ ${bulkResponse.items.length} 件のドキュメントにcontestTagsフィールドを追加しました。`);
      }
    } catch (error) {
      console.error('❌ Elasticsearch への部分更新エラー:', error);
    }
  }

// 🆕 MongoDBの既存作品にcontestTagsフィールドを初期化する関数
async function initializeContestTagsInMongoDB() {
    try {
      console.log('🔍 MongoDBの既存作品にcontestTagsフィールドを初期化中...');
  
      // contestTagsフィールドが存在しない、またはundefinedの作品を検索
      const result = await Post.updateMany(
        { 
          $or: [
            { contestTags: { $exists: false } },
            { contestTags: null },
            { contestTags: undefined }
          ]
        },
        { 
          $set: { contestTags: [] } // 空配列で初期化
        }
      );
  
      console.log(`✅ ${result.modifiedCount} 件の作品にcontestTagsフィールドを初期化しました`);
      console.log(`📊 マッチした作品数: ${result.matchedCount}`);
      
      return result;
    } catch (error) {
      console.error('❌ MongoDB contestTags初期化エラー:', error);
      throw error;
    }
  }

// 🆕 シリーズの公開設定をElasticsearchに追加する関数
async function addPublicityStatusToExistingSeriesDocuments() {
    try {
      console.log('🔍 既存のElasticsearchシリーズドキュメントにpublicityStatusフィールドを追加中...');
  
      // MongoDBから全シリーズのIDとpublicityStatus情報を取得
      const series = await Series.find({}, { _id: 1, publicityStatus: 1 });
  
      console.log(`📝 MongoDB から取得したシリーズデータ (${series.length} 件)`);
  
      if (!series || series.length === 0) {
        console.log('✅ 更新するシリーズデータがありません。');
        return;
      }
  
      // Elasticsearch に既存のドキュメントを部分更新 (Bulk API)
      const body = series.flatMap((seriesItem) => [
        { 
          update: { 
            _index: 'series', 
            _id: seriesItem._id.toString(),
            retry_on_conflict: 3 // 競合時のリトライ回数
          } 
        },
        {
          doc: {
            publicityStatus: seriesItem.publicityStatus || 'public' // ✅ シリーズ公開設定情報のみを追加/更新
          },
          doc_as_upsert: false // 既存ドキュメントのみ更新
        }
      ]);
  
      if (body.length === 0) {
        console.log('✅ 更新するシリーズデータがありません。スキップします。');
        return;
      }
  
      console.log(`📤 ${series.length} 件のシリーズドキュメントにpublicityStatusフィールドを追加中...`);

      const bulkResponse = await esClient.bulk({ refresh: "wait_for", body });
      
      console.log('🔍 シリーズ bulkResponse:', JSON.stringify(bulkResponse, null, 2));
      
      if (!bulkResponse || !bulkResponse.items) {
        console.error('❌ Elasticsearch シリーズへの部分更新失敗: bulkResponse が不正');
        return;
      }
      
      if (bulkResponse.errors) {
        const errorItems = bulkResponse.items.filter(item => item.update && item.update.error);
        console.error('❌ Elasticsearch シリーズへの一部更新に失敗:', JSON.stringify(errorItems, null, 2));
        
        // 成功した件数も表示
        const successCount = bulkResponse.items.length - errorItems.length;
        console.log(`✅ ${successCount} 件のシリーズドキュメントにpublicityStatusフィールドを追加しました。`);
      } else {
        console.log(`✅ ${bulkResponse.items.length} 件のシリーズドキュメントにpublicityStatusフィールドを追加しました。`);
      }
    } catch (error) {
      console.error('❌ Elasticsearch シリーズへの部分更新エラー:', error);
    }
  }

// 🆕 MongoDBの既存シリーズにpublicityStatusフィールドを初期化する関数
async function initializePublicityStatusInSeriesMongoDB() {
    try {
      console.log('🔍 MongoDBの既存シリーズにpublicityStatusフィールドを初期化中...');
  
      // publicityStatusフィールドが存在しない、またはundefinedのシリーズを検索
      const result = await Series.updateMany(
        { 
          $or: [
            { publicityStatus: { $exists: false } },
            { publicityStatus: null },
            { publicityStatus: undefined }
          ]
        },
        { 
          $set: { publicityStatus: 'public' } // デフォルトで公開に設定
        }
      );
  
      console.log(`✅ ${result.modifiedCount} 件のシリーズにpublicityStatusフィールドを初期化しました`);
      console.log(`📊 マッチしたシリーズ数: ${result.matchedCount}`);
      
      return result;
    } catch (error) {
      console.error('❌ MongoDB シリーズ publicityStatus初期化エラー:', error);
      throw error;
    }
  }

module.exports = { 
    migrateDataToElasticsearch,
    addIsAdultContentToExistingDocuments,
    addPublicityStatusToExistingDocuments,
    addContestTagsToExistingDocuments,
    initializeContestTagsInMongoDB,
    addPublicityStatusToExistingSeriesDocuments, // 🆕 シリーズ公開設定追加
    initializePublicityStatusInSeriesMongoDB // 🆕 シリーズMongoDB初期化追加
  };