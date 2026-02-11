"use client";

import { Bucket } from "@/lib/types";
import { BucketCard } from "./BucketCard";

interface BucketsListProps {
  buckets: Bucket[];
  onDelete: (id: string) => Promise<boolean>;
  onUpdateBalance: (id: string, balance: number) => Promise<boolean>;
}

export function BucketsList({
  buckets,
  onDelete,
  onUpdateBalance,
}: BucketsListProps) {
  if (buckets.length === 0) {
    return (
      <p className="text-secondary">
        No buckets yet. Create one to get started!
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {buckets.map((bucket) => (
        <BucketCard
          key={bucket.id}
          id={bucket.id}
          name={bucket.name}
          balance={bucket.balance}
          onDelete={onDelete}
          onUpdateBalance={onUpdateBalance}
        />
      ))}
    </div>
  );
}
