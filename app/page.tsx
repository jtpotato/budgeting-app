"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type BudgetCategory = {
  id: string;
  name: string;
  amount: number;
};

type PersistedBudget = {
  balance: number;
  categories: BudgetCategory[];
};

const STORAGE_KEY = "bucket-budgeting-state-v1";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const roundToCurrency = (value: number) => Math.round(value * 100) / 100;

const parseMoneyInput = (value: string) => {
  const parsed = Number.parseFloat(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return roundToCurrency(parsed);
};

const formatMoney = (value: number) => currencyFormatter.format(value);

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryAmount, setNewCategoryAmount] = useState("0");
  const [formError, setFormError] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("0");
  const [depositError, setDepositError] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("0");
  const [paymentCategoryId, setPaymentCategoryId] = useState("");
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);

      if (!savedState) {
        return;
      }

      const parsedState = JSON.parse(savedState) as Partial<PersistedBudget>;

      if (
        typeof parsedState.balance === "number" &&
        Number.isFinite(parsedState.balance)
      ) {
        setBalance(Math.max(0, roundToCurrency(parsedState.balance)));
      }

      if (Array.isArray(parsedState.categories)) {
        const sanitizedCategories = parsedState.categories
          .filter(
            (category): category is BudgetCategory =>
              Boolean(category) &&
              typeof category.id === "string" &&
              typeof category.name === "string" &&
              typeof category.amount === "number" &&
              Number.isFinite(category.amount),
          )
          .map((category) => ({
            id: category.id,
            name: category.name,
            amount: Math.max(0, roundToCurrency(category.amount)),
          }));

        setCategories(sanitizedCategories);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const stateToPersist: PersistedBudget = {
      balance,
      categories,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist));
  }, [balance, categories, isHydrated]);

  const allocated = useMemo(
    () =>
      roundToCurrency(
        categories.reduce((sum, category) => sum + category.amount, 0),
      ),
    [categories],
  );

  const remaining = roundToCurrency(balance - allocated);

  const addCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = newCategoryName.trim();
    const amount = parseMoneyInput(newCategoryAmount);

    if (!trimmedName) {
      setFormError("Category name is required.");
      return;
    }

    if (amount > Math.max(0, remaining)) {
      setFormError("That amount is more than your remaining balance.");
      return;
    }

    const categoryId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    setCategories((current) => [
      ...current,
      {
        id: categoryId,
        name: trimmedName,
        amount,
      },
    ]);

    setNewCategoryName("");
    setNewCategoryAmount("0");
    setFormError("");
    setIsAddDialogOpen(false);
  };

  const removeCategory = (id: string) => {
    setCategories((current) =>
      current.filter((category) => category.id !== id),
    );
  };

  const handleDeposit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const amount = parseMoneyInput(depositAmount);

    if (amount <= 0) {
      setDepositError("Deposit amount must be more than $0.00.");
      return;
    }

    setBalance((current) => roundToCurrency(current + amount));
    setDepositAmount("0");
    setDepositError("");
    setIsDepositDialogOpen(false);
  };

  const handlePayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const amount = parseMoneyInput(paymentAmount);

    if (amount <= 0) {
      setPaymentError("Payment amount must be more than $0.00.");
      return;
    }

    if (amount > balance) {
      setPaymentError("Payment amount cannot exceed your current balance.");
      return;
    }

    if (paymentCategoryId) {
      const selectedCategory = categories.find(
        (category) => category.id === paymentCategoryId,
      );

      if (!selectedCategory) {
        setPaymentError("Selected category was not found.");
        return;
      }

      if (amount > selectedCategory.amount) {
        setPaymentError(
          `Payment amount exceeds ${selectedCategory.name}'s available amount.`,
        );
        return;
      }

      setCategories((current) =>
        current.map((category) =>
          category.id === paymentCategoryId
            ? {
                ...category,
                amount: roundToCurrency(Math.max(0, category.amount - amount)),
              }
            : category,
        ),
      );
    }

    setBalance((current) => roundToCurrency(Math.max(0, current - amount)));
    setPaymentAmount("0");
    setPaymentCategoryId("");
    setPaymentError("");
    setIsPaymentDialogOpen(false);
  };

  const updateCategoryAmount = (id: string, nextValue: string) => {
    setCategories((current) => {
      const totalWithoutCategory = roundToCurrency(
        current.reduce(
          (sum, category) => sum + (category.id === id ? 0 : category.amount),
          0,
        ),
      );

      const maxAllowedForCategory = Math.max(
        0,
        roundToCurrency(balance - totalWithoutCategory),
      );
      const parsedAmount = parseMoneyInput(nextValue);
      const boundedAmount = Math.min(parsedAmount, maxAllowedForCategory);

      return current.map((category) =>
        category.id === id ? { ...category, amount: boundedAmount } : category,
      );
    });
  };

  const updateCategoryName = (id: string, nextName: string) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === id ? { ...category, name: nextName } : category,
      ),
    );
  };

  const newCategoryAmountValue = parseMoneyInput(newCategoryAmount);
  const newCategoryPercentOfBalance =
    balance > 0
      ? Math.min(100, Math.round((newCategoryAmountValue / balance) * 100))
      : 0;

  const addCategoryForm = (
    <form
      className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px_auto]"
      onSubmit={addCategory}
    >
      <div className="space-y-2">
        <Label htmlFor="category-name">Category Name</Label>
        <Input
          id="category-name"
          placeholder="Groceries"
          value={newCategoryName}
          onChange={(event) => {
            setNewCategoryName(event.target.value);
            setFormError("");
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category-amount">Amount</Label>
        <Input
          id="category-amount"
          type="number"
          min={0}
          step="0.01"
          value={newCategoryAmount}
          onChange={(event) => {
            setNewCategoryAmount(event.target.value);
            setFormError("");
          }}
        />
      </div>
      <div className="flex items-end">
        <Button type="submit" className="w-full sm:w-auto">
          Add
        </Button>
      </div>

      <div className="sm:col-span-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>New category allocation</span>
          <span>{newCategoryPercentOfBalance}% of balance</span>
        </div>
        <Progress value={newCategoryPercentOfBalance} className="h-2" />
      </div>

      {formError ? (
        <p className="sm:col-span-3 text-sm text-destructive">{formError}</p>
      ) : null}
    </form>
  );

  const depositForm = (
    <form className="space-y-4" onSubmit={handleDeposit}>
      <div className="space-y-2">
        <Label htmlFor="deposit-amount">Deposit Amount</Label>
        <Input
          id="deposit-amount"
          type="number"
          min={0}
          step="0.01"
          value={depositAmount}
          onChange={(event) => {
            setDepositAmount(event.target.value);
            setDepositError("");
          }}
        />
      </div>

      {depositError ? (
        <p className="text-sm text-destructive">{depositError}</p>
      ) : null}

      <Button type="submit" className="w-full sm:w-auto">
        Save Deposit
      </Button>
    </form>
  );

  const paymentForm = (
    <form className="space-y-4" onSubmit={handlePayment}>
      <div className="space-y-2">
        <Label htmlFor="payment-amount">Payment Amount</Label>
        <Input
          id="payment-amount"
          type="number"
          min={0}
          step="0.01"
          value={paymentAmount}
          onChange={(event) => {
            setPaymentAmount(event.target.value);
            setPaymentError("");
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment-category">Category (Optional)</Label>
        <select
          id="payment-category"
          value={paymentCategoryId}
          onChange={(event) => {
            setPaymentCategoryId(event.target.value);
            setPaymentError("");
          }}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} ({formatMoney(category.amount)})
            </option>
          ))}
        </select>
      </div>

      {paymentError ? (
        <p className="text-sm text-destructive">{paymentError}</p>
      ) : null}

      <Button type="submit" className="w-full sm:w-auto">
        Save Payment
      </Button>
    </form>
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-3 pb-8 sm:gap-6 sm:p-6">
      <Card>
        <CardHeader className="">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl">Bucket Budgeting</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Balance, allocation, and remaining.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Dialog
                open={isDepositDialogOpen}
                onOpenChange={(open) => {
                  setIsDepositDialogOpen(open);

                  if (!open) {
                    setDepositAmount("0");
                    setDepositError("");
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button size="sm" variant="secondary">
                    Deposit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deposit</DialogTitle>
                    <DialogDescription>
                      Add money into your overall balance.
                    </DialogDescription>
                  </DialogHeader>
                  {depositForm}
                </DialogContent>
              </Dialog>

              <Dialog
                open={isPaymentDialogOpen}
                onOpenChange={(open) => {
                  setIsPaymentDialogOpen(open);

                  if (!open) {
                    setPaymentAmount("0");
                    setPaymentCategoryId("");
                    setPaymentError("");
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Payment</DialogTitle>
                    <DialogDescription>
                      Remove money from the balance and optionally a category.
                    </DialogDescription>
                  </DialogHeader>
                  {paymentForm}
                </DialogContent>
              </Dialog>

              <Dialog
                open={isAddDialogOpen}
                onOpenChange={(open) => {
                  setIsAddDialogOpen(open);

                  if (!open) {
                    setFormError("");
                    setNewCategoryName("");
                    setNewCategoryAmount("0");
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button size="sm">Add Category</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Category</DialogTitle>
                    <DialogDescription>
                      Assign part of your remaining balance.
                    </DialogDescription>
                  </DialogHeader>
                  {addCategoryForm}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="space-y-1.5">
            <Label htmlFor="balance">Current Balance</Label>
            <Input
              id="balance"
              type="text"
              readOnly
              value={formatMoney(balance)}
            />
            <p className="text-xs text-muted-foreground">
              Use Deposit and Payment to update the overall balance.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs sm:gap-3 sm:text-sm">
            <div className="rounded-md border p-2 sm:p-3">
              <p className="text-muted-foreground">Balance</p>
              <p className="text-sm font-semibold sm:text-lg">
                {formatMoney(balance)}
              </p>
            </div>
            <div className="rounded-md border p-2 sm:p-3">
              <p className="text-muted-foreground">Allocated</p>
              <p className="text-sm font-semibold sm:text-lg">
                {formatMoney(allocated)}
              </p>
            </div>
            <div className="rounded-md border p-2 sm:p-3">
              <p className="text-muted-foreground">Remaining</p>
              <p
                className={cn(
                  "text-sm font-semibold sm:text-lg",
                  remaining < 0 ? "text-destructive" : "text-foreground",
                )}
              >
                {formatMoney(remaining)}
              </p>
            </div>
          </div>

          {remaining < 0 ? (
            <p className="text-sm text-destructive">
              You are over budget by {formatMoney(Math.abs(remaining))}.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Edit names and amounts. Category amounts are capped to avoid
            over-allocation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          ) : (
            categories.map((category) => {
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
                          updateCategoryName(category.id, event.target.value)
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
                          updateCategoryAmount(category.id, event.target.value)
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
                      onClick={() => removeCategory(category.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </main>
  );
}
