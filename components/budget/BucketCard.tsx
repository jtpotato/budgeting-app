"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface BucketCardProps {
  id: string;
  name: string;
  balance: number;
  onDelete: (id: string) => Promise<boolean>;
  onUpdateBalance: (id: string, balance: number) => Promise<boolean>;
}

export function BucketCard({
  id,
  name,
  balance,
  onDelete,
  onUpdateBalance,
}: BucketCardProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSet = async () => {
    const value = parseFloat(inputValue);
    if (!isNaN(value) && value >= 0) {
      const success = await onUpdateBalance(id, value);
      if (success) {
        setInputValue("");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSet();
    }
  };

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
      <CardContent className="space-y-2">
        <p className="text-2xl font-bold text-blue-600">${balance.toFixed(2)}</p>
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.01"
            placeholder="Set amount"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button size="sm" onClick={handleSet}>
            Set
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
