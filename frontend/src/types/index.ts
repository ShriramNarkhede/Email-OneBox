export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  accountEmail: string;
  folder: string;
  category?: string;
}

export interface Stats {
  total: number;
  byCategory: Record<string, number>;
  byAccount: Record<string, number>;
}