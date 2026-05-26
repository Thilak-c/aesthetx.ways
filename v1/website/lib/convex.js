import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error("Please define the NEXT_PUBLIC_CONVEX_URL environment variable inside .env.local");
}

export const convexClient = new ConvexHttpClient(convexUrl);
