import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('autodoc_ai');
    
    const providers = await db.collection('users')
      .find({ userType: 'service_provider' })
      .sort({ createdAt: -1 })
      .project({ password: 0 })
      .toArray();
    
    return NextResponse.json(providers);

  } catch (error) {
    console.error('Admin service providers fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, phone, companyName, serviceLocation, userType } = body;

    if (!name || !email || !password || !companyName || !serviceLocation) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('autodoc_ai');
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      userType: 'service_provider',
      companyName,
      serviceLocation,
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(userData);

    return NextResponse.json({ 
      message: 'Service provider created successfully',
      userId: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error('Service provider creation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}