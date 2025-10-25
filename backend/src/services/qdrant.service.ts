
import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '../config';
import { AIService } from './ai.service';

export class QdrantService {
  private client: QdrantClient;
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.client = new QdrantClient({ url: config.qdrant.url });
    this.aiService = aiService;
  }

  async initialize(): Promise<void> {
    try {
      await this.client.getCollection(config.qdrant.collection);
      console.log('Qdrant collection exists');
    } catch (error) {
      await this.client.createCollection(config.qdrant.collection, {
        vectors: { size: 1536, distance: 'Cosine' },
      });
      console.log('Qdrant collection created');
      
      // Index initial context
      await this.indexProductContext();
    }
  }

  private async indexProductContext(): Promise<void> {
    const contextText = `${config.rag.productInfo}\nMeeting booking link: ${config.rag.meetingLink}`;
    const embedding = await this.aiService.generateEmbedding(contextText);

    await this.client.upsert(config.qdrant.collection, {
      points: [
        {
          id: 'product_context',
          vector: embedding,
          payload: {
            text: contextText,
            type: 'product_info',
            meetingLink: config.rag.meetingLink,
          },
        },
      ],
    });
  }

  async searchSimilarContext(query: string, limit: number = 3): Promise<any[]> {
    const embedding = await this.aiService.generateEmbedding(query);

    const results = await this.client.search(config.qdrant.collection, {
      vector: embedding,
      limit,
    });

    return results;
  }
}