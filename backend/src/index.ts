import express from 'express';
import cors from 'cors';
import { config } from './config';
import { OrchestratorService } from './services/orchestrator.service';
import { createRoutes } from './routes';

const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const orchestrator = new OrchestratorService();

app.use('/api', createRoutes(orchestrator));

async function start() {
  try {
    console.log('🚀 Starting server...');
    
    // Start HTTP server FIRST (so it's accessible immediately)
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`🌐 API available at: http://localhost:${config.port}/api`);
    });

    // THEN initialize email sync in background
    console.log('📧 Initializing email sync in background...');
    orchestrator.initialize().catch((error) => {
      console.error('❌ Email sync initialization error:', error);
      console.log('⚠️  Server is still running, but email sync failed');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await orchestrator.shutdown();
  process.exit(0);
});

start();