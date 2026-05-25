import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Convex is no longer used. Use /api/data instead." }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: "Convex is no longer used. Use /api/data instead." }, { status: 410 });
}
