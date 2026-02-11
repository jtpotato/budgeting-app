import { NextRequest, NextResponse } from 'next/server';
import { getBucketById, updateBucket, deleteBucket } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bucket = getBucketById(id);
    
    if (!bucket) {
      return NextResponse.json({ error: 'Bucket not found' }, { status: 404 });
    }
    
    return NextResponse.json(bucket);
  } catch (error) {
    console.error('Error fetching bucket:', error);
    return NextResponse.json({ error: 'Failed to fetch bucket' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, balance } = body;

    const updates: { name?: string; balance?: number } = {};
    if (name !== undefined) updates.name = name;
    if (balance !== undefined) updates.balance = balance;

    const bucket = updateBucket(id, updates);
    
    if (!bucket) {
      return NextResponse.json({ error: 'Bucket not found' }, { status: 404 });
    }
    
    return NextResponse.json(bucket);
  } catch (error) {
    console.error('Error updating bucket:', error);
    return NextResponse.json({ error: 'Failed to update bucket' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = deleteBucket(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Bucket not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bucket:', error);
    return NextResponse.json({ error: 'Failed to delete bucket' }, { status: 500 });
  }
}
