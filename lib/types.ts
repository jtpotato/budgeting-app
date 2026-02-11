export interface Bucket {
  id: string;
  name: string;
  balance: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer' | 'allocation';
  amount: number;
  bucketId?: string;
  bucketName?: string;
  fromBucketId?: string;
  fromBucketName?: string;
  toBucketId?: string;
  toBucketName?: string;
  timestamp: number;
  description?: string;
}

export interface AppState {
  buckets: Bucket[];
  transactions: Transaction[];
}
