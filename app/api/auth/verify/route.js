import { NextResponse } from 'next/server'
import { protect } from '@/middleware/auth'

export async function GET(req) {
  try {
    const user = await protect(req)
    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    })
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 401 }
    )
  }
} 