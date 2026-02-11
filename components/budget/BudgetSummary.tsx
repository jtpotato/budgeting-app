"use client";

interface BudgetSummaryProps {
  totalBalance: number;
  unallocated: number;
}

export function BudgetSummary({ totalBalance, unallocated }: BudgetSummaryProps) {
  return (
    <div className="flex gap-8">
      <div>
        <h2 className="text-secondary font-bold">Total Balance</h2>
        <p className="text-4xl font-bold">${totalBalance.toFixed(2)}</p>
      </div>
      <div>
        <h2 className="text-secondary font-bold">Unallocated Money</h2>
        <p className="text-4xl font-bold">${unallocated.toFixed(2)}</p>
      </div>
    </div>
  );
}
