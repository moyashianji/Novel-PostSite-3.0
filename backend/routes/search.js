const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Series = require('../models/Series');
const { getEsClient } = require('../utils/esClient');
const User = require('../models/User'); // Userモデルを追加

const esClient = getEsClient();

// Handle user search
router.get('/users', async (req, res) => {
    try {
        // Extract query parameters
        const {
            mustInclude = '',
            fields = 'nickname,favoriteAuthors',
            tagSearchType = 'exact',
            page = 1,
            size = 10
        } = req.query;

        // Skip value for pagination
        const skip = (parseInt(page) - 1) * parseInt(size);

        if (!mustInclude.trim()) {
            return res.json({ results: [], total: 0, page: parseInt(page), size: parseInt(size) });
        }

        // Create search criteria
        let searchCriteria = {};
        const fieldsList = fields.split(',');

        if (fieldsList.includes('nickname') && fieldsList.includes('favoriteAuthors')) {
            // Search in both nickname and favoriteAuthors
            searchCriteria = {
                $or: [
                    { nickname: { $regex: mustInclude, $options: 'i' } },
                    { favoriteAuthors: tagSearchType === 'exact' ? mustInclude : { $regex: mustInclude, $options: 'i' } }
                ]
            };
        } else if (fieldsList.includes('nickname')) {
            // Search only in nickname
            searchCriteria = { nickname: { $regex: mustInclude, $options: 'i' } };
        } else if (fieldsList.includes('favoriteAuthors')) {
            // Search only in favoriteAuthors
            searchCriteria = {
                favoriteAuthors: tagSearchType === 'exact' ? mustInclude : { $regex: mustInclude, $options: 'i' }
            };
        }

        // Execute the search with pagination
        const users = await User.find(searchCriteria)
            .select('_id nickname icon description followerCount')
            .skip(skip)
            .limit(parseInt(size));

        // Count total matches
        const total = await User.countDocuments(searchCriteria);

        // Get additional stats for each user
        const enrichedUsers = await Promise.all(users.map(async (user) => {
            try {
                // Get post count - 公開作品のみカウント
                const postCount = await Post.countDocuments({
                    author: user._id,
                    publicityStatus: 'public'
                });

                // Get series count - 公開シリーズのみカウント
                const seriesCount = await Series.countDocuments({
                    author: user._id,
                    publicityStatus: 'public'
                });

                // 最近の作品も公開作品のみ取得
                const recentWorks = await Post.find({
                    author: user._id,
                    publicityStatus: 'public' // ✅ 公開作品のみ
                })
                    .sort({ createdAt: -1 })
                    .limit(6)
                    .select('title description content wordCount viewCounter goodCounter tags author isAdultContent aiEvidence')
                    .populate([
                        {
                            path: 'author',
                            select: 'nickname icon'
                        },
                        {
                            path: 'series',
                            select: 'title _id'
                        }
                    ]);

                // Return enriched user object
                return {
                    ...user.toObject(),
                    postCount,
                    seriesCount,
                    recentWorks
                };
            } catch (error) {
                console.error(`Error enriching user ${user._id}:`, error);
                return user.toObject();
            }
        }));

        // Return search results
        res.json({
            results: enrichedUsers,
            total,
            page: parseInt(page),
            size: parseInt(size)
        });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'ユーザー検索中にエラーが発生しました。', error: error.message });
    }
});


// メイン検索エンドポイント - フィールド問題修正版

