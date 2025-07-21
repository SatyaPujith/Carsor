import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, userType, vehicleModel, vehicleYear, vehicleRegistration, companyName, serviceLocation } = body;

    // Validate required fields
    if (!name || !email || !password || !userType) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Validate vehicle owner specific fields
    if (userType === 'vehicle_owner' && (!vehicleModel || !vehicleYear || !vehicleRegistration)) {
      return NextResponse.json({ message: 'Vehicle details are required' }, { status: 400 });
    }

    // Validate service provider specific fields
    if (userType === 'service_provider' && (!companyName || !serviceLocation)) {
      return NextResponse.json({ message: 'Company details are required' }, { status: 400 });
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

    // Create user document
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      phone,
      userType,
      createdAt: new Date(),
    };

    // Add type-specific data
    if (userType === 'vehicle_owner') {
      userData.vehicleModel = vehicleModel;
      userData.vehicleYear = parseInt(vehicleYear);
      userData.vehicleRegistration = vehicleRegistration.toUpperCase();
    } else {
      userData.companyName = companyName;
      userData.serviceLocation = serviceLocation;
    }

    const result = await db.collection('users').insertOne(userData);

    return NextResponse.json({ 
      message: 'User created successfully',
      userId: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}