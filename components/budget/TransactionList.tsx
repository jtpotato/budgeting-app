"use client";

import { Transaction } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return '↓';
      case 'expense':
        return '↑';
      case 'transfer':
        return '⇄';
      case 'allocation':
        return '→';
      default:
        return '•';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600';
      case 'expense':
        return 'text-red-600';
      case 'transfer':
        return 'text-blue-600';
      case 'allocation':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionDescription = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'income':
        return transaction.bucketName 
          ? `Income to ${transaction.bucketName}`
          : 'Income added to free money';
      case 'allocation':
        return `Allocated to ${transaction.bucketName}`;
      case 'expense':
        return `Expense from ${transaction.bucketName}`;
      case 'transfer':
        return `Transfer from ${transaction.fromBucketName} to ${transaction.toBucketName}`;
      default:
        return transaction.description || '';
    }
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-secondary">No transactions yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                  {getTransactionIcon(transaction.type)}
                </span>
                <div>
                  <p className="font-medium">{getTransactionDescription(transaction)}</p>
                  {transaction.description && (
                    <p className="text-sm text-secondary">{transaction.description}</p>
                  )}
                  <p className="text-xs text-secondary">{formatDate(transaction.timestamp)}</p>
                </div>
              </div>
              <span className={`font-bold ${getTransactionColor(transaction.type)}`}>
                ${transaction.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}