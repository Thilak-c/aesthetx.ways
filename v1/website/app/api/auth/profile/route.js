import { NextResponse } from 'next/server';
import { convexClient } from '@/lib/convex';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Fetch user profile from Convex
    const user = await convexClient.query('users:getProfileByEmail', {
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const address = user.address || {};

    // Map Convex schema (nested address, phoneNumber) to the flat properties expected by frontend
    return NextResponse.json({
      success: true,
      user: {
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        address: address.fullAddress || '',
        houseNo: address.flatNo || '',
        area: address.area || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pinCode || '',
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load profile' },
      { status: 500 }
    );
  }
}
