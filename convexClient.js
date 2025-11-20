// convexClient.js (at project root)
"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "http://localhost:8000"
);

export { ConvexProvider, convex };
