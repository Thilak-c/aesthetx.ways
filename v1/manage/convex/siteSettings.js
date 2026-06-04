import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const nowIso = () => new Date().toISOString();

// Get the current site status
export const getSiteStatus = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "siteStatus"))
      .first();

    if (!setting) {
      return { status: "open", message: "", updatedAt: null };
    }

    return {
      status: setting.value,
      message: setting.message || "",
      updatedAt: setting.updatedAt,
    };
  },
});

// Set the site status (open / closed / maintenance)
export const setSiteStatus = mutation({
  args: {
    status: v.string(), // "open", "closed", "maintenance"
    message: v.optional(v.string()),
  },
  handler: async (ctx, { status, message }) => {
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "siteStatus"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: status,
        message: message || "",
        updatedAt: nowIso(),
      });
    } else {
      await ctx.db.insert("siteSettings", {
        key: "siteStatus",
        value: status,
        message: message || "",
        updatedAt: nowIso(),
      });
    }

    return { success: true, status };
  },
});
