import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    // 1. Establish DB Connection
    await dbConnect();

    // 2. Perform database operation (e.g. count users)
    const count = await User.countDocuments();

    // 3. Return successful connection status along with user count
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to MongoDB!',
      databaseConnected: true,
      totalUsers: count,
    });
  } catch (error) {
    console.error('Database connection or query failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Could not connect to MongoDB database.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, message: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Try to create/insert a new user
    const newUser = await User.create({
      name: body.name,
      email: body.email,
      role: body.role || 'user',
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully!',
      user: newUser,
    });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Database operation failed.',
      },
      { status: 500 }
    );
  }
}
