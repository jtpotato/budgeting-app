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
import { useState, useEffect } from "react";
import { Bucket } from "@/lib/types";
import { Trash2 } from "lucide-react";

interface Allocation {
  bucketId: string;
  amount: number;
  isPercentage: boolean;
}

interface AddIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddIncome: (amount: number, description?: string) => Promise<boolean>;
  onAllocate: (bucketId: string, amount: number, description?: string) => Promise<boolean>;
  freeMoney: number;
  buckets: Bucket[];
  children: React.ReactNode;
}

export function AddIncomeDialog({
  open,
  onOpenChange,
  onAddIncome,
  onAllocate,
  freeMoney,
  buckets,
  children,
}: AddIncomeDialogProps) {
  const [step, setStep] = useState<"add" | "allocate">("add");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeDescription, setIncomeDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [newAllocationBucketId, setNewAllocationBucketId] = useState("");
  const [newAllocationValue, setNewAllocationValue] = useState("");
  const [newAllocationIsPercentage, setNewAllocationIsPercentage] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep("add");
      setIncomeAmount("");
      setIncomeDescription("");
      setAllocations([]);
      setNewAllocationBucketId("");
      setNewAllocationValue("");
      setNewAllocationIsPercentage(false);
    }
  }, [open]);

  const handleAddIncome = async () => {
    const parsedAmount = parseFloat(incomeAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsSubmitting(true);
    const success = await onAddIncome(parsedAmount, incomeDescription.trim() || undefined);
    setIsSubmitting(false);

    if (success) {
      setStep("allocate");
    }
  };

  const addAllocation = () => {
    const value = parseFloat(newAllocationValue);
    if (isNaN(value) || value <= 0 || !newAllocationBucketId) return;

    setAllocations([...allocations, {
      bucketId: newAllocationBucketId,
      amount: value,
      isPercentage: newAllocationIsPercentage,
    }]);
    setNewAllocationBucketId("");
    setNewAllocationValue("");
    setNewAllocationIsPercentage(false);
  };

  const removeAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const calculateTotalAllocation = () => {
    const income = parseFloat(incomeAmount) || 0;
    return allocations.reduce((total, alloc) => {
      if (alloc.isPercentage) {
        return total + (income * alloc.amount / 100);
      }
      return total + alloc.amount;
    }, 0);
  };

  const handleAllocateAll = async () => {
    const income = parseFloat(incomeAmount) || 0;
    
    setIsSubmitting(true);
    
    for (const alloc of allocations) {
      const amount = alloc.isPercentage ? (income * alloc.amount / 100) : alloc.amount;
      const bucketName = buckets.find(b => b.id === alloc.bucketId)?.name;
      await onAllocate(alloc.bucketId, amount, `Allocated from income: ${incomeDescription || 'Income'}`);
    }
    
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleSkipAllocation = () => {
    onOpenChange(false);
  };

  const getBucketName = (bucketId: string) => {
    return buckets.find(b => b.id === bucketId)?.name || "Unknown";
  };

  const getAllocationDisplay = (alloc: Allocation) => {
    const income = parseFloat(incomeAmount) || 0;
    if (alloc.isPercentage) {
      const actualAmount = income * alloc.amount / 100;
      return `${alloc.amount}% ($${actualAmount.toFixed(2)})`;
    }
    return `$${alloc.amount.toFixed(2)}`;
  };

  const totalAllocated = calculateTotalAllocation();
  const totalIncome = parseFloat(incomeAmount) || 0;
  const remainingFreeMoney = freeMoney + totalIncome - totalAllocated;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "add" ? "Add Income" : "Allocate Income"}
          </DialogTitle>
          <DialogDescription>
            {step === "add" 
              ? "Add income to your free money pool" 
              : "Allocate income to your buckets"
            }
          </DialogDescription>
        </DialogHeader>

        {step === "add" ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Current Free Money: <span className="font-bold">${freeMoney.toFixed(2)}</span>
              </p>
            </div>
            <div>
              <Label htmlFor="income-amount">Income Amount</Label>
              <Input
                id="income-amount"
                type="number"
                step="0.01"
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="income-description">Description (optional)</Label>
              <Input
                id="income-description"
                value={incomeDescription}
                onChange={(e) => setIncomeDescription(e.target.value)}
                placeholder="e.g., Salary, Gift, Freelance"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                Income Added: <span className="font-bold">${totalIncome.toFixed(2)}</span>
              </p>
              <p className="text-sm text-green-700">
                Total Free Money: <span className="font-bold">${(freeMoney + totalIncome).toFixed(2)}</span>
              </p>
              <p className="text-sm text-green-700">
                Allocated: <span className="font-bold">${totalAllocated.toFixed(2)}</span>
              </p>
              <p className="text-sm text-green-700">
                Remaining: <span className="font-bold">${remainingFreeMoney.toFixed(2)}</span>
              </p>
            </div>

            {allocations.length > 0 && (
              <div className="space-y-2">
                <Label>Current Allocations</Label>
                <div className="space-y-2">
                  {allocations.map((alloc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">{getBucketName(alloc.bucketId)}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{getAllocationDisplay(alloc)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAllocation(index)}
                          className="h-6 w-6 p-0 text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <Label>Add New Allocation</Label>
              <div className="grid grid-cols-12 gap-2 mt-2">
                <div className="col-span-5">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newAllocationBucketId}
                    onChange={(e) => setNewAllocationBucketId(e.target.value)}
                  >
                    <option value="">Select bucket</option>
                    {buckets
                      .filter(b => !allocations.some(a => a.bucketId === b.id))
                      .map((bucket) => (
                        <option key={bucket.id} value={bucket.id}>
                          {bucket.name} (${bucket.balance.toFixed(2)})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="col-span-4">
                  <Input
                    type="number"
                    step={newAllocationIsPercentage ? "1" : "0.01"}
                    value={newAllocationValue}
                    onChange={(e) => setNewAllocationValue(e.target.value)}
                    placeholder={newAllocationIsPercentage ? "50" : "100.00"}
                  />
                </div>
                <div className="col-span-3 flex items-center">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAllocationIsPercentage}
                      onChange={(e) => setNewAllocationIsPercentage(e.target.checked)}
                      className="rounded"
                    />
                    %
                  </label>
                </div>
              </div>
              <Button 
                onClick={addAllocation} 
                disabled={!newAllocationBucketId || !newAllocationValue}
                className="mt-2"
                variant="outline"
                size="sm"
              >
                Add Allocation
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          {step === "add" ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddIncome} disabled={isSubmitting || !incomeAmount}>
                {isSubmitting ? "Adding..." : "Add to Free Money"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleSkipAllocation}>
                Skip Allocation
              </Button>
              <Button 
                onClick={handleAllocateAll} 
                disabled={isSubmitting || allocations.length === 0}
              >
                {isSubmitting ? "Allocating..." : `Allocate $${totalAllocated.toFixed(2)}`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}