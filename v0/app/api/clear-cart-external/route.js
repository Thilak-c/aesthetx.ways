import { NextResponse } from "next/server";
import { executeDataOperation } from "@/lib/dataOperations";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("x-api-key");
    if (authHeader !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    await executeDataOperation({ table: "cart", operation: "clearCart", args: { userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message || "Failed to clear cart" }, { status: 500 });
  }
}
