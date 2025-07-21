import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('autodoc_ai');
    
    const result = await db.collection('issues').updateOne(
      { 
        _id: new ObjectId(params.id),
        userId: new ObjectId((session.user as any).id)
      },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Issue updated successfully' });

  } catch (error) {
    console.error('Issue update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}