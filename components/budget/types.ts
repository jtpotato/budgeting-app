export type BudgetCategory = {
  id: string;
  name: string;
  amount: number;
};

export type TransactionDirection = "in" | "out";

export type BudgetTransaction = {
  id: string;
  direction: TransactionDirection;
  amount: number;
  description: string;
  categoryId?: string;
  categoryName?: string;
  createdAt: string;
};
