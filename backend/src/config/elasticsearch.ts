// backend/src/config/elasticsearch.ts
import { Client } from '@elastic/elasticsearch';
import { config } from './env';

export const esClient = new Client({
  node: config.elasticsearch.node
});

export const createEmailIndex = async () => {
  const indexExists = await esClient.indices.exists({
    index: config.elasticsearch.index
  });

  if (!indexExists) {
    await esClient.indices.create({
      index: config.elasticsearch.index,
      body: {
        mappings: {
          properties: {
            messageId: { type: 'keyword' },
            accountId: { type: 'keyword' },
            folder: { type: 'keyword' },
            from: {
              properties: {
                name: { type: 'text' },
                email: { type: 'keyword' }
              }
            },
            to: {
              type: 'nested',
              properties: {
                name: { type: 'text' },
                email: { type: 'keyword' }
              }
            },
            subject: { 
              type: 'text',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            body: { type: 'text' },
            html: { type: 'text', index: false },
            date: { type: 'date' },
            category: { type: 'keyword' },
            hasAttachments: { type: 'boolean' },
            isRead: { type: 'boolean' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        },
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          analysis: {
            analyzer: {
              email_analyzer: {
                type: 'standard',
                stopwords: '_english_'
              }
            }
          }
        }
      }
    });
    console.log('✅ Elasticsearch index created');
  }
};