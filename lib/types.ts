export interface Bucket {
  id: string;
  name: string;
  balance: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'payment';
  amount: number;
  bucketId?: string;
  bucketName?: string;
  timestamp: number;
  description?: string;
}

export interface AppState {
  totalBalance: number;
  buckets: Bucket[];
  transactions: Transaction[];
}
