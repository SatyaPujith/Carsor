import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('autodoc_ai');
    
    const users = await db.collection('users')
      .find({ userType: 'vehicle_owner' })
      .sort({ createdAt: -1 })
      .project({ password: 0 })
      .toArray();
    
    return NextResponse.json(users);

  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}