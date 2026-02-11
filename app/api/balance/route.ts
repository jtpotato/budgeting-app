import { NextRequest, NextResponse } from 'next/server';
import { processIncomeToFreeMoney, allocateFromFreeMoney, processExpense, processTransfer, getFreeMoney } from '@/lib/db';

export async function GET() {
  try {
    const freeMoney = getFreeMoney();
    return NextResponse.json({ freeMoney });
  } catch (error) {
    console.error('Error fetching free money:', error);
    return NextResponse.json({ error: 'Failed to fetch free money' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, bucketId, fromBucketId, toBucketId, description } = body;

    if (!action || !['income', 'expense', 'transfer', 'allocate'].includes(action)) {
      return NextResponse.json({ error: 'Valid action (income, expense, transfer, or allocate) is required' }, { status: 400 });
    }

    if (action === 'income') {
      if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json({ error: 'Valid positive amount is required' }, { status: 400 });
      }
      
      const result = processIncomeToFreeMoney(amount, description);
      
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      
      return NextResponse.json(result);
    } else if (action === 'allocate') {
      if (!bucketId) {
        return NextResponse.json({ error: 'bucketId is required for allocation' }, { status: 400 });
      }
      
      if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json({ error: 'Valid positive amount is required' }, { status: 400 });
      }
      
      const result = allocateFromFreeMoney(bucketId, amount, description);
      
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      
      return NextResponse.json(result);
    } else if (action === 'expense') {
      if (!bucketId) {
        return NextResponse.json({ error: 'bucketId is required for expense' }, { status: 400 });
      }
      
      if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json({ error: 'Valid positive amount is required' }, { status: 400 });
      }
      
      const result = processExpense(bucketId, amount, description);
      
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      
      return NextResponse.json(result);
    } else {
      // transfer
      if (!fromBucketId || !toBucketId) {
        return NextResponse.json({ error: 'fromBucketId and toBucketId are required for transfers' }, { status: 400 });
      }
      
      if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json({ error: 'Valid positive amount is required' }, { status: 400 });
      }
      
      const result = processTransfer(fromBucketId, toBucketId, amount, description);
      
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json({ error: 'Failed to process transaction' }, { status: 500 });
  }
}