import { NextRequest, NextResponse } from 'next/server';
import { getAllBuckets, createBucket } from '@/lib/db';

export async function GET() {
  try {
    const buckets = getAllBuckets();
    return NextResponse.json(buckets);
  } catch (error) {
    console.error('Error fetching buckets:', error);
    return NextResponse.json({ error: 'Failed to fetch buckets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, balance = 0 } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const bucket = createBucket(id, name, balance);
    
    return NextResponse.json(bucket, { status: 201 });
  } catch (error) {
    console.error('Error creating bucket:', error);
    return NextResponse.json({ error: 'Failed to create bucket' }, { status: 500 });
  }
}
