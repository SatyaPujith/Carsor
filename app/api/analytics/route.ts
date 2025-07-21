import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only service providers can access analytics
    if ((session.user as any).userType !== 'service_provider') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db('autodoc_ai');
    
    // Get all issues for analytics
    const issues = await db.collection('issues')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Get user count
    const userCount = await db.collection('users')
      .countDocuments({ userType: 'vehicle_owner' });

    return NextResponse.json({
      issues,
      userCount,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}