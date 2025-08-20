import { api } from "@/convex/_generated/api";
import { fetchQuery, fetchMutation } from "convex/nextjs"; // Import fetchQuery and fetchMutation
import { NextResponse } from "next/server";

// Handle GET requests (e.g., fetching user data)
export async function GET(request) {
  try {
    // Extract query parameters if needed
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required for GET requests" }, { status: 400 });
    }

    // Example: Fetch user profile data
    const userProfile = await fetchQuery(api.users.getUserById, { userId: userId });
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error in GET /api/convex:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// Handle POST requests (e.g., updating user data)
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required for POST requests" }, { status: 400 });
    }

    // Example: Update user profile. Assuming updateUserProfile exists and takes userId and updateData.
    // You might need to adjust the specific mutation and its arguments based on your Convex backend.
    const result = await fetchMutation(api.users.updateUserProfile, { userId: userId, ...updateData });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/convex:", error);
    return NextResponse.json({ error: "Failed to update data" }, { status: 500 });
  }
} 