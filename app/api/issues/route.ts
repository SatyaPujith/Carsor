import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { description, category, severity, suggestedActions, possibleCauses, urgencyLevel, estimatedCost, vehicleModel, hasImage } = body;

    const client = await clientPromise;
    const db = client.db('autodoc_ai');
    
    const issueData = {
      userId: new ObjectId((session.user as any).id),
      description,
      category,
      severity,
      suggestedActions,
      possibleCauses: possibleCauses || [],
      urgencyLevel: urgencyLevel || 'Within 1 week',
      estimatedCost: estimatedCost || 'Contact service center',
      vehicleModel,
      hasImage: hasImage || false,
      status: 'open',
      createdAt: new Date(),
    };

    const result = await db.collection('issues').insertOne(issueData);
    
    return NextResponse.json({ 
      _id: result.insertedId,
      ...issueData 
    }, { status: 201 });

  } catch (error) {
    console.error('Issue creation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('autodoc_ai');
    
    // If service provider, return all issues for analytics
    if ((session.user as any).userType === 'service_provider') {
      const issues = await db.collection('issues')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      
      return NextResponse.json(issues);
    }
    
    // If vehicle owner, return only their issues
    const issues = await db.collection('issues')
      .find({ userId: new ObjectId((session.user as any).id) })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(issues);

  } catch (error) {
    console.error('Issues fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}