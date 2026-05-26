import { NextResponse } from 'next/server';
import { convexClient } from '@/lib/convex';

export async function POST(request) {
  try {
    const { email, updates } = await request.json();

    if (!email || !updates) {
      return NextResponse.json(
        { success: false, message: 'Email and updates are required' },
        { status: 400 }
      );
    }

    const emailTrimmed = email.toLowerCase().trim();

    // Call Convex mutation to save the dynamic autosave profile fields
    await convexClient.mutation('users:updateProfileByEmail', {
      email: emailTrimmed,
      updates,
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
