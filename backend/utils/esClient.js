const { Client } = require('@elastic/elasticsearch');

let esClient = null;

function getEsClient() {
  if (!esClient) {
    console.log('🔌 Connecting to Elasticsearch...');

    esClient = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    });

    esClient.ping()
      .then(() => console.log('✅ Elasticsearch is connected!'))
      .catch((error) => {
        console.error('❌ Elasticsearch connection failed:', error.message);
       console.error('🔍 詳細:', error);
      });
  }

  return esClient;
}

module.exports = { getEsClient };
