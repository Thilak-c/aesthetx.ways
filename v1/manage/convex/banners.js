import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const nowIso = () => new Date().toISOString();

// Fetch all banners
export const getBanners = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("banners").collect();
  },
});

// Update or insert a banner position
export const updateBanner = mutation({
  args: {
    position: v.string(), // "left", "right_top", "right_bottom"
    imageUrl: v.string(),
    productLink: v.string(),
  },
  handler: async (ctx, { position, imageUrl, productLink }) => {
    const existing = await ctx.db
      .query("banners")
      .withIndex("by_position", (q) => q.eq("position", position))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        imageUrl,
        productLink,
        updatedAt: nowIso(),
      });
    } else {
      await ctx.db.insert("banners", {
        position,
        imageUrl,
        productLink,
        updatedAt: nowIso(),
      });
    }
    return { success: true };
  },
});
