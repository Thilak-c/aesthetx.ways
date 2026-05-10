import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// This API is called from Vercel payment page to create orders on the main VPS
export async function POST(request) {
  try {
    // Verify the request is from our Vercel deployment
    const authHeader = request.headers.get("x-api-key");
    if (authHeader !== process.env.INTERNAL_API_KEY) {
      console.error("Unauthorized request to create-order-external");
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Creating order from external request:", body.orderNumber || "new order");

    const {
      userId,
      items,
      shippingDetails,
      paymentDetails,
      orderTotal,
      status,
    } = body;

    // Validate required fields
    if (!items || !shippingDetails || !paymentDetails || !orderTotal) {
      return NextResponse.json(
        { success: false, error: "Missing required order data" },
        { status: 400 }
      );
    }

    // Create Convex client
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    // Generate order number
    const orderNumber = `AX${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // Create order directly in Convex
    const orderId = await client.mutation(api.orders.createOrder, {
      userId: userId || null,
      items,
      shippingDetails,
      paymentDetails,
      orderTotal,
      status: status || "confirmed",
    });

    console.log("Order created successfully:", orderNumber);

    return NextResponse.json({
      success: true,
      orderNumber: orderId?.orderNumber || orderNumber,
      orderId: orderId?._id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
