import { useState, useEffect, useCallback } from 'react';
import { Bucket, Transaction } from '@/lib/types';
import { api } from '@/lib/api';

interface BudgetState {
  buckets: Bucket[];
  transactions: Transaction[];
  freeMoney: number;
  loading: boolean;
  error: string | null;
}

export function useBudget() {
  const [state, setState] = useState<BudgetState>({
    buckets: [],
    transactions: [],
    freeMoney: 0,
    loading: true,
    error: null,
  });

  const refreshData = useCallback(async () => {
    try {
      const [buckets, transactions, freeMoneyData] = await Promise.all([
        api.buckets.getAll(),
        api.transactions.getAll(),
        api.freeMoney.get(),
      ]);
      
      setState({
        buckets,
        transactions,
        freeMoney: freeMoneyData.freeMoney,
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

  const addIncome = useCallback(async (amount: number, description?: string): Promise<boolean> => {
    try {
      const result = await api.freeMoney.addIncome(amount, description);
      // Refresh to get updated free money and new transaction
      await refreshData();
      return result.success;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to add income',
      }));
      return false;
    }
  }, [refreshData]);

  const allocateFromFreeMoney = useCallback(async (bucketId: string, amount: number, description?: string): Promise<boolean> => {
    try {
      const result = await api.freeMoney.allocate(bucketId, amount, description);
      // Refresh to get updated free money, bucket balances and new transaction
      await refreshData();
      return result.success;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to allocate from free money',
      }));
      return false;
    }
  }, [refreshData]);

  const addExpense = useCallback(async (bucketId: string, amount: number, description?: string): Promise<boolean> => {
    try {
      const result = await api.expenses.add(bucketId, amount, description);
      // Refresh to get updated bucket balances and new transaction
      await refreshData();
      return result.success;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to add expense',
      }));
      return false;
    }
  }, [refreshData]);

  const transfer = useCallback(async (fromBucketId: string, toBucketId: string, amount: number, description?: string): Promise<boolean> => {
    try {
      const result = await api.transfers.transfer(fromBucketId, toBucketId, amount, description);
      // Refresh to get updated bucket balances and new transaction
      await refreshData();
      return result.success;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to transfer',
      }));
      return false;
    }
  }, [refreshData]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const totalBalance = state.buckets.reduce((sum, b) => sum + b.balance, 0);

  return {
    ...state,
    totalBalance,
    refreshData,
    createBucket,
    deleteBucket,
    addIncome,
    allocateFromFreeMoney,
    addExpense,
    transfer,
    clearError,
  };
}