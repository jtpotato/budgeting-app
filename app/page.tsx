"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DialogTrigger } from "@/components/ui/dialog";
import { useBudget } from "@/lib/hooks/useBudget";
import {
  AddIncomeDialog,
  AddExpenseDialog,
  AllocateFreeMoneyDialog,
  TransferDialog,
  CreateBucketDialog,
  BucketsList,
  TransactionList,
} from "@/components/budget";
import { Plus, DollarSign, AlertCircle, ArrowRightLeft, Wallet, ArrowUpRight } from "lucide-react";

export default function Home() {
  const {
    buckets,
    totalBalance,
    freeMoney,
    transactions,
    loading,
    error,
    createBucket,
    deleteBucket,
    addIncome,
    allocateFromFreeMoney,
    addExpense,
    transfer,
    clearError,
  } = useBudget();

  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [bucketDialogOpen, setBucketDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {error && (
          <Alert
            variant="destructive"
            className="cursor-pointer"
            onClick={clearError}
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="flex items-center gap-2 text-blue-700">
              <Wallet className="h-5 w-5" />
              <span className="font-semibold">Total Balance</span>
            </div>
            <p className="text-4xl font-bold text-blue-900">${totalBalance.toFixed(2)}</p>
          </div>
          
          <div className="flex flex-col gap-2 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="flex items-center gap-2 text-green-700">
              <DollarSign className="h-5 w-5" />
              <span className="font-semibold">Free Money</span>
            </div>
            <p className="text-4xl font-bold text-green-900">${freeMoney.toFixed(2)}</p>
            <p className="text-sm text-green-600">Available to allocate to buckets</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <AddIncomeDialog
            open={incomeDialogOpen}
            onOpenChange={setIncomeDialogOpen}
            onAddIncome={addIncome}
            onAllocate={allocateFromFreeMoney}
            freeMoney={freeMoney}
            buckets={buckets}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </DialogTrigger>
          </AddIncomeDialog>

          <AllocateFreeMoneyDialog
            open={allocateDialogOpen}
            onOpenChange={setAllocateDialogOpen}
            onAllocate={allocateFromFreeMoney}
            freeMoney={freeMoney}
            buckets={buckets}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Allocate
              </Button>
            </DialogTrigger>
          </AllocateFreeMoneyDialog>

          <AddExpenseDialog
            open={expenseDialogOpen}
            onOpenChange={setExpenseDialogOpen}
            onExpense={addExpense}
            buckets={buckets}
          >
            <DialogTrigger asChild>
              <Button variant="destructive">
                <DollarSign className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
          </AddExpenseDialog>

          <TransferDialog
            open={transferDialogOpen}
            onOpenChange={setTransferDialogOpen}
            onTransfer={transfer}
            buckets={buckets}
          >
            <DialogTrigger asChild>
              <Button variant="secondary">
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Transfer
              </Button>
            </DialogTrigger>
          </TransferDialog>

          <CreateBucketDialog
            open={bucketDialogOpen}
            onOpenChange={setBucketDialogOpen}
            onCreate={createBucket}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Bucket
              </Button>
            </DialogTrigger>
          </CreateBucketDialog>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Buckets</h2>
          <BucketsList
            buckets={buckets}
            onDelete={deleteBucket}
          />
        </div>

        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}