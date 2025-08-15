// convex/schema.js
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    buys: v.optional(v.float64()), // Will set default to 0 when inserting
    inCart: v.optional(v.float64()), // Will set default to 0 when inserting
    isHidden: v.optional(v.boolean()), // Will set default to false when inserting
    category: v.optional(v.string()),
    createdAt: v.optional(v.string()),
    description: v.optional(v.string()),
    mainImage: v.string(),
    otherImages: v.optional(v.array(v.string())),
    itemId: v.string(),
    name: v.string(),
    price: v.float64(),
    type: v.optional(v.string())
  })
});
