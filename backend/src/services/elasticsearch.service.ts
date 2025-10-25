import { Client } from '@elastic/elasticsearch';
import { config } from '../config';
import { Email, SearchQuery } from '../types';

export class ElasticsearchService {
  private client: Client;

  constructor() {
    this.client = new Client({ node: config.elasticsearch.url });
  }

  async initialize(): Promise<void> {
    const indexExists = await this.client.indices.exists({
      index: config.elasticsearch.index,
    });

    if (!indexExists) {
      await this.client.indices.create({
        index: config.elasticsearch.index,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              messageId: { type: 'keyword' },
              accountEmail: { type: 'keyword' },
              from: { type: 'text' },
              to: { type: 'keyword' },
              subject: { type: 'text' },
              body: { type: 'text' },
              htmlBody: { type: 'text' },
              date: { type: 'date' },
              folder: { type: 'keyword' },
              category: { type: 'keyword' },
              attachments: { type: 'object' },
              headers: { type: 'object', enabled: false },
            },
          },
        },
      });
      console.log('Elasticsearch index created');
    }
  }

  async indexEmail(email: Email): Promise<void> {
    await this.client.index({
      index: config.elasticsearch.index,
      id: email.id,
      document: email,
    });
  }

  async bulkIndexEmails(emails: Email[]): Promise<void> {
    if (emails.length === 0) return;

    const body = emails.flatMap((email) => [
      { index: { _index: config.elasticsearch.index, _id: email.id } },
      email,
    ]);

    await this.client.bulk({ body, refresh: true });
  }

  async searchEmails(query: SearchQuery): Promise<Email[]> {
  const must: any[] = [];

  if (query.query) {
    must.push({
      multi_match: {
        query: query.query,
        fields: ['subject^2', 'body', 'from'],
      },
    });
  }

  if (query.account) {
    must.push({ term: { accountEmail: query.account } });
  }

  if (query.folder) {
    must.push({ term: { folder: query.folder } });
  }

  if (query.category) {
    must.push({ term: { category: query.category } });
  }

  const result = await this.client.search({
    index: config.elasticsearch.index,
    body: {
      query: must.length > 0 ? { bool: { must } } : { match_all: {} },
      from: query.from || 0,
      size: query.size || 100, // Changed from 50 to 100
      sort: [{ date: { order: 'desc' } }],
    },
  });

  return result.hits.hits.map((hit: any) => hit._source as Email);
}

  async getEmailById(id: string): Promise<Email | null> {
    try {
      const result = await this.client.get({
        index: config.elasticsearch.index,
        id,
      });
      return result._source as Email;
    } catch (error) {
      return null;
    }
  }

  async updateEmailCategory(id: string, category: string): Promise<void> {
    await this.client.update({
      index: config.elasticsearch.index,
      id,
      body: {
        doc: { category },
      },
    });
  }

    async getCount(): Promise<number> {
    try {
      const result = await this.client.count({
        index: config.elasticsearch.index,
      });
      return result.count;
    } catch (error) {
      console.error('Count error:', error);
      return 0;
    }
  }

  async getCategoryAggregation(): Promise<Record<string, number>> {
    try {
      const result = await this.client.search({
        index: config.elasticsearch.index,
        body: {
          size: 0,
          aggs: {
            categories: {
              terms: {
                field: 'category',
                size: 20,
              },
            },
          },
        },
      });

      const buckets = (result.aggregations?.categories as any)?.buckets || [];
      const categoryStats: Record<string, number> = {};
      
      buckets.forEach((bucket: any) => {
        categoryStats[bucket.key || 'Uncategorized'] = bucket.doc_count;
      });

      return categoryStats;
    } catch (error) {
      console.error('Category aggregation error:', error);
      return {};
    }
  }

  async getAccountAggregation(): Promise<Record<string, number>> {
    try {
      const result = await this.client.search({
        index: config.elasticsearch.index,
        body: {
          size: 0,
          aggs: {
            accounts: {
              terms: {
                field: 'accountEmail',
                size: 20,
              },
            },
          },
        },
      });

      const buckets = (result.aggregations?.accounts as any)?.buckets || [];
      const accountStats: Record<string, number> = {};
      
      buckets.forEach((bucket: any) => {
        accountStats[bucket.key] = bucket.doc_count;
      });

      return accountStats;
    } catch (error) {
      console.error('Account aggregation error:', error);
      return {};
    }
  }

}