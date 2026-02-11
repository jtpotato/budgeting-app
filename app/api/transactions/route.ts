import { NextRequest, NextResponse } from 'next/server';
import { getAllTransactions, createTransaction } from '@/lib/db';

export async function GET() {
  try {
    const transactions = getAllTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, amount, bucketId, bucketName, description } = body;

    if (!type || !['deposit', 'payment'].includes(type)) {
      return NextResponse.json({ error: 'Valid type (deposit or payment) is required' }, { status: 400 });
    }

    if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Valid positive amount is required' }, { status: 400 });
    }

    const transaction = createTransaction({
      id: crypto.randomUUID(),
      type,
      amount,
      bucketId,
      bucketName,
      timestamp: Date.now(),
      description,
    });
    
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