// メイン検索エンドポイント - publicityStatus問題修正版
router.get('/', async (req, res) => {
    try {
        if (!esClient) {
            console.error('[ERROR] Elasticsearch クライアントが初期化されていません');
            return res.status(500).json({ message: 'Elasticsearch クライアントが初期化されていません。' });
        }

        const type = req.query.type || 'posts';
        const index = type === 'series' ? 'series' : 'posts_fixed';
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        const skip = (page - 1) * size;

        const mustInclude = req.query.mustInclude || '';
        const shouldInclude = req.query.shouldInclude || '';
        const mustNotInclude = req.query.mustNotInclude || '';
        const tagSearchType = req.query.tagSearchType || 'partial';
        const tags = req.query.tags ? req.query.tags.split(',') : [];
        const aiTool = req.query.aiTool || '';
        const contestTag = req.query.contestTag || '';
        const ageFilter = req.query.ageFilter || 'all';
        const sortBy = req.query.sortBy || 'newest';

        // fields の取得と正規化
        let fields = [];
        if (typeof req.query.fields === 'string') {
            fields = req.query.fields.split(',').map(f => f.trim()).filter(f => f);
        } else {
            fields = type === 'series' ? ['title', 'description', 'tags'] : ['title', 'content', 'tags'];
        }

        console.log(`[INFO] 🎯 検索対象: ${type}, インデックス: ${index}`);
        console.log(`[INFO] 🎯 検索フィールド: [${fields.join(', ')}]`);
        console.log(`[INFO] 🔍 検索キーワード: "${mustInclude}"`);

        // ===== publicityStatusフィールドのマッピング確認 =====
        try {
            const mapping = await esClient.indices.getMapping({ index: index });
            const properties = mapping[index].mappings.properties;
            
            console.log(`[INFO] 📋 publicityStatusフィールドマッピング:`, properties.publicityStatus);
            
            // publicityStatusの正しいフィールド名を決定
            let publicityStatusField = 'publicityStatus';
            if (properties.publicityStatus) {
                if (properties.publicityStatus.type === 'text' && properties.publicityStatus.fields && properties.publicityStatus.fields.keyword) {
                    publicityStatusField = 'publicityStatus.keyword';
                    console.log(`[INFO] 🔧 publicityStatusはtext型のため、keyword サブフィールドを使用: ${publicityStatusField}`);
                } else if (properties.publicityStatus.type === 'keyword') {
                    publicityStatusField = 'publicityStatus';
                    console.log(`[INFO] ✅ publicityStatusはkeyword型で正常`);
                }
            }

            // isAdultContentフィールドの確認
            let isAdultContentField = 'isAdultContent';
            if (properties.isAdultContent) {
                console.log(`[INFO] 📋 isAdultContentフィールド: type=${properties.isAdultContent.type}`);
            }

        } catch (mappingError) {
            console.error(`[ERROR] マッピング確認エラー:`, mappingError);
        }

        // 検索キーワードを分割
        const mustIncludeTerms = mustInclude.split(/\s+/).filter(term => term.trim() !== "");
        const shouldIncludeTerms = shouldInclude.split(/\s+/).filter(term => term.trim() !== "");
        const mustNotIncludeTerms = mustNotInclude.split(/\s+/).filter(term => term.trim() !== "");

        console.log('[INFO] 🔍 キーワード分割:');
        console.log(`      ✅ mustIncludeTerms: ${JSON.stringify(mustIncludeTerms)}`);

        // ===== publicityStatusの事前テスト =====
        try {
            console.log(`[INFO] 🧪 publicityStatusフィルターのテスト...`);
            
            // まず、publicityStatusフィールドの存在とデータを確認
            const publicityTestResponse = await esClient.search({
                index: index,
                body: {
                    query: { match_all: {} },
                    size: 5,
                    _source: ['publicityStatus', 'title', '_id']
                }
            });

            console.log(`[INFO] 📊 全ドキュメント数（フィルター無し）: ${publicityTestResponse.hits.total.value} 件`);
            
            if (publicityTestResponse.hits.hits.length > 0) {
                console.log(`[INFO] 📄 publicityStatusサンプル:`);
                publicityTestResponse.hits.hits.forEach((hit, idx) => {
                    console.log(`    ${idx + 1}. ID:${hit._id} - publicityStatus: ${JSON.stringify(hit._source.publicityStatus)}`);
                });
            }

            // 様々なpublicityStatusフィルターでテスト
            const publicityTests = [
                { name: 'term-publicityStatus', query: { term: { "publicityStatus": "public" } } },
                { name: 'term-publicityStatus.keyword', query: { term: { "publicityStatus.keyword": "public" } } },
                { name: 'match-publicityStatus', query: { match: { "publicityStatus": "public" } } },
                { name: 'exists-publicityStatus', query: { exists: { "field": "publicityStatus" } } }
            ];

            for (const test of publicityTests) {
                try {
                    const testResponse = await esClient.search({
                        index: index,
                        body: {
                            query: test.query,
                            size: 1
                        }
                    });
                    console.log(`[INFO] 🔍 ${test.name}: ${testResponse.hits.total.value} 件`);
                } catch (testError) {
                    console.log(`[INFO] ❌ ${test.name}: エラー - ${testError.message}`);
                }
            }

        } catch (publicityTestError) {
            console.error(`[ERROR] publicityStatusテストエラー:`, publicityTestError);
        }

        // ===== フィールド別事前テスト（既存のキーワード検索テスト） =====
        if (mustIncludeTerms.length > 0) {
            const testKeyword = mustIncludeTerms[0];
            console.log(`[INFO] 🧪 フィールド別事前テスト: "${testKeyword}"`);
            
            for (const field of fields) {
                try {
                    const fieldTestResponse = await esClient.search({
                        index: index,
                        body: {
                            query: {
                                bool: {
                                    must: [{
                                        query_string: {
                                            query: `*${testKeyword}*`,
                                            fields: [field],
                                            analyze_wildcard: true
                                        }
                                    }],
                                    // 🔥 重要: publicityStatusフィルターを一時的に除外してテスト
                                    // filter: [{ term: { "publicityStatus.keyword": "public" } }]
                                }
                            },
                            size: 3,
                            _source: [field, 'title', '_id', 'publicityStatus']
                        }
                    });

                    console.log(`[INFO] 🔍 "${field}"フィールド単体テスト（publicityStatusフィルター無し）: ${fieldTestResponse.hits.total.value} 件`);
                    
                    if (fieldTestResponse.hits.hits.length > 0) {
                        fieldTestResponse.hits.hits.forEach((hit, idx) => {
                            const fieldValue = hit._source[field];
                            const preview = typeof fieldValue === 'string' ? 
                                fieldValue.substring(0, 100) + (fieldValue.length > 100 ? '...' : '') : 
                                JSON.stringify(fieldValue);
                            console.log(`    ${idx + 1}. ID:${hit._id} - publicityStatus:${JSON.stringify(hit._source.publicityStatus)} - ${field}: "${preview}"`);
                        });
                    }

                    // publicityStatusフィルターありでもテスト
                    const fieldTestWithFilterResponse = await esClient.search({
                        index: index,
                        body: {
                            query: {
                                bool: {
                                    must: [{
                                        query_string: {
                                            query: `*${testKeyword}*`,
                                            fields: [field],
                                            analyze_wildcard: true
                                        }
                                    }],
                                    filter: [{ term: { "publicityStatus.keyword": "public" } }]
                                }
                            },
                            size: 3
                        }
                    });

                    console.log(`[INFO] 🔍 "${field}"フィールド（publicityStatusフィルター付き）: ${fieldTestWithFilterResponse.hits.total.value} 件`);

                } catch (fieldTestError) {
                    console.error(`[ERROR] "${field}"フィールドテストエラー:`, fieldTestError.message);
                }
            }
        }

        // Elasticsearch のクエリ構築
        let query = {
            bool: {
                must: [],
                should: [],
                must_not: [],
                filter: [
                    // 🔥 重要な修正: publicityStatus.keyword を使用
                    { term: { "publicityStatus.keyword": "public" } }
                ]
            }
        };

        console.log(`[INFO] 🔒 publicityStatusフィルター修正: publicityStatus.keyword = "public"`);

        // キーワードが入力されている場合の検索クエリ
        if (mustIncludeTerms.length > 0) {
            console.log(`[INFO] 🔍 AND検索クエリを構築: ${mustIncludeTerms.join(', ')}`);
            
            mustIncludeTerms.forEach(term => {
                // フィールドごとに異なる検索戦略を適用
                const fieldQueries = [];

                fields.forEach(field => {
                    if (field === 'tags' || field === 'contestTags') {
                        // タグフィールドは完全一致を優先
                        fieldQueries.push({
                            term: {
                                [field]: {
                                    value: term,
                                    boost: 10.0
                                }
                            }
                        });
                        fieldQueries.push({
                            wildcard: {
                                [field]: {
                                    value: `*${term}*`,
                                    boost: 5.0
                                }
                            }
                        });
                    } else if (field === 'title') {
                        // タイトルフィールド
                        fieldQueries.push({
                            match_phrase: {
                                [field]: {
                                    query: term,
                                    boost: 8.0
                                }
                            }
                        });
                        fieldQueries.push({
                            match: {
                                [field]: {
                                    query: term,
                                    operator: "and",
                                    boost: 6.0
                                }
                            }
                        });
                        fieldQueries.push({
                            wildcard: {
                                [field]: {
                                    value: `*${term}*`,
                                    boost: 4.0
                                }
                            }
                        });
                    } else if (field === 'content' || field === 'description') {
                        // テキストフィールド（本文・説明）
                        fieldQueries.push({
                            match_phrase: {
                                [field]: {
                                    query: term,
                                    boost: 7.0
                                }
                            }
                        });
                        fieldQueries.push({
                            match: {
                                [field]: {
                                    query: term,
                                    operator: "and",
                                    boost: 5.0
                                }
                            }
                        });
                        fieldQueries.push({
                            wildcard: {
                                [field]: {
                                    value: `*${term}*`,
                                    boost: 3.0
                                }
                            }
                        });
                        fieldQueries.push({
                            query_string: {
                                query: `*${term}*`,
                                fields: [field],
                                analyze_wildcard: true,
                                boost: 2.0
                            }
                        });
                    }
                });

                // すべてのフィールドクエリをshouldで結合
                query.bool.must.push({
                    bool: {
                        should: fieldQueries,
                        minimum_should_match: 1
                    }
                });

                console.log(`[INFO] 🎯 キーワード "${term}" に対して ${fieldQueries.length} 個の検索戦略を適用`);
            });
        }

        // キーワードが指定されていない場合は全件取得クエリ
        if (mustIncludeTerms.length === 0 && shouldIncludeTerms.length === 0 && tags.length === 0 && !aiTool && !contestTag) {
            console.log(`[INFO] 🔍 キーワード未指定のため全件取得クエリを使用`);
            query = {
                bool: {
                    filter: [
                        { term: { "publicityStatus.keyword": "public" } }
                    ]
                }
            };
        }

        // OR検索 (should)
        if (shouldIncludeTerms.length > 0) {
            console.log(`[INFO] 🔍 OR検索を追加: ${shouldIncludeTerms.join(', ')}`);
            shouldIncludeTerms.forEach(term => {
                const fieldQueries = [];
                fields.forEach(field => {
                    if (field === 'tags' || field === 'contestTags') {
                        fieldQueries.push({ term: { [field]: term } });
                        fieldQueries.push({ wildcard: { [field]: `*${term}*` } });
                    } else {
                        fieldQueries.push({ match: { [field]: { query: term, operator: "or" } } });
                        fieldQueries.push({ wildcard: { [field]: `*${term}*` } });
                    }
                });
                
                query.bool.should.push({
                    bool: {
                        should: fieldQueries,
                        minimum_should_match: 1
                    }
                });
            });
        }

        // 除外検索 (must_not)
        if (mustNotIncludeTerms.length > 0) {
            console.log(`[INFO] 🔍 除外検索を追加: ${mustNotIncludeTerms.join(', ')}`);
            mustNotIncludeTerms.forEach(term => {
                const fieldQueries = [];
                fields.forEach(field => {
                    fieldQueries.push({ wildcard: { [field]: `*${term}*` } });
                    fieldQueries.push({ match: { [field]: term } });
                });
                
                query.bool.must_not.push({
                    bool: {
                        should: fieldQueries,
                        minimum_should_match: 1
                    }
                });
            });
        }

        // タグ検索
        if (tags.length > 0) {
            console.log(`[INFO] 🏷️ タグ検索を追加: ${tags.join(', ')} (${tagSearchType})`);
            if (tagSearchType === "exact") {
                query.bool.filter.push({ terms: { tags: tags } });
            } else {
                query.bool.must.push(...tags.map(tag => ({
                    match: {
                        tags: {
                            query: tag,
                            operator: "or"
                        }
                    }
                })));
            }
        }

        // AIツールフィルター
        if (aiTool) {
            console.log(`[INFO] 🤖 AIツールフィルターを追加: ${aiTool}`);
            query.bool.filter.push({
                term: {
                    "aiEvidence.tools": aiTool
                }
            });
        }

        // コンテストタグフィルター
        if (contestTag) {
            console.log(`[INFO] 🏆 コンテストタグ検索: ${contestTag}`);
            if (fields.includes('contestTags')) {
                query.bool.must.push({
                    match: {
                        contestTags: {
                            query: contestTag,
                            operator: "and"
                        }
                    }
                });
            } else {
                query.bool.filter.push({
                    term: {
                        "contestTags": contestTag
                    }
                });
            }
        }

        // 年齢制限フィルター
        if (ageFilter && ageFilter !== 'all') {
            console.log(`[INFO] 🔞 年齢制限フィルターを追加: ${ageFilter}`);
            query.bool.filter.push({
                term: {
                    isAdultContent: ageFilter === 'r18'
                }
            });
        }

        // 完結状態フィルター
        if (req.query.isCompleted !== undefined) {
            const isCompleted = req.query.isCompleted === 'true';
            console.log(`[INFO] ✅ 完結状態フィルターを追加: ${isCompleted}`);
            query.bool.filter.push({
                term: {
                    isCompleted: isCompleted
                }
            });
        }

        console.log('[INFO] 🔍 最終的なElasticsearch検索クエリ:');
        console.log(JSON.stringify(query, null, 2));

        // ソート設定
        let sort = [];
        switch (sortBy) {
            case 'newest':
                sort = [{ createdAt: "desc" }];
                break;
            case 'oldest':
                sort = [{ createdAt: "asc" }];
                break;
            case 'popularity':
                sort = [{ viewCounter: "desc" }, { goodCounter: "desc" }];
                break;
            case 'relevance':
            default:
                sort = ["_score", { createdAt: "desc" }];
                break;
        }

        console.log(`[INFO] 📊 ソート設定: ${JSON.stringify(sort)}`);

        // Elasticsearch 検索実行
        console.log(`[INFO] 🚀 Elasticsearch検索を実行中...`);
        const startTime = Date.now();
        
        const response = await esClient.search({
            index: index,
            body: {
                query,
                from: skip,
                size: size,
                sort: sort,
                highlight: {
                    fields: Object.fromEntries(fields.map(field => [field, {}])),
                    pre_tags: ["<mark>"],
                    post_tags: ["</mark>"]
                }
            }
        });

        const searchTime = Date.now() - startTime;
        const hits = response.hits.hits;
        const total = response.hits.total.value;

        console.log(`[INFO] ✅ Elasticsearch検索完了: ${searchTime}ms`);
        console.log(`[INFO] ✅ 検索結果: ${hits.length} 件 / 全 ${total} 件`);

        if (hits.length > 0) {
            console.log(`[INFO] 📋 検索結果サンプル:`);
            hits.slice(0, 3).forEach((hit, index) => {
                console.log(`  ${index + 1}. ID: ${hit._id}, スコア: ${hit._score}`);
                console.log(`     タイトル: ${hit._source.title || 'null'}`);
                console.log(`     publicityStatus: ${JSON.stringify(hit._source.publicityStatus)}`);
                
                // 指定されたフィールドの内容を表示
                fields.forEach(field => {
                    if (hit._source[field]) {
                        const value = typeof hit._source[field] === 'string' ? 
                            hit._source[field].substring(0, 100) + '...' : 
                            JSON.stringify(hit._source[field]);
                        console.log(`     ${field}: ${value}`);
                    }
                });
                
                if (hit.highlight) {
                    console.log(`     ハイライト: ${JSON.stringify(hit.highlight)}`);
                }
            });
        } else {
            console.log(`[INFO] ❌ 検索結果が0件でした`);
            return res.json({
                results: [],
                total: 0,
                page: parseInt(page),
                size: parseInt(size),
                message: "検索条件に一致する結果が見つかりませんでした。",
                debug: {
                    searchedFields: fields,
                    keywords: mustIncludeTerms,
                    searchedIndex: index,
                    publicityStatusFilter: "publicityStatus.keyword = 'public'"
                }
            });
        }

        // MongoDB から詳細データを取得
        const ids = hits.map(hit => hit._id);
        let results = [];

        console.log(`[INFO] 📋 MongoDB から詳細データを取得中: ${ids.length} 件`);

        if (type === 'posts') {
            results = await Post.find({ _id: { $in: ids } })
                .populate([
                    {
                        path: 'author',
                        select: 'nickname icon'
                    },
                    {
                        path: 'series',
                        select: 'title _id'
                    }
                ])
                .lean();
        } else if (type === 'series') {
            results = await Series.find({ _id: { $in: ids } })
                .populate([
                    {
                        path: 'author',
                        select: 'nickname icon'
                    }
                ])
                .lean();
        }

        console.log(`[INFO] 📋 MongoDB から取得したデータ: ${results.length} 件`);

        // Elasticsearch の順序でソート
        const sortedResults = ids.map(id => 
            results.find(result => result._id.toString() === id)
        ).filter(Boolean);

        // ハイライト情報を追加
        const enrichedResults = sortedResults.map((result, index) => {
            const hit = hits[index];
            return {
                ...result,
                highlight: hit.highlight || {},
                score: hit._score || 0
            };
        });

        console.log(`[INFO] ✅ 最終結果: ${enrichedResults.length} 件を返却`);

        res.json({
            results: enrichedResults,
            total,
            page: parseInt(page),
            size: parseInt(size),
            searchTime: `${searchTime}ms`,
            debug: {
                searchedFields: fields,
                keywords: mustIncludeTerms,
                publicityStatusFilter: "publicityStatus.keyword = 'public'"
            }
        });

    } catch (error) {
        console.error('[ERROR] 検索中にエラーが発生:', error);
        console.error('[ERROR] エラーの詳細:', error.stack);
        res.status(500).json({ 
            message: '検索中にエラーが発生しました。', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
module.exports = router;