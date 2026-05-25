import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Contact from '@/models/Contact';

/* ---------- GET handler ---------- */
export async function GET(req) {
  try {
    await connectDB();
    const messages = await Contact.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ---------- POST handler ---------- */
export async function POST(req) {
  try {
    const { name, email, message } = await req.json();

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    if (typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'Message too short' }, { status: 400 });
    }

    await connectDB();
    await Contact.create({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    return NextResponse.json({ ok: true, message: 'Message received successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ---------- PATCH handler (mark as read) ---------- */
export async function PATCH(req) {
  try {
    const { id } = await req.json();
    await connectDB();
    const result = await Contact.findByIdAndUpdate(id, { read: true });
    if (!result) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ---------- DELETE handler ---------- */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await connectDB();
    const result = await Contact.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
