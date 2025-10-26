import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Email, EmailAccount } from '../types';

export class ImapService extends EventEmitter {
  private connections: Map<string, any> = new Map();
  private checkIntervals: Map<string, NodeJS.Timeout> = new Map();

  async connectAccount(account: EmailAccount): Promise<void> {
    const imap = new Imap({
      user: account.email,
      password: account.password,
      host: account.host,
      port: account.port,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      keepalive: {
        interval: 10000,
        idleInterval: 30000,
        forceNoop: true,
      },
      connTimeout: 60000,
      authTimeout: 10000,
    });

    return new Promise((resolve, reject) => {
      imap.once('ready', () => {
        console.log(`✅ Connected to ${account.email}`);
        this.connections.set(account.email, imap);
        this.setupIdleMode(imap, account);
        resolve();
      });

      imap.once('error', (err: Error) => {
        console.error(`❌ Connection error for ${account.email}:`, err);
        reject(err);
      });

      imap.once('end', () => {
        console.log(`⚠️  Connection ended for ${account.email}, reconnecting...`);
        // Clear any existing interval
        const interval = this.checkIntervals.get(account.email);
        if (interval) clearInterval(interval);
        // Reconnect after 5 seconds
        setTimeout(() => this.connectAccount(account), 5000);
      });

      imap.connect();
    });
  }

  private setupIdleMode(imap: any, account: EmailAccount): void {
    imap.openBox('INBOX', false, (err: any) => {
      if (err) {
        console.error('Error opening inbox:', err);
        return;
      }

      console.log(`📬 INBOX opened for ${account.email}`);
      
      // Listen for new mail events
      imap.on('mail', (numNewMsgs: number) => {
        console.log(`📧 ${numNewMsgs} new email(s) received for ${account.email}`);
        this.fetchNewEmails(imap, account);
      });

      // Try to use IDLE mode (Gmail supports it)
      try {
        console.log(`🔄 Attempting IDLE mode for ${account.email}`);
        imap.idle((err: any) => {
          if (err) {
            console.warn(`⚠️  IDLE failed for ${account.email}: ${err.message}`);
            this.setupPolling(imap, account);
          } else {
            console.log(`✅ IDLE mode active for ${account.email}`);
          }
        });

        // Restart IDLE on update
        imap.on('update', () => {
          imap.idle((err: any) => {
            if (!err) {
              console.log(`🔄 IDLE restarted for ${account.email}`);
            }
          });
        });
      } catch (error) {
        console.log(`📊 IDLE not available for ${account.email}, using polling (check every 30s)`);
        this.setupPolling(imap, account);
      }
    });
  }

  private setupPolling(imap: any, account: EmailAccount): void {
    // Clear any existing interval
    const existingInterval = this.checkIntervals.get(account.email);
    if (existingInterval) clearInterval(existingInterval);

    // Check for new emails every 30 seconds
    const interval = setInterval(() => {
      console.log(`🔍 Checking for new emails on ${account.email}...`);
      this.fetchNewEmails(imap, account);
    }, 30000);

    this.checkIntervals.set(account.email, interval);

    // Do an immediate check
    this.fetchNewEmails(imap, account);
  }

  private fetchNewEmails(imap: any, account: EmailAccount): void {
    imap.search(['UNSEEN'], (err: any, results: number[]) => {
      if (err) {
        console.error('Search error:', err);
        return;
      }
      
      if (!results || results.length === 0) {
        return;
      }

      console.log(`📥 Fetching ${results.length} unseen email(s)...`);

      const fetch = imap.fetch(results, {
        bodies: '',
        struct: true,
        markSeen: false,
      });

      fetch.on('message', (msg: any) => {
        let buffer = '';

        msg.on('body', (stream: any) => {
          stream.on('data', (chunk: any) => {
            buffer += chunk.toString('utf8');
          });
        });

        msg.once('end', async () => {
          try {
            const parsed = await simpleParser(buffer);
            const email = this.parseEmail(parsed, account.email, 'INBOX');
            this.emit('newEmail', email);
          } catch (error) {
            console.error('Error parsing email:', error);
          }
        });
      });

      fetch.once('error', (err: any) => {
        console.error('Fetch error:', err);
      });
    });
  }

  async fetchHistoricalEmails(
    account: EmailAccount,
    days: number = 30
  ): Promise<Email[]> {
    const imap = this.connections.get(account.email);
    if (!imap) throw new Error('IMAP connection not found');

    return new Promise((resolve, reject) => {
      imap.openBox('INBOX', true, (err: any) => {
        if (err) return reject(err);

        const since = new Date();
        since.setDate(since.getDate() - days);

        imap.search([['SINCE', since]], (err: any, results: number[]) => {
          if (err) return reject(err);
          if (!results || results.length === 0) {
            console.log(`📭 No emails found in last ${days} days for ${account.email}`);
            return resolve([]);
          }

          console.log(`📬 Found ${results.length} emails in last ${days} days`);

          const emails: Email[] = [];
          const fetch = imap.fetch(results, { bodies: '', struct: true });

          fetch.on('message', (msg: any) => {
            let buffer = '';

            msg.on('body', (stream: any) => {
              stream.on('data', (chunk: any) => {
                buffer += chunk.toString('utf8');
              });
            });

            msg.once('end', async () => {
              try {
                const parsed = await simpleParser(buffer);
                emails.push(this.parseEmail(parsed, account.email, 'INBOX'));
              } catch (error) {
                console.error('Error parsing historical email:', error);
              }
            });
          });

          fetch.once('error', reject);
          fetch.once('end', () => {
            console.log(`✅ Fetched ${emails.length} historical emails`);
            resolve(emails);
          });
        });
      });
    });
  }

  private parseEmail(parsed: ParsedMail, accountEmail: string, folder: string): Email {
    // Helper function to extract email addresses as string
    const getEmailString = (addressObj: any): string => {
      if (!addressObj) return '';
      if (Array.isArray(addressObj)) {
        return addressObj.map(addr => addr.address || '').join(', ');
      }
      if (addressObj.value && Array.isArray(addressObj.value)) {
        return addressObj.value.map((addr: any) => addr.address || '').join(', ');
      }
      if (addressObj.address) return addressObj.address;
      return String(addressObj);
    };

    // Helper function to extract email addresses as array
    const getEmailArray = (addressObj: any): string[] => {
      if (!addressObj) return [];
      if (Array.isArray(addressObj)) {
        return addressObj.map(addr => addr.address || '');
      }
      if (addressObj.value && Array.isArray(addressObj.value)) {
        return addressObj.value.map((addr: any) => addr.address || '');
      }
      if (addressObj.address) return [addressObj.address];
      return [];
    };

    return {
      id: uuidv4(),
      messageId: parsed.messageId || uuidv4(),
      accountEmail,
      from: getEmailString(parsed.from),
      to: getEmailArray(parsed.to),
      subject: parsed.subject || '(No Subject)',
      body: parsed.text || '',
      htmlBody: parsed.html ? parsed.html.toString() : undefined,
      date: parsed.date || new Date(),
      folder,
      attachments: (parsed.attachments || []).map((att) => ({
        filename: att.filename || 'unknown',
        contentType: att.contentType,
        size: att.size,
      })),
      headers: parsed.headers as any,
    };
  }

  async disconnectAll(): Promise<void> {
    // Clear all polling intervals
    this.checkIntervals.forEach((interval) => clearInterval(interval));
    this.checkIntervals.clear();
    
    // Disconnect all IMAP connections
    this.connections.forEach((imap) => imap.end());
    this.connections.clear();
  }
}