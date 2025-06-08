const Series = require('../models/Series');
const sanitizeHtml = require('sanitize-html');
const { getEsClient } = require('../utils/esClient');
const esClient = getEsClient();

async function migrateSeriesToElasticsearch() {
    try {
        console.log('🔍 Elasticsearch へ `series` データを送信中...');

        // MongoDB から `series` データを取得
        const seriesList = await Series.find({});

        if (!seriesList || seriesList.length === 0) {
            console.log('✅ すべてのデータが Elasticsearch に送信済みです。');
            return;
        }

        // Elasticsearch にデータを一括登録 (Bulk API)
        const body = seriesList.flatMap((series) => {
            if (!series.title || !series.description) return [];

            // ✅ HTMLタグを除去
            const cleanDescription = sanitizeHtml(series.description, {
                allowedTags: [],
                allowedAttributes: {}
            });

            return [
                { index: { _index: 'series', _id: series._id.toString() } },
                {
                    title: series.title,
                    description: cleanDescription,
                    tags: series.tags || [],
                    createdAt: series.createdAt
                }
            ];
        });

        if (body.length === 0) {
            console.log('✅ 送信するデータがありません。スキップします。');
            return;
        }

        console.log('📤 Elasticsearch に送信中...', JSON.stringify(body, null, 2));

        // 🔥 `esClient.bulk` がエラーを出す場合、`console.log(esClient)` で確認
        console.log('🚀 esClient:', esClient);

        const bulkResponse = await esClient.bulk({ refresh: "wait_for", body });

        if (bulkResponse.errors) {
            console.error('❌ Elasticsearch への一部データ送信に失敗:', 
                JSON.stringify(bulkResponse.items.filter(item => item.index && item.index.error), null, 2)
            );
        } else {
            console.log(`✅ ${bulkResponse.items.length} 件のシリーズデータを Elasticsearch に送信しました。`);
        }
    } catch (error) {
        console.error('❌ Elasticsearch へのデータ移行エラー:', error);
    }
}

module.exports = { migrateSeriesToElasticsearch };
