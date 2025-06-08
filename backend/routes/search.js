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
                // Get post count
                const postCount = await Post.countDocuments({ author: user._id });

                // Get series count
                const seriesCount = await Series.countDocuments({ author: user._id });

                const recentWorks = await Post.find({ author: user._id })
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


router.get('/', async (req, res) => {
    try {
        if (!esClient) {
            console.error('[ERROR] Elasticsearch クライアントが初期化されていません');
            return res.status(500).json({ message: 'Elasticsearch クライアントが初期化されていません。' });
        }

        
        

        // 🔍 検索対象を決定 (`posts` または `series`)
        const type = req.query.type || 'posts';
        const index = type === 'series' ? 'series' : 'posts';

            
        // 🌟 ページネーションのパラメータ
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        const from = (page - 1) * size;


        
        // 🔍 検索キーワード
        const mustInclude = req.query.mustInclude || '';
        const shouldInclude = req.query.shouldInclude || '';
        const mustNotInclude = req.query.mustNotInclude || '';
        const tagSearchType = req.query.tagSearchType || 'partial';
        const tags = req.query.tags ? req.query.tags.split(',') : [];
        const aiTool = req.query.aiTool || ''; // AIツールパラメータを追加
        const ageFilter = req.query.ageFilter || 'all'; // 年齢制限フィルターを追加
        const sortBy = req.query.sortBy || 'newest'; // ソートオプションを追加


        

        // 🔹 fields の取得とデバッグ強化
        let fields = [];
        if (typeof req.query.fields === 'string') {
            fields = req.query.fields.split(',');
        } else {
            fields = type === 'series' ? ['title', 'description', 'tags'] : ['title', 'content', 'tags'];
        }

        console.log(`[INFO] 🎯 検索フィールド: ${fields.join(', ')}`);

        // 🔍 検索キーワードを分割
        const mustIncludeTerms = mustInclude.split(/\s+/).filter(term => term.trim() !== "");
        const shouldIncludeTerms = shouldInclude.split(/\s+/).filter(term => term.trim() !== "");
        const mustNotIncludeTerms = mustNotInclude.split(/\s+/).filter(term => term.trim() !== "");

        console.log('[INFO] 🔍 キーワード分割:');
        console.log(`      ✅ mustIncludeTerms: ${mustIncludeTerms}`);
        console.log(`      ✅ shouldIncludeTerms: ${shouldIncludeTerms}`);
        console.log(`      ✅ mustNotIncludeTerms: ${mustNotIncludeTerms}`);

        // ✅ Elasticsearch のクエリ構築
        let query = { bool: { must: [], should: [], must_not: [], filter: [] } };

        if (mustIncludeTerms.length > 0) {
            query.bool.must.push(...mustIncludeTerms.map(term => ({
                multi_match: {
                    query: term,
                    fields: fields,
                    fuzziness: "AUTO",
                    operator: "and"
                }
            })));
        }

        if (shouldIncludeTerms.length > 0) {
            query.bool.should.push(...shouldIncludeTerms.map(term => ({
                multi_match: {
                    query: term,
                    fields: fields,
                    fuzziness: "AUTO",
                    operator: "or"
                }
            })));
        }

        if (mustNotIncludeTerms.length > 0) {
            query.bool.must_not.push(...mustNotIncludeTerms.map(term => ({
                multi_match: {
                    query: term,
                    fields: fields,
                    fuzziness: "AUTO"
                }
            })));
        }

        if (tags.length > 0) {
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

        // AIツールでの検索を追加
        if (aiTool) {
            query.bool.filter.push({
                term: {
                    "aiEvidence.tools": aiTool
                }
            });
        }

        // 年齢制限でのフィルタリングを追加
        if (ageFilter && ageFilter !== 'all') {
            query.bool.filter.push({
                term: {
                    isAdultContent: ageFilter === 'r18'
                }
            });
        }
        if (req.query.isCompleted !== undefined) {
            // 'true', 'false' の文字列をブール値に変換
            const isCompleted = req.query.isCompleted === 'true';
            query.bool.filter.push({
                term: {
                    isCompleted: isCompleted
                }
            });
        }
        console.log('[INFO] 🔍 Elasticsearch 検索クエリ:', JSON.stringify(query, null, 2));

        // Elasticsearchではソートを使用せず、単純にIDのリストを取得
        const response = await esClient.search({
            index: index,
            body: {
                query,
                from: 0, // 全IDを取得
                size: 1000, // より多くのIDを取得（実際の状況に応じて調整）
                _source: false, // IDだけを取得してソースは不要
            }
        });

        console.log(`[INFO] 📥 Elasticsearch のレスポンス: totalHits=${response.hits.total.value}`);

        const docIds = response.hits.hits.map(hit => hit._id);
        const totalHits = response.hits.total.value;

        if (docIds.length === 0) {
            console.log("[INFO] ❌ 検索結果なし");
            return res.json({ results: [], total: 0, page, size });
        }

        console.log(`[INFO] 📋 Elasticsearch から取得した _id: ${docIds.length} 件`);

        if (type === 'posts') {
            // 作品の場合の検索・ソート処理
            const getSortConfig = (sortBy) => {
                switch (sortBy) {
                    case 'newest':
                        return { createdAt: -1 };
                    case 'oldest':
                        return { createdAt: 1 };
                    case 'updated':
                        return { updatedAt: -1, createdAt: -1 };
                    case 'views':
                        return { viewCounter: -1, createdAt: -1 };
                    case 'likes':
                        return { goodCounter: -1, createdAt: -1 };
                    case 'bookmarks':
                        return { bookShelfCounter: -1, createdAt: -1 };
                    default:
                        return { createdAt: -1 };
                }
            };

            const sortConfig = getSortConfig(sortBy);
            
            // MongoDB側でソートしつつ、指定されたIDのみを取得
            const results = await Post.find({ _id: { $in: docIds } })
                .populate('author')
                .populate('series')
                .sort(sortConfig)
                .skip(from)
                .limit(size)
                .lean();

            console.log(`[INFO] ✅ MongoDB から取得したデータ数: ${results.length}`);

            res.json({
                results,
                total: totalHits,
                page,
                size,
                hasMore: from + results.length < totalHits
            });
        } else {
            // シリーズの場合の検索・ソート処理
            // まずシリーズを取得
            const seriesData = await Series.find({ _id: { $in: docIds } })
                .populate('author')
                .populate({
                    path: 'posts.postId',
                    select: 'viewCounter goodCounter bookShelfCounter'
                })
                .lean();

            console.log(`[INFO] 📊 シリーズ件数: ${seriesData.length} 件`);

            // シリーズごとに含まれる作品のメトリクスを計算
            const enrichedSeriesData = seriesData.map(series => {
                // 有効なpostIdを持つ投稿のみをフィルタリング
                const validPosts = (series.posts || []).filter(p => p.postId);
                
                // 各メトリクスの合計を計算
                const totalViews = validPosts.reduce((sum, p) => sum + (p.postId.viewCounter || 0), 0);
                const totalLikes = validPosts.reduce((sum, p) => sum + (p.postId.goodCounter || 0), 0);
                const totalBookmarks = validPosts.reduce((sum, p) => sum + (p.postId.bookShelfCounter || 0), 0);
                
                return {
                    ...series,
                    _totalViews: totalViews,
                    _totalLikes: totalLikes,
                    _totalBookmarks: totalBookmarks
                };
            });

            // 選択されたソート方法に基づいてシリーズをソート
            const sortedSeriesData = [...enrichedSeriesData];
            
            switch (sortBy) {
                case 'newest':
                    sortedSeriesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                case 'oldest':
                    sortedSeriesData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    break;
                case 'updated':
                    sortedSeriesData.sort((a, b) => {
                        const aDate = a.updatedAt ? new Date(a.updatedAt) : new Date(a.createdAt);
                        const bDate = b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt);
                        return bDate - aDate;
                    });
                    break;
                case 'views':
                    sortedSeriesData.sort((a, b) => {
                        if (b._totalViews !== a._totalViews) {
                            return b._totalViews - a._totalViews;
                        }
                        // 閲覧数が同じ場合は作成日時で降順ソート
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
                    break;
                case 'likes':
                    sortedSeriesData.sort((a, b) => {
                        if (b._totalLikes !== a._totalLikes) {
                            return b._totalLikes - a._totalLikes;
                        }
                        // いいね数が同じ場合は作成日時で降順ソート
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
                    break;
                case 'bookmarks':
                    sortedSeriesData.sort((a, b) => {
                        if (b._totalBookmarks !== a._totalBookmarks) {
                            return b._totalBookmarks - a._totalBookmarks;
                        }
                        // ブックマーク数が同じ場合は作成日時で降順ソート
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
                    break;
                default:
                    sortedSeriesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
            }

            // ページネーション適用
            const paginatedResults = sortedSeriesData.slice(from, from + size);

            // 計算用のプロパティを削除（クライアントに送信する前に）
            const cleanResults = paginatedResults.map(({ _totalViews, _totalLikes, _totalBookmarks, ...rest }) => {
                return {
                    ...rest,
                    isCompleted: rest.isCompleted !== undefined ? rest.isCompleted : false // isCompleted が undefined の場合はデフォルトで false
                };
            });
            
            console.log(`[INFO] ✅ ソート・ページネーション後のデータ数: ${cleanResults.length}`);
            
            res.json({
                results: cleanResults,
                total: sortedSeriesData.length,
                page,
                size,
                hasMore: from + cleanResults.length < sortedSeriesData.length
            });
        }
        
        console.log('\n🔍 ================== 検索リクエスト完了 ==================\n');

    } catch (error) {
        console.error('❌ 検索エンドポイントでのエラー:', error);
        res.status(500).json({ message: '検索結果の取得に失敗しました。', error: error.message });
    }
});

module.exports = router;