import { ImapService } from './imap.service';
import { ElasticsearchService } from './elasticsearch.service';
import { AIService } from './ai.service';
import { QdrantService } from './qdrant.service';
import { NotificationService } from './notification.service';
import { Email, EmailCategory } from '../types';
import { config } from '../config';

export class OrchestratorService {
  private imapService: ImapService;
  private esService: ElasticsearchService;
  private aiService: AIService;
  private qdrantService: QdrantService;
  private notificationService: NotificationService;

  constructor() {
    this.imapService = new ImapService();
    this.esService = new ElasticsearchService();
    this.aiService = new AIService();
    this.qdrantService = new QdrantService(this.aiService);
    this.notificationService = new NotificationService();
  }

  async initialize(): Promise<void> {
  try {
    console.log('🚀 Initializing services...');
    
    // Initialize storage
    await this.esService.initialize();
    await this.qdrantService.initialize();

    console.log('📧 Connecting to email accounts...');

    // Connect IMAP accounts
    for (const account of config.email.accounts) {
      try {
        await this.imapService.connectAccount(account);
        
        console.log(`📥 Fetching historical emails for ${account.email}...`);
        const emails = await this.imapService.fetchHistoricalEmails(
          account,
          config.email.syncDays
        );
        
        if (emails.length > 0) {
          await this.processEmailBatch(emails);
        } else {
          console.log(`📭 No emails found for ${account.email}`);
        }
      } catch (error) {
        console.error(`❌ Error with account ${account.email}:`, error);
        // Continue with other accounts
      }
    }

    // Listen for new emails
    this.imapService.on('newEmail', async (email: Email) => {
      try {
        await this.processNewEmail(email);
      } catch (error) {
        console.error('❌ Error processing new email:', error);
      }
    });

    console.log('✅ All services initialized successfully!');
  } catch (error) {
    console.error('❌ Initialization error:', error);
    throw error;
  }
}

private async processEmailBatch(emails: Email[]): Promise<void> {
  console.log(`📊 Processing ${emails.length} emails...`);
  
  try {
    // Categorize emails
    const categorizedEmails = [];
    for (const email of emails) {
      try {
        email.category = await this.aiService.categorizeEmail(email);
        categorizedEmails.push(email);
      } catch (error) {
        console.error(`Error categorizing email:`, error);
        email.category = EmailCategory.UNCATEGORIZED;
        categorizedEmails.push(email);
      }
    }

    // Bulk index to Elasticsearch
    console.log('💾 Indexing to Elasticsearch...');
    await this.esService.bulkIndexEmails(categorizedEmails);
    console.log('✅ Indexed successfully');

    // Send notifications (non-blocking)
    const interestedEmails = categorizedEmails.filter(
      (email) => email.category === EmailCategory.INTERESTED
    );

    if (interestedEmails.length > 0) {
      console.log(`📧 Sending ${interestedEmails.length} notifications...`);
      // Don't await - run in background
      Promise.all(
        interestedEmails.map(email => this.sendNotifications(email).catch(err => 
          console.error('Notification error:', err)
        ))
      ).catch(() => {});
    }

    console.log(`✅ Processed ${emails.length} emails`);
  } catch (error) {
    console.error('❌ Error in processEmailBatch:', error);
    // Don't throw - allow server to continue
  }
} 

  private async processNewEmail(email: Email): Promise<void> {
    console.log(`Processing new email: ${email.subject}`);

    // Categorize
    email.category = await this.aiService.categorizeEmail(email);

    // Index to Elasticsearch
    await this.esService.indexEmail(email);

    // Send notifications if interested
    if (email.category === EmailCategory.INTERESTED) {
      await this.sendNotifications(email);
    }
  }

  private async sendNotifications(email: Email): Promise<void> {
    await Promise.all([
      this.notificationService.sendSlackNotification(email),
      this.notificationService.triggerWebhook(email),
    ]);
  }

  async searchEmails(query: any): Promise<Email[]> {
    return this.esService.searchEmails(query);
  }

  async getEmailById(id: string): Promise<Email | null> {
    return this.esService.getEmailById(id);
  }

  async getSuggestedReply(emailId: string): Promise<string> {
    const email = await this.esService.getEmailById(emailId);
    if (!email) throw new Error('Email not found');

    // Search for relevant context
    const contexts = await this.qdrantService.searchSimilarContext(
      email.body,
      1
    );

    const contextText = contexts[0]?.payload?.text || config.rag.productInfo;
    
    // Generate reply
    return this.aiService.generateReply(email.body, contextText);
  }

  async getEmailCount(): Promise<number> {
    const result = await this.esService.getCount();
    return result;
  }

  async getCategoryStats(): Promise<Record<string, number>> {
    return this.esService.getCategoryAggregation();
  }

  async getAccountStats(): Promise<Record<string, number>> {
    return this.esService.getAccountAggregation();
  }

  async shutdown(): Promise<void> {
    await this.imapService.disconnectAll();
  }
}