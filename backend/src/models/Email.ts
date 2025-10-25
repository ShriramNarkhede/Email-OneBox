// backend/src/models/Email.ts
export interface EmailAddress {
  name?: string;
  email: string;
}

export interface Email {
  id?: string;
  messageId: string;
  accountId: string;
  folder: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  subject: string;
  body: string;
  html?: string;
  date: Date;
  category?: 'Interested' | 'Meeting Booked' | 'Not Interested' | 'Spam' | 'Out of Office' | 'Uncategorized';
  hasAttachments: boolean;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImapAccount {
  id: string;
  email: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
}