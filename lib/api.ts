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

  balance: {
    get: (): Promise<{ balance: number }> =>
      fetch(`${API_BASE}/balance`).then(res => handleResponse<{ balance: number }>(res)),
    
    deposit: (amount: number, description?: string): Promise<{ balance: number; transaction: Transaction }> =>
      fetch(`${API_BASE}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deposit', amount, description }),
      }).then(res => handleResponse<{ balance: number; transaction: Transaction }>(res)),
    
    payment: (bucketId: string, amount: number, description?: string): Promise<{ balance: number; transaction: Transaction }> =>
      fetch(`${API_BASE}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'payment', bucketId, amount, description }),
      }).then(res => handleResponse<{ balance: number; transaction: Transaction }>(res)),
  },

  transactions: {
    getAll: (): Promise<Transaction[]> =>
      fetch(`${API_BASE}/transactions`).then(res => handleResponse<Transaction[]>(res)),
  },
};
