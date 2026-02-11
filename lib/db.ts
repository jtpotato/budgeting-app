import Database from 'better-sqlite3';
import { Bucket, Transaction } from './types';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'budget.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initDb();
  }
  return db;
}

function initDb() {
  if (!db) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS buckets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT CHECK(type IN ('deposit', 'payment')) NOT NULL,
      amount REAL NOT NULL,
      bucket_id TEXT,
      bucket_name TEXT,
      timestamp INTEGER NOT NULL,
      description TEXT,
      FOREIGN KEY (bucket_id) REFERENCES buckets(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS total_balance (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      amount REAL NOT NULL DEFAULT 0
    );

    INSERT OR IGNORE INTO total_balance (id, amount) VALUES (1, 0);
  `);
}

// Bucket operations
export function getAllBuckets(): Bucket[] {
  const stmt = getDb().prepare('SELECT id, name, balance FROM buckets');
  return stmt.all() as Bucket[];
}

export function getBucketById(id: string): Bucket | undefined {
  const stmt = getDb().prepare('SELECT id, name, balance FROM buckets WHERE id = ?');
  return stmt.get(id) as Bucket | undefined;
}

export function createBucket(id: string, name: string, balance: number = 0): Bucket {
  const stmt = getDb().prepare('INSERT INTO buckets (id, name, balance) VALUES (?, ?, ?)');
  stmt.run(id, name, balance);
  return { id, name, balance };
}

export function updateBucket(id: string, updates: Partial<Bucket>): Bucket | null {
  const bucket = getBucketById(id);
  if (!bucket) return null;

  const newName = updates.name ?? bucket.name;
  const newBalance = updates.balance ?? bucket.balance;

  const stmt = getDb().prepare('UPDATE buckets SET name = ?, balance = ? WHERE id = ?');
  stmt.run(newName, newBalance, id);

  return { id, name: newName, balance: newBalance };
}

export function deleteBucket(id: string): boolean {
  const stmt = getDb().prepare('DELETE FROM buckets WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// Transaction operations
export function getAllTransactions(): Transaction[] {
  const stmt = getDb().prepare(`
    SELECT 
      id, 
      type, 
      amount, 
      bucket_id as bucketId, 
      bucket_name as bucketName, 
      timestamp, 
      description 
    FROM transactions 
    ORDER BY timestamp DESC
  `);
  return stmt.all() as Transaction[];
}

export function createTransaction(transaction: Transaction): Transaction {
  const stmt = getDb().prepare(`
    INSERT INTO transactions (id, type, amount, bucket_id, bucket_name, timestamp, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    transaction.id,
    transaction.type,
    transaction.amount,
    transaction.bucketId || null,
    transaction.bucketName || null,
    transaction.timestamp,
    transaction.description || null
  );
  return transaction;
}

// Balance operations
export function getTotalBalance(): number {
  const stmt = getDb().prepare('SELECT amount FROM total_balance WHERE id = 1');
  const row = stmt.get() as { amount: number } | undefined;
  return row?.amount ?? 0;
}

export function updateTotalBalance(amount: number): void {
  const stmt = getDb().prepare('UPDATE total_balance SET amount = ? WHERE id = 1');
  stmt.run(amount);
}

// Business logic operations
export function processDeposit(amount: number, description?: string): { balance: number; transaction: Transaction } {
  const db = getDb();
  const currentBalance = getTotalBalance();
  const newBalance = currentBalance + amount;
  
  const transaction: Transaction = {
    id: crypto.randomUUID(),
    type: 'deposit',
    amount,
    timestamp: Date.now(),
    description,
  };

  const updateBalance = db.prepare('UPDATE total_balance SET amount = ? WHERE id = 1');
  const insertTransaction = db.prepare(`
    INSERT INTO transactions (id, type, amount, bucket_id, bucket_name, timestamp, description)
    VALUES (?, ?, ?, NULL, NULL, ?, ?)
  `);

  const updateBoth = db.transaction(() => {
    updateBalance.run(newBalance);
    insertTransaction.run(transaction.id, transaction.type, transaction.amount, transaction.timestamp, transaction.description || null);
  });

  updateBoth();

  return { balance: newBalance, transaction };
}

export function processPayment(bucketId: string, amount: number, description?: string): { 
  success: boolean; 
  balance?: number; 
  transaction?: Transaction; 
  error?: string;
} {
  const db = getDb();
  const bucket = getBucketById(bucketId);
  
  if (!bucket) {
    return { success: false, error: 'Bucket not found' };
  }

  if (bucket.balance < amount) {
    return { success: false, error: 'Insufficient funds in bucket' };
  }

  const currentTotalBalance = getTotalBalance();
  const newBucketBalance = bucket.balance - amount;
  const newTotalBalance = currentTotalBalance - amount;

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    type: 'payment',
    amount,
    bucketId,
    bucketName: bucket.name,
    timestamp: Date.now(),
    description,
  };

  const updateBucketStmt = db.prepare('UPDATE buckets SET balance = ? WHERE id = ?');
  const updateBalanceStmt = db.prepare('UPDATE total_balance SET amount = ? WHERE id = 1');
  const insertTransactionStmt = db.prepare(`
    INSERT INTO transactions (id, type, amount, bucket_id, bucket_name, timestamp, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const processAll = db.transaction(() => {
    updateBucketStmt.run(newBucketBalance, bucketId);
    updateBalanceStmt.run(newTotalBalance);
    insertTransactionStmt.run(
      transaction.id, 
      transaction.type, 
      transaction.amount, 
      transaction.bucketId, 
      transaction.bucketName, 
      transaction.timestamp, 
      transaction.description || null
    );
  });

  processAll();

  return { 
    success: true, 
    balance: newTotalBalance, 
    transaction 
  };
}
