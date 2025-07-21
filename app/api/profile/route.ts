import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('autodoc_ai');
    
    const user = await db.collection('users').findOne(
      { _id: new ObjectId((session.user as any).id) },
      { projection: { password: 0 } } // Exclude password
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, vehicleModel, vehicleYear, vehicleRegistration } = body;

    const client = await clientPromise;
    const db = client.db('autodoc_ai');
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (vehicleModel) updateData.vehicleModel = vehicleModel;
    if (vehicleYear) updateData.vehicleYear = parseInt(vehicleYear);
    if (vehicleRegistration) updateData.vehicleRegistration = vehicleRegistration.toUpperCase();

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId((session.user as any).id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Return updated user profile
    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId((session.user as any).id) },
      { projection: { password: 0 } }
    );

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}