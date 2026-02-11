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
      type TEXT CHECK(type IN ('income', 'expense', 'transfer', 'allocation')) NOT NULL,
      amount REAL NOT NULL,
      bucket_id TEXT,
      bucket_name TEXT,
      from_bucket_id TEXT,
      from_bucket_name TEXT,
      to_bucket_id TEXT,
      to_bucket_name TEXT,
      timestamp INTEGER NOT NULL,
      description TEXT,
      FOREIGN KEY (bucket_id) REFERENCES buckets(id) ON DELETE SET NULL,
      FOREIGN KEY (from_bucket_id) REFERENCES buckets(id) ON DELETE SET NULL,
      FOREIGN KEY (to_bucket_id) REFERENCES buckets(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS free_money (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      amount REAL NOT NULL DEFAULT 0
    );

    INSERT OR IGNORE INTO free_money (id, amount) VALUES (1, 0);
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
      from_bucket_id as fromBucketId, 
      from_bucket_name as fromBucketName, 
      to_bucket_id as toBucketId, 
      to_bucket_name as toBucketName, 
      timestamp, 
      description 
    FROM transactions 
    ORDER BY timestamp DESC
  `);
  return stmt.all() as Transaction[];
}

export function createTransaction(transaction: Transaction): Transaction {
  const stmt = getDb().prepare(`
    INSERT INTO transactions (id, type, amount, bucket_id, bucket_name, from_bucket_id, from_bucket_name, to_bucket_id, to_bucket_name, timestamp, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    transaction.id,
    transaction.type,
    transaction.amount,
    transaction.bucketId || null,
    transaction.bucketName || null,
    transaction.fromBucketId || null,
    transaction.fromBucketName || null,
    transaction.toBucketId || null,
    transaction.toBucketName || null,
    transaction.timestamp,
    transaction.description || null
  );
  return transaction;
}

// Free money operations
export function getFreeMoney(): number {
  const stmt = getDb().prepare('SELECT amount FROM free_money WHERE id = 1');
  const row = stmt.get() as { amount: number } | undefined;
  return row?.amount ?? 0;
}

export function updateFreeMoney(amount: number): void {
  const stmt = getDb().prepare('UPDATE free_money SET amount = ? WHERE id = 1');
  stmt.run(amount);
}

// Business logic operations
export function processIncomeToFreeMoney(amount: number, description?: string): { 
  success: boolean; 
  transaction?: Transaction; 
  error?: string;
} {
  const db = getDb();
  const currentFreeMoney = getFreeMoney();
  const newFreeMoney = currentFreeMoney + amount;

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    type: 'income',
    amount,
    timestamp: Date.now(),
    description,
  };

  const updateFreeMoneyStmt = db.prepare('UPDATE free_money SET amount = ? WHERE id = 1');
  const insertTransactionStmt = db.prepare(`
    INSERT INTO transactions (id, type, amount, bucket_id, bucket_name, timestamp, description)
    VALUES (?, ?, ?, NULL, NULL, ?, ?)
  `);

  const processAll = db.transaction(() => {
    updateFreeMoneyStmt.run(newFreeMoney);
    insertTransactionStmt.run(
      transaction.id, 
      transaction.type, 
      transaction.amount, 
      transaction.timestamp, 
      transaction.description || null
    );
  });

  processAll();

  return { 
    success: true, 
    transaction 
  };
}

export function allocateFromFreeMoney(bucketId: string, amount: number, description?: string): { 
  success: boolean; 
  transaction?: Transaction; 
  error?: string;
} {
  const db = getDb();
  const bucket = getBucketById(bucketId);
  
  if (!bucket) {
    return { success: false, error: 'Bucket not found' };
  }

  const currentFreeMoney = getFreeMoney();
  if (currentFreeMoney < amount) {
    return { success: false, error: 'Insufficient free money' };
  }

  const newFreeMoney = currentFreeMoney - amount;
  const newBucketBalance = bucket.balance + amount;

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    type: 'allocation',
    amount,
    bucketId,
    bucketName: bucket.name,
    timestamp: Date.now(),
    description,
  };

  const updateFreeMoneyStmt = db.prepare('UPDATE free_money SET amount = ? WHERE id = 1');
  const updateBucketStmt = db.prepare('UPDATE buckets SET balance = ? WHERE id = ?');
  const insertTransactionStmt = db.prepare(`
    INSERT INTO transactions (id, type, amount, bucket_id, bucket_name, timestamp, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const processAll = db.transaction(() => {
    updateFreeMoneyStmt.run(newFreeMoney);
    updateBucketStmt.run(newBucketBalance, bucketId);
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
    transaction 
  };
}

export function processExpense(bucketId: string, amount: number, description?: string): { 
  success: boolean; 
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

  const newBucketBalance = bucket.balance - amount;

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    type: 'expense',
    amount,
    bucketId,
    bucketName: bucket.name,
    timestamp: Date.now(),
    description,
  };

  const updateBucketStmt = db.prepare('UPDATE buckets SET balance = ? WHERE id = ?');
  const insertTransactionStmt = db.prepare(`
    INSERT INTO transactions (id, type, amount, bucket_id, bucket_name, timestamp, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const processAll = db.transaction(() => {
    updateBucketStmt.run(newBucketBalance, bucketId);
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
    transaction 
  };
}

export function processTransfer(fromBucketId: string, toBucketId: string, amount: number, description?: string): { 
  success: boolean; 
  transaction?: Transaction; 
  error?: string;
} {
  const db = getDb();
  const fromBucket = getBucketById(fromBucketId);
  const toBucket = getBucketById(toBucketId);
  
  if (!fromBucket) {
    return { success: false, error: 'Source bucket not found' };
  }
  
  if (!toBucket) {
    return { success: false, error: 'Destination bucket not found' };
  }

  if (fromBucket.balance < amount) {
    return { success: false, error: 'Insufficient funds in source bucket' };
  }

  const newFromBalance = fromBucket.balance - amount;
  const newToBalance = toBucket.balance + amount;

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    type: 'transfer',
    amount,
    fromBucketId,
    fromBucketName: fromBucket.name,
    toBucketId,
    toBucketName: toBucket.name,
    timestamp: Date.now(),
    description,
  };

  const updateFromStmt = db.prepare('UPDATE buckets SET balance = ? WHERE id = ?');
  const updateToStmt = db.prepare('UPDATE buckets SET balance = ? WHERE id = ?');
  const insertTransactionStmt = db.prepare(`
    INSERT INTO transactions (id, type, amount, from_bucket_id, from_bucket_name, to_bucket_id, to_bucket_name, timestamp, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const processAll = db.transaction(() => {
    updateFromStmt.run(newFromBalance, fromBucketId);
    updateToStmt.run(newToBalance, toBucketId);
    insertTransactionStmt.run(
      transaction.id, 
      transaction.type, 
      transaction.amount, 
      transaction.fromBucketId, 
      transaction.fromBucketName, 
      transaction.toBucketId, 
      transaction.toBucketName, 
      transaction.timestamp, 
      transaction.description || null
    );
  });

  processAll();

  return { 
    success: true, 
    transaction 
  };
}
