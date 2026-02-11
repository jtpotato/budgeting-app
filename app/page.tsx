"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DialogTrigger } from "@/components/ui/dialog";
import { useBudget } from "@/lib/hooks/useBudget";
import {
  AddDepositDialog,
  AddPaymentDialog,
  CreateBucketDialog,
  BucketsList,
  BudgetSummary,
} from "@/components/budget";
import { Plus, DollarSign, AlertCircle } from "lucide-react";

export default function Home() {
  const {
    buckets,
    totalBalance,
    unallocated,
    loading,
    error,
    createBucket,
    deleteBucket,
    updateBucketBalance,
    deposit,
    payment,
    clearError,
  } = useBudget();

  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
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

        <BudgetSummary totalBalance={totalBalance} unallocated={unallocated} />

        <div className="flex gap-2 flex-wrap">
          <AddDepositDialog
            open={depositDialogOpen}
            onOpenChange={setDepositDialogOpen}
            onDeposit={deposit}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Deposit
              </Button>
            </DialogTrigger>
          </AddDepositDialog>

          <AddPaymentDialog
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
            onPayment={payment}
            buckets={buckets}
          >
            <DialogTrigger asChild>
              <Button>
                <DollarSign className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
          </AddPaymentDialog>

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
            onUpdateBalance={updateBucketBalance}
          />
        </div>
      </div>
    </div>
  );
}
