"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface BucketCardProps {
  id: string;
  name: string;
  balance: number;
  onDelete: (id: string) => Promise<boolean>;
}

export function BucketCard({
  id,
  name,
  balance,
  onDelete,
}: BucketCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-blue-600">${balance.toFixed(2)}</p>
      </CardContent>
    </Card>
  );
}