import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  elasticsearch: {
    url: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    index: 'emails',
  },
  
  qdrant: {
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    collection: 'email_context',
  },
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
    embeddingModel: 'text-embedding-3-small',
  },
  
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
  },
  
  webhook: {
    url: process.env.WEBHOOK_URL || '',
  },
  
  email: {
    accounts: JSON.parse(process.env.EMAIL_ACCOUNTS || '[]'),
    syncDays: 30,
  },
  
  rag: {
    productInfo: process.env.PRODUCT_INFO || '',
    meetingLink: process.env.MEETING_LINK || '',
  },
};