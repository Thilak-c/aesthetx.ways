import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// This API is called from Vercel payment page to clear cart on the main VPS
export async function POST(request) {
  try {
    // Verify the request is from our Vercel deployment
    const authHeader = request.headers.get("x-api-key");
    if (authHeader !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    // Create Convex client
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    // Clear cart
    await client.mutation(api.cart.clearCart, { userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to clear cart" },
      { status: 500 }
    );
  }
}
