# budgeting-app

A bucket/envelope based budgeting app, similar to Up or Actual.

## Tech Stack
- Next.js
- Shadcn/ui
- Bun
- SQLite (better-sqlite3)

## Features
- **Total Balance** - Sum of all bucket balances displayed at the top
- **Free Money Pool** - Income goes to a "free money" pool before allocation
- **Buckets** - Create and delete budget buckets. Each bucket has a monetary balance.
- **Add Income** - Log income to free money pool
- **Allocate** - Move money from free money pool to specific buckets
- **Add Expense** - Record expenses that withdraw from specific buckets
- **Transfer** - Move money between buckets
- **Transaction History** - List of all income, allocations, expenses, and transfers at the bottom of the page
- All transactions are stored on the server with SQLite

## Transaction Types
- **Income** - Adds money to free money pool (e.g., salary, gifts)
- **Allocation** - Moves money from free money pool to a specific bucket
- **Expense** - Removes money from a bucket (e.g., groceries, rent)
- **Transfer** - Moves money from one bucket to another

## How It Works

### Income Flow
1. User clicks "Add Income" and enters amount and description
2. Income is added to the "Free Money" pool
3. User can then allocate from free money to specific buckets (optional during income entry)

### Allocation Flow
1. User clicks "Allocate" button
2. Shows current free money balance
3. User can allocate fixed amounts to multiple buckets
4. Each allocation creates an allocation transaction

### Expense Flow
1. User clicks "Add Expense"
2. Selects which bucket to withdraw from
3. Enters amount and description
4. Expense is recorded and bucket balance is reduced

### Transfer Flow
1. User clicks "Transfer"
2. Selects source and destination buckets
3. Enters amount and description
4. Money is moved between buckets

## About this file
Living document. Update it when things change.