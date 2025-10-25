import { Router } from 'express';
import { OrchestratorService } from '../services/orchestrator.service';

export function createRoutes(orchestrator: OrchestratorService): Router {
  const router = Router();

  // Health check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Search emails
  router.get('/emails', async (req, res) => {
    try {
      const query = {
        query: req.query.q as string,
        account: req.query.account as string,
        folder: req.query.folder as string,
        category: req.query.category as any,
        from: parseInt(req.query.from as string) || 0,
        size: parseInt(req.query.size as string) || 50,
      };

      const emails = await orchestrator.searchEmails(query);
      res.json({ success: true, data: emails, total: emails.length });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get single email
  router.get('/emails/:id', async (req, res) => {
    try {
      const email = await orchestrator.getEmailById(req.params.id);
      if (!email) {
        return res.status(404).json({ success: false, error: 'Email not found' });
      }
      res.json({ success: true, data: email });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get suggested reply
  router.get('/emails/:id/suggested-reply', async (req, res) => {
    try {
      const reply = await orchestrator.getSuggestedReply(req.params.id);
      res.json({ success: true, data: { reply } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

// Get stats - OPTIMIZED WITH AGGREGATIONS
router.get('/stats', async (req, res) => {
  try {
    // Get total count directly from Elasticsearch
    const countResult = await orchestrator.getEmailCount();
    
    // Get aggregations (fast!)
    const categoryAgg = await orchestrator.getCategoryStats();
    const accountAgg = await orchestrator.getAccountStats();

    const stats = {
      total: countResult,
      byCategory: categoryAgg,
      byAccount: accountAgg,
    };

    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Stats error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

  return router;
}