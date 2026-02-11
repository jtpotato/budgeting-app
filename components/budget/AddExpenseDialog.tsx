"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Bucket } from "@/lib/types";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpense: (bucketId: string, amount: number, description?: string) => Promise<boolean>;
  buckets: Bucket[];
  children: React.ReactNode;
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  onExpense,
  buckets,
  children,
}: AddExpenseDialogProps) {
  const [bucketId, setBucketId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !bucketId) return;

    setIsSubmitting(true);
    const success = await onExpense(bucketId, parsedAmount, description.trim() || undefined);
    setIsSubmitting(false);

    if (success) {
      setBucketId("");
      setAmount("");
      setDescription("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>Record an expense from a bucket</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="expense-bucket">Bucket</Label>
            <select
              id="expense-bucket"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={bucketId}
              onChange={(e) => setBucketId(e.target.value)}
            >
              <option value="">Select a bucket</option>
              {buckets.map((bucket) => (
                <option key={bucket.id} value={bucket.id}>
                  {bucket.name} (${bucket.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="expense-amount">Amount</Label>
            <Input
              id="expense-amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="expense-description">Description (optional)</Label>
            <Input
              id="expense-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Groceries, Rent"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Add Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}