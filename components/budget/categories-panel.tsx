import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

import { BudgetCategory } from "@/components/budget/types";

type CategoriesPanelProps = {
  balance: number;
  allocated: number;
  categories: BudgetCategory[];
  onUpdateCategoryName: (id: string, nextName: string) => void;
  onUpdateCategoryAmount: (id: string, nextValue: string) => void;
  onRemoveCategory: (id: string) => void;
};

const roundToCurrency = (value: number) => Math.round(value * 100) / 100;

export function CategoriesPanel({
  balance,
  allocated,
  categories,
  onUpdateCategoryName,
  onUpdateCategoryAmount,
  onRemoveCategory,
}: CategoriesPanelProps) {
  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground">No categories yet.</p>;
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => {
        const totalWithoutCurrent = roundToCurrency(
          allocated - category.amount,
        );
        const maxForCurrent = Math.max(
          0,
          roundToCurrency(balance - totalWithoutCurrent),
        );

        return (
          <div
            key={category.id}
            className="grid grid-cols-1 gap-2 rounded-md border p-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor={`name-${category.id}`}>Name</Label>
                <Input
                  id={`name-${category.id}`}
                  value={category.name}
                  onChange={(event) =>
                    onUpdateCategoryName(category.id, event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`amount-${category.id}`}>Amount</Label>
                <Input
                  id={`amount-${category.id}`}
                  type="number"
                  min={0}
                  max={maxForCurrent}
                  step="0.01"
                  value={category.amount.toString()}
                  onChange={(event) =>
                    onUpdateCategoryAmount(category.id, event.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Allocation</span>
                <span>
                  {balance > 0
                    ? `${Math.min(100, Math.round((category.amount / balance) * 100))}%`
                    : "0%"}
                </span>
              </div>
              <Progress
                value={
                  balance > 0
                    ? Math.min(
                        100,
                        Math.round((category.amount / balance) * 100),
                      )
                    : 0
                }
                className="h-2"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => onRemoveCategory(category.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
