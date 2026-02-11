import { useState, useEffect, useCallback } from 'react';
import { Bucket } from '@/lib/types';
import { api } from '@/lib/api';

interface BudgetState {
  buckets: Bucket[];
  totalBalance: number;
  unallocated: number;
  loading: boolean;
  error: string | null;
}

export function useBudget() {
  const [state, setState] = useState<BudgetState>({
    buckets: [],
    totalBalance: 0,
    unallocated: 0,
    loading: true,
    error: null,
  });

  const calculateUnallocated = (buckets: Bucket[], total: number): number => {
    const allocated = buckets.reduce((sum, b) => sum + b.balance, 0);
    return total - allocated;
  };

  const refreshData = useCallback(async () => {
    try {
      const [buckets, balanceData] = await Promise.all([
        api.buckets.getAll(),
        api.balance.get(),
      ]);
      
      setState({
        buckets,
        totalBalance: balanceData.balance,
        unallocated: calculateUnallocated(buckets, balanceData.balance),
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load data',
      }));
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createBucket = useCallback(async (name: string): Promise<boolean> => {
    try {
      const newBucket = await api.buckets.create(name);
      setState(prev => ({
        ...prev,
        buckets: [...prev.buckets, newBucket],
        unallocated: calculateUnallocated([...prev.buckets, newBucket], prev.totalBalance),
      }));
      return true;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to create bucket',
      }));
      return false;
    }
  }, []);

  const deleteBucket = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.buckets.delete(id);
      const updatedBuckets = state.buckets.filter(b => b.id !== id);
      setState(prev => ({
        ...prev,
        buckets: updatedBuckets,
        unallocated: calculateUnallocated(updatedBuckets, prev.totalBalance),
      }));
      return true;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to delete bucket',
      }));
      return false;
    }
  }, [state.buckets]);

  const updateBucketBalance = useCallback(async (id: string, balance: number): Promise<boolean> => {
    try {
      const updated = await api.buckets.update(id, { balance });
      const updatedBuckets = state.buckets.map(b => b.id === id ? updated : b);
      setState(prev => ({
        ...prev,
        buckets: updatedBuckets,
        unallocated: calculateUnallocated(updatedBuckets, prev.totalBalance),
      }));
      return true;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to update bucket',
      }));
      return false;
    }
  }, [state.buckets]);

  const deposit = useCallback(async (amount: number, description?: string): Promise<boolean> => {
    try {
      const result = await api.balance.deposit(amount, description);
      setState(prev => ({
        ...prev,
        totalBalance: result.balance,
        unallocated: calculateUnallocated(prev.buckets, result.balance),
      }));
      return true;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to add deposit',
      }));
      return false;
    }
  }, []);

  const payment = useCallback(async (bucketId: string, amount: number, description?: string): Promise<boolean> => {
    try {
      await api.balance.payment(bucketId, amount, description);
      // Refresh all data to get updated bucket balances
      await refreshData();
      return true;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to process payment',
      }));
      return false;
    }
  }, [refreshData]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    refreshData,
    createBucket,
    deleteBucket,
    updateBucketBalance,
    deposit,
    payment,
    clearError,
  };
}
