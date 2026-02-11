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

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransfer: (fromBucketId: string, toBucketId: string, amount: number, description?: string) => Promise<boolean>;
  buckets: Bucket[];
  children: React.ReactNode;
}

export function TransferDialog({
  open,
  onOpenChange,
  onTransfer,
  buckets,
  children,
}: TransferDialogProps) {
  const [fromBucketId, setFromBucketId] = useState("");
  const [toBucketId, setToBucketId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !fromBucketId || !toBucketId) return;
    if (fromBucketId === toBucketId) return;

    setIsSubmitting(true);
    const success = await onTransfer(fromBucketId, toBucketId, parsedAmount, description.trim() || undefined);
    setIsSubmitting(false);

    if (success) {
      setFromBucketId("");
      setToBucketId("");
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
          <DialogTitle>Transfer</DialogTitle>
          <DialogDescription>Transfer money between buckets</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="from-bucket">From Bucket</Label>
            <select
              id="from-bucket"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={fromBucketId}
              onChange={(e) => setFromBucketId(e.target.value)}
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
            <Label htmlFor="to-bucket">To Bucket</Label>
            <select
              id="to-bucket"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={toBucketId}
              onChange={(e) => setToBucketId(e.target.value)}
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
            <Label htmlFor="transfer-amount">Amount</Label>
            <Input
              id="transfer-amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="transfer-description">Description (optional)</Label>
            <Input
              id="transfer-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Monthly savings"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}