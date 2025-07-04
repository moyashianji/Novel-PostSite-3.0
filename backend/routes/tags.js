const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Good = require('../models/Good');
const Series = require('../models/Series');
const Follow = require('../models/Follow'); // Followモデルのインポート
const NodeCache = require('node-cache');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();
const tagCache = new NodeCache({ stdTTL: 3600 }); // キャッシュの有効期間を1時間に設定

const { getEsClient } = require('../utils/esClient');
const esClient = getEsClient();

router.get('/tags/popular', async (req, res) => {
  try {
    const ageFilter = req.query.ageFilter || 'all'; // 'all', 'general', 'r18'
    
    // Elasticsearchクエリの構築
    let query = {
      bool: {
        filter: [
          { term: { "publicityStatus": "public" } } // 公開作品のみ
        ]
      }
    };

    // 年齢フィルターの適用
    if (ageFilter === 'general') {
      // 全年齢のみ（isAdultContent: false）
      query.bool.filter.push({ term: { "isAdultContent": false } });
    } else if (ageFilter === 'r18') {
      // R18のみ（isAdultContent: true）
      query.bool.filter.push({ term: { "isAdultContent": true } });
    }
    // 'all' の場合はフィルターを追加しない

    console.log(`[INFO] 🔞 人気タグ取得 - 年齢フィルター: ${ageFilter}`);
    console.log(`[INFO] 🔍 Elasticsearchクエリ:`, JSON.stringify(query, null, 2));

    const response = await esClient.search({
      index: 'posts_fixed',
      body: {
        size: 0, // 検索結果は不要
        query: query, // フィルタークエリを追加
        aggs: {
          popular_tags: {
            terms: {
              field: "tags", // タグフィールドの集計
              size: 20 // 人気タグトップ20
            }
          }
        }
      }
    });

    // 人気タグリストを作成
    const tags = response.aggregations.popular_tags.buckets.map(bucket => ({
      tag: bucket.key,
      count: bucket.doc_count
    }));
    
    console.log(`[INFO] ✅ 人気タグ取得成功 - ${tags.length} 件 (フィルター: ${ageFilter})`);
    console.log(`[INFO] 📊 上位5タグ:`, tags.slice(0, 5).map(t => `${t.tag}(${t.count})`).join(', '));

    res.json(tags);
  } catch (error) {
    console.error('❌ 人気タグ取得エラー:', error);
    res.status(500).json({ message: '人気タグの取得に失敗しました。' });
  }
});

module.exports = router;