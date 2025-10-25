import { IncomingWebhook } from '@slack/webhook';
import axios from 'axios';
import { config } from '../config';
import { Email } from '../types';

export class NotificationService {
  private slackWebhook: IncomingWebhook;

  constructor() {
    this.slackWebhook = new IncomingWebhook(config.slack.webhookUrl);
  }

  async sendSlackNotification(email: Email): Promise<void> {
    try {
      await this.slackWebhook.send({
        text: `🎯 New Interested Email!`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🎯 New Interested Email',
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*From:*\n${email.from}`,
              },
              {
                type: 'mrkdwn',
                text: `*Subject:*\n${email.subject}`,
              },
              {
                type: 'mrkdwn',
                text: `*Account:*\n${email.accountEmail}`,
              },
              {
                type: 'mrkdwn',
                text: `*Date:*\n${email.date.toLocaleString()}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Preview:*\n${email.body.substring(0, 200)}...`,
            },
          },
        ],
      });
      console.log('Slack notification sent');
    } catch (error) {
      console.error('Slack notification error:', error);
    }
  }

  async triggerWebhook(email: Email): Promise<void> {
    try {
      await axios.post(config.webhook.url, {
        event: 'email.interested',
        timestamp: new Date().toISOString(),
        data: {
          id: email.id,
          from: email.from,
          subject: email.subject,
          accountEmail: email.accountEmail,
          category: email.category,
          body: email.body.substring(0, 500),
        },
      });
      console.log('Webhook triggered');
    } catch (error) {
      console.error('Webhook error:', error);
    }
  }
}