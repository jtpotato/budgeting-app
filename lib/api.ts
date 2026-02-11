import { Bucket, Transaction } from './types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  buckets: {
    getAll: (): Promise<Bucket[]> => 
      fetch(`${API_BASE}/buckets`).then(res => handleResponse<Bucket[]>(res)),
    
    create: (name: string): Promise<Bucket> =>
      fetch(`${API_BASE}/buckets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }).then(res => handleResponse<Bucket>(res)),
    
    update: (id: string, updates: Partial<Bucket>): Promise<Bucket> =>
      fetch(`${API_BASE}/buckets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).then(res => handleResponse<Bucket>(res)),
    
    delete: (id: string): Promise<void> =>
      fetch(`${API_BASE}/buckets/${id}`, { method: 'DELETE' })
        .then(res => handleResponse<void>(res)),
  },

  transactions: {
    getAll: (): Promise<Transaction[]> =>
      fetch(`${API_BASE}/transactions`).then(res => handleResponse<Transaction[]>(res)),
  },

  freeMoney: {
    get: (): Promise<{ freeMoney: number }> =>
      fetch(`${API_BASE}/balance`).then(res => handleResponse<{ freeMoney: number }>(res)),

    addIncome: (amount: number, description?: string): Promise<{ success: boolean; transaction?: Transaction; error?: string }> =>
      fetch(`${API_BASE}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'income', amount, description }),
      }).then(res => handleResponse<{ success: boolean; transaction?: Transaction; error?: string }>(res)),

    allocate: (bucketId: string, amount: number, description?: string): Promise<{ success: boolean; transaction?: Transaction; error?: string }> =>
      fetch(`${API_BASE}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'allocate', bucketId, amount, description }),
      }).then(res => handleResponse<{ success: boolean; transaction?: Transaction; error?: string }>(res)),
  },

  expenses: {
    add: (bucketId: string, amount: number, description?: string): Promise<{ success: boolean; transaction?: Transaction; error?: string }> =>
      fetch(`${API_BASE}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'expense', bucketId, amount, description }),
      }).then(res => handleResponse<{ success: boolean; transaction?: Transaction; error?: string }>(res)),
  },

  transfers: {
    transfer: (fromBucketId: string, toBucketId: string, amount: number, description?: string): Promise<{ success: boolean; transaction?: Transaction; error?: string }> =>
      fetch(`${API_BASE}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'transfer', fromBucketId, toBucketId, amount, description }),
      }).then(res => handleResponse<{ success: boolean; transaction?: Transaction; error?: string }>(res)),
  },
};