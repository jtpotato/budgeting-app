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
import { Trash2 } from "lucide-react";

interface Allocation {
  bucketId: string;
  amount: number;
}

interface AllocateFreeMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAllocate: (bucketId: string, amount: number, description?: string) => Promise<boolean>;
  freeMoney: number;
  buckets: Bucket[];
  children: React.ReactNode;
}

export function AllocateFreeMoneyDialog({
  open,
  onOpenChange,
  onAllocate,
  freeMoney,
  buckets,
  children,
}: AllocateFreeMoneyDialogProps) {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [newAllocationBucketId, setNewAllocationBucketId] = useState("");
  const [newAllocationAmount, setNewAllocationAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addAllocation = () => {
    const amount = parseFloat(newAllocationAmount);
    if (isNaN(amount) || amount <= 0 || !newAllocationBucketId) return;

    setAllocations([...allocations, {
      bucketId: newAllocationBucketId,
      amount: amount,
    }]);
    setNewAllocationBucketId("");
    setNewAllocationAmount("");
  };

  const removeAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const calculateTotalAllocation = () => {
    return allocations.reduce((total, alloc) => total + alloc.amount, 0);
  };

  const handleAllocateAll = async () => {
    if (allocations.length === 0) return;
    
    setIsSubmitting(true);
    
    for (const alloc of allocations) {
      const bucketName = buckets.find(b => b.id === alloc.bucketId)?.name;
      await onAllocate(alloc.bucketId, alloc.amount, `Allocated from free money`);
    }
    
    setIsSubmitting(false);
    setAllocations([]);
    onOpenChange(false);
  };

  const getBucketName = (bucketId: string) => {
    return buckets.find(b => b.id === bucketId)?.name || "Unknown";
  };

  const totalAllocated = calculateTotalAllocation();
  const remainingFreeMoney = freeMoney - totalAllocated;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Allocate Free Money</DialogTitle>
          <DialogDescription>
            Allocate money from your free money pool to buckets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              Available Free Money: <span className="font-bold">${freeMoney.toFixed(2)}</span>
            </p>
            <p className="text-sm text-green-700">
              Total to Allocate: <span className="font-bold">${totalAllocated.toFixed(2)}</span>
            </p>
            <p className="text-sm text-green-700">
              Remaining: <span className="font-bold">${remainingFreeMoney.toFixed(2)}</span>
            </p>
          </div>

          {allocations.length > 0 && (
            <div className="space-y-2">
              <Label>Allocations</Label>
              <div className="space-y-2">
                {allocations.map((alloc, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{getBucketName(alloc.bucketId)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">${alloc.amount.toFixed(2)}</span>
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
            <Label>Add Allocation</Label>
            <div className="grid grid-cols-12 gap-2 mt-2">
              <div className="col-span-7">
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
              <div className="col-span-5">
                <Input
                  type="number"
                  step="0.01"
                  value={newAllocationAmount}
                  onChange={(e) => setNewAllocationAmount(e.target.value)}
                  placeholder="Amount"
                />
              </div>
            </div>
            <Button 
              onClick={addAllocation} 
              disabled={!newAllocationBucketId || !newAllocationAmount || parseFloat(newAllocationAmount) <= 0}
              className="mt-2"
              variant="outline"
              size="sm"
            >
              Add Allocation
            </Button>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAllocateAll} 
            disabled={isSubmitting || allocations.length === 0 || totalAllocated > freeMoney}
          >
            {isSubmitting ? "Allocating..." : `Allocate $${totalAllocated.toFixed(2)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}