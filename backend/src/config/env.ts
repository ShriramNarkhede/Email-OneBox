// backend/src/config/env.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    index: 'emails'
  },
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY || ''
  },
  
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL || ''
  },
  
  webhook: {
    url: process.env.WEBHOOK_URL || ''
  },
  
  qdrant: {
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    collectionName: 'email_context'
  },
  
  imap: {
    accounts: [
      {
        id: 'account1',
        email: process.env.IMAP_ACCOUNT_1_EMAIL || '',
        password: process.env.IMAP_ACCOUNT_1_PASSWORD || '',
        host: process.env.IMAP_ACCOUNT_1_HOST || 'imap.gmail.com',
        port: parseInt(process.env.IMAP_ACCOUNT_1_PORT || '993'),
        tls: true
      },
      {
        id: 'account2',
        email: process.env.IMAP_ACCOUNT_2_EMAIL || '',
        password: process.env.IMAP_ACCOUNT_2_PASSWORD || '',
        host: process.env.IMAP_ACCOUNT_2_HOST || 'imap.gmail.com',
        port: parseInt(process.env.IMAP_ACCOUNT_2_PORT || '993'),
        tls: true
      }
    ].filter(acc => acc.email && acc.password)
  }
};