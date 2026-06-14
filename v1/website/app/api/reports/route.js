import { NextResponse } from 'next/server';
import { convexClient } from '@/lib/convex';

export async function POST(request) {
  try {
    const { userId, message, fileUrl } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Message content is required' },
        { status: 400 }
      );
    }

    const result = await convexClient.mutation('reports:submitReport', {
      userId: userId || 'visitor',
      message: message,
      fileUrl: fileUrl || '',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error submitting report to Convex:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit report. Please try again.' },
      { status: 500 }
    );
  }
}
