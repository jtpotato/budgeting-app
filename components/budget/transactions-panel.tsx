import { useMemo } from "react";

import { BudgetCategory, BudgetTransaction } from "@/components/budget/types";
import { cn } from "@/lib/utils";

type TransactionsPanelProps = {
  transactions: BudgetTransaction[];
  categories: BudgetCategory[];
  formatMoney: (value: number) => string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function TransactionsPanel({
  transactions,
  categories,
  formatMoney,
}: TransactionsPanelProps) {
  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [transactions],
  );

  if (sortedTransactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No transactions yet. Deposits and payments will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {sortedTransactions.map((transaction) => {
        const categoryName = transaction.categoryId
          ? (categoryNameById.get(transaction.categoryId) ??
            transaction.categoryName)
          : transaction.categoryName;

        return (
          <div
            key={transaction.id}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border p-3"
          >
            <span
              className={cn(
                "inline-flex min-w-11 justify-center rounded-full px-2 py-0.5 text-xs font-medium uppercase",
                transaction.direction === "in"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800",
              )}
            >
              {transaction.direction}
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {transaction.description}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {categoryName ? `Category: ${categoryName} · ` : ""}
                {dateFormatter.format(new Date(transaction.createdAt))}
              </p>
            </div>

            <p
              className={cn(
                "text-sm font-semibold",
                transaction.direction === "in"
                  ? "text-emerald-700"
                  : "text-amber-700",
              )}
            >
              {transaction.direction === "in" ? "+" : "-"}
              {formatMoney(transaction.amount)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
