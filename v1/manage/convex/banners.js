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

// Clean up existing banners in the database to remove hardcoded domains
export const cleanBanners = mutation({
  args: {},
  handler: async (ctx) => {
    const banners = await ctx.db.query("banners").collect();
    let updatedCount = 0;

    for (const banner of banners) {
      let needsUpdate = false;
      let newProductLink = banner.productLink;
      let newImageUrl = banner.imageUrl;

      if (banner.productLink && (banner.productLink.startsWith("https://aesthetxways.com") || banner.productLink.startsWith("http://aesthetxways.com"))) {
        newProductLink = banner.productLink.replace(/^https?:\/\/aesthetxways\.com/, "");
        needsUpdate = true;
      }
      if (banner.imageUrl && (banner.imageUrl.startsWith("https://aesthetxways.com") || banner.imageUrl.startsWith("http://aesthetxways.com"))) {
        newImageUrl = banner.imageUrl.replace(/^https?:\/\/aesthetxways\.com/, "");
        needsUpdate = true;
      }

      if (needsUpdate) {
        await ctx.db.patch(banner._id, {
          productLink: newProductLink,
          imageUrl: newImageUrl,
          updatedAt: nowIso(),
        });
        updatedCount++;
      }
    }

    return { success: true, updatedCount };
  },
});
