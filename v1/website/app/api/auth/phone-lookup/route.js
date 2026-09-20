import { NextResponse } from 'next/server';
import { convexClient } from '@/lib/convex';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPhone = searchParams.get('phone');

    if (!rawPhone) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, message: 'Invalid 10-digit phone number' },
        { status: 400 }
      );
    }

    // Query Convex for user by phone
    const user = await convexClient.query('users:getUserByPhone', {
      phone: cleanPhone,
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        found: false,
        message: 'No previous profile found for this phone number',
      });
    }

    const address = user.address || {};

    return NextResponse.json({
      success: true,
      found: true,
      user: {
        id: user._id,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || cleanPhone,
        address: address.fullAddress || '',
        houseNo: address.flatNo || '',
        area: address.area || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pinCode || '',
      },
    });
  } catch (error) {
    console.error('Error in phone lookup:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to look up phone profile' },
      { status: 500 }
    );
  }
}
