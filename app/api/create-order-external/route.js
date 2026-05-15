import { NextResponse } from "next/server";
import { executeDataOperation } from "@/lib/dataOperations";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("x-api-key");
    if (authHeader !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, items, shippingDetails, paymentDetails, orderTotal, status } = body;

    if (!items || !shippingDetails || !paymentDetails || !orderTotal) {
      return NextResponse.json({ success: false, error: "Missing required order data" }, { status: 400 });
    }

    const orderNumber = `AX${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const result = await executeDataOperation({
      table: "orders",
      operation: "createOrder",
      args: { userId: userId || null, items, shippingDetails, paymentDetails, orderTotal, orderNumber, status: status || "confirmed" },
    });

    return NextResponse.json({ success: true, orderNumber: result.orderNumber, orderId: result.orderId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message || "Failed to create order" }, { status: 500 });
  }
}
