import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import User from '../models/User';

export async function protect(req) {
  try {
    // Get token from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Not authorized, no token' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return NextResponse.json(
        { message: 'Not authorized, user not found' },
        { status: 401 }
      );
    }

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { message: 'Not authorized, token failed' },
      { status: 401 }
    );
  }
}

export const admin = async (req) => {
  try {
    if (!req.user) {
      throw new Error('Not authorized, no user');
    }

    if (req.user.role !== 'admin') {
      throw new Error('Not authorized as admin');
    }

    return true;
  } catch (error) {
    throw new Error('Not authorized as admin');
  }
}; 