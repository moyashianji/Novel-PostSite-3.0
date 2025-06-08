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
    const response = await esClient.search({
      index: 'posts',
      body: {
        size: 0, // 検索結果は不要
        aggs: {
          popular_tags: {
            terms: {
              field: "tags", // ✅ `keyword` を削除
              size: 20 // 人気タグトップ10
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
    

    res.json(tags);
  } catch (error) {
    console.error('❌ 人気タグ取得エラー:', error);
    res.status(500).json({ message: '人気タグの取得に失敗しました。' });
  }
});

module.exports = router;
