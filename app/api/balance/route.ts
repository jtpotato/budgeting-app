import { NextRequest, NextResponse } from 'next/server';
import { getTotalBalance, processDeposit, processPayment } from '@/lib/db';

export async function GET() {
  try {
    const balance = getTotalBalance();
    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, bucketId, description } = body;

    if (!action || !['deposit', 'payment'].includes(action)) {
      return NextResponse.json({ error: 'Valid action (deposit or payment) is required' }, { status: 400 });
    }

    if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Valid positive amount is required' }, { status: 400 });
    }

    if (action === 'deposit') {
      const result = processDeposit(amount, description);
      return NextResponse.json(result);
    } else {
      if (!bucketId) {
        return NextResponse.json({ error: 'bucketId is required for payments' }, { status: 400 });
      }
      
      const result = processPayment(bucketId, amount, description);
      
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
