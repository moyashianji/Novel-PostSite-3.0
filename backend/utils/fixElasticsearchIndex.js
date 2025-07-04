// backend/utils/fixElasticsearchIndex.js
const { getEsClient } = require('./esClient');
const Post = require('../models/Post');

async function fixElasticsearchIndex() {
    const esClient = getEsClient();
    
    try {
        // インデックスの存在確認
        const indexExists = await esClient.indices.exists({ index: 'posts_fixed' });
        
        if (!indexExists) {
            console.log('❌ posts インデックスが存在しません。作成します...');
            
            // インデックスを作成
            await esClient.indices.create({
                index: 'posts_fixed',
                body: {
                    mappings: {
                        properties: {
                            title: { 
                                type: 'text',
                                analyzer: 'standard',
                                search_analyzer: 'standard'
                            },
                            content: { 
                                type: 'text',
                                analyzer: 'standard',
                                search_analyzer: 'standard'
                            },
                            tags: { 
                                type: 'keyword'
                            },
                            contestTags: {
                                type: 'keyword'
                            },
                            publicityStatus: {
                                type: 'keyword'
                            },
                            isAdultContent: {
                                type: 'boolean'
                            },
                            createdAt: {
                                type: 'date'
                            },
                            viewCounter: {
                                type: 'integer'
                            },
                            goodCounter: {
                                type: 'integer'
                            }
                        }
                    }
                }
            });
            
            console.log('✅ posts インデックスを作成しました');
        }
        
        // インデックスのマッピングを確認
        const mapping = await esClient.indices.getMapping({ index: 'posts_fixed' });
        console.log('📋 現在のマッピング:', JSON.stringify(mapping, null, 2));
        
        // サンプルデータで検索テスト
        const testResponse = await esClient.search({
            index: 'posts_fixed',
            body: {
                query: {
                    bool: {
                        filter: [
                            { term: { "publicityStatus": "public" } }
                        ]
                    }
                },
                size: 5
            }
        });
        
        console.log(`🔍 テスト検索結果: ${testResponse.hits.total.value} 件のドキュメントが見つかりました`);
        
        if (testResponse.hits.total.value === 0) {
            console.log('⚠️ データが存在しないため、MongoDBからデータを再インデックスします...');
            await reindexFromMongoDB();
        }
        
    } catch (error) {
        console.error('❌ Elasticsearch インデックス修正エラー:', error);
    }
}

async function reindexFromMongoDB() {
    const esClient = getEsClient();
    
    try {
        // MongoDBから公開作品を取得
        const posts = await Post.find({ publicityStatus: 'public' })
            .select('title content tags contestTags publicityStatus isAdultContent createdAt viewCounter goodCounter author')
            .lean();
        
        console.log(`📝 MongoDB から ${posts.length} 件の公開作品を取得しました`);
        
        if (posts.length === 0) {
            console.log('⚠️ 公開作品が見つかりません');
            return;
        }
        
        // バルクインデックス用のデータを準備
        const body = posts.flatMap(post => [
            { index: { _index: 'posts_fixed', _id: post._id.toString() } },
            {
                title: post.title || '',
                content: post.content || '',
                tags: post.tags || [],
                contestTags: post.contestTags || [],
                publicityStatus: post.publicityStatus || 'public',
                isAdultContent: post.isAdultContent || false,
                createdAt: post.createdAt,
                viewCounter: post.viewCounter || 0,
                goodCounter: post.goodCounter || 0,
                author: post.author.toString()
            }
        ]);
        
        // バルクインデックス実行
        const bulkResponse = await esClient.bulk({ 
            refresh: 'wait_for',
            body 
        });
        
        if (bulkResponse.errors) {
            console.error('❌ バルクインデックスでエラーが発生:', 
                bulkResponse.items.filter(item => item.index.error));
        } else {
            console.log(`✅ ${posts.length} 件のドキュメントを正常にインデックスしました`);
        }
        
    } catch (error) {
        console.error('❌ 再インデックスエラー:', error);
    }
}