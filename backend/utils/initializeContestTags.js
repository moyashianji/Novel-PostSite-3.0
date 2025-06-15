// utils/initializeContestTags.js
const { initializeContestTagsInMongoDB, addContestTagsToExistingDocuments } = require('./elasticsearch');

/**
 * MongoDBとElasticsearchの両方にcontestTagsフィールドを初期化する統合関数
 */
async function initializeContestTagsEverywhere() {
  try {
    console.log('🚀 ContestTagsフィールドの完全初期化を開始...');
    
    // 1. MongoDBの既存作品にcontestTagsフィールドを初期化
    console.log('📝 Step 1: MongoDBにcontestTagsフィールドを初期化中...');
    const mongoResult = await initializeContestTagsInMongoDB();
    
    // 2. Elasticsearchの既存ドキュメントにcontestTagsフィールドを追加
    console.log('🔍 Step 2: ElasticsearchにcontestTagsフィールドを追加中...');
    await addContestTagsToExistingDocuments();
    
    console.log('✅ ContestTagsフィールドの完全初期化が完了しました！');
    console.log('📊 初期化統計:');
    console.log(`  - MongoDB: ${mongoResult.modifiedCount} 件の作品を初期化`);
    console.log(`  - Elasticsearch: 対応するドキュメントを更新`);
    
    return {
      success: true,
      mongoModified: mongoResult.modifiedCount,
      mongoMatched: mongoResult.matchedCount
    };
    
  } catch (error) {
    console.error('❌ ContestTags初期化エラー:', error);
    throw error;
  }
}

/**
 * サーバー起動時にcontestTagsを自動初期化する関数
 */
async function autoInitializeOnStartup() {
  try {
    console.log('🔧 サーバー起動時のcontestTags自動初期化チェック...');
    
    // MongoDB内でcontestTagsがないドキュメントの数をチェック
    const Post = require('../models/Post');
    const needsInitCount = await Post.countDocuments({
      $or: [
        { contestTags: { $exists: false } },
        { contestTags: null },
        { contestTags: undefined }
      ]
    });
    
    if (needsInitCount > 0) {
      console.log(`📝 ${needsInitCount} 件の作品でcontestTagsフィールドの初期化が必要です`);
      await initializeContestTagsEverywhere();
    } else {
      console.log('✅ 全ての作品にcontestTagsフィールドが存在します');
    }
    
  } catch (error) {
    console.error('❌ 自動初期化エラー:', error);
    // サーバー起動を阻害しないようにエラーをログのみに留める
  }
}

module.exports = {
  initializeContestTagsEverywhere,
  autoInitializeOnStartup
};