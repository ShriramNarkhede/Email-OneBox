export interface EmailAccount {
  email: string;
  password: string;
  host: string;
  port: number;
}

export interface Email {
  id: string;
  messageId: string;
  accountEmail: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  date: Date;
  folder: string;
  category?: EmailCategory;
  attachments: Attachment[];
  headers: Record<string, any>;
}

export enum EmailCategory {
  INTERESTED = 'Interested',
  MEETING_BOOKED = 'Meeting Booked',
  NOT_INTERESTED = 'Not Interested',
  SPAM = 'Spam',
  OUT_OF_OFFICE = 'Out of Office',
  UNCATEGORIZED = 'Uncategorized',
}

export interface Attachment {
  filename: string;
  contentType: string;
  size: number;
}

export interface SearchQuery {
  query?: string;
  account?: string;
  folder?: string;
  category?: EmailCategory;
  from?: number;
  size?: number;
}

export interface SuggestedReply {
  emailId: string;
  suggestion: string;
  confidence: number;
}