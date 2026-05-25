import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a new view record
export const addView = mutation({
  args: {
    productId: v.string(),
    userId: v.optional(v.id("users")),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
    viewedAt: v.string(),
    sessionId: v.optional(v.string()),
    viewType: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Create the view record
      const viewId = await ctx.db.insert("views", {
        productId: args.productId,
        userId: args.userId,
        ipAddress: args.ipAddress,
        userAgent: args.userAgent,
        referrer: args.referrer,
        viewedAt: args.viewedAt,
        sessionId: args.sessionId,
        viewType: args.viewType || "product_page",
        searchQuery: args.searchQuery,
        category: args.category,
        isDeleted: false,
      });



      return { success: true, viewId };
    } catch (error) {
      throw new Error("Failed to record view");
    }
  },
});

// Get views for a specific product
export const getProductViews = query({
  args: {
    productId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const views = await ctx.db
        .query("views")
        .withIndex("by_product", (q) => q.eq("productId", args.productId))
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .order("desc")
        .take(args.limit || 100);

      return views;
    } catch (error) {
      return [];
    }
  },
});

// Get view statistics for a product
export const getProductViewStats = query({
  args: {
    productId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const views = await ctx.db
        .query("views")
        .withIndex("by_product", (q) => q.eq("productId", args.productId))
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .collect();

      const totalViews = views.length;
      const uniqueUsers = new Set(views.map(v => v.userId).filter(Boolean)).size;
      const uniqueSessions = new Set(views.map(v => v.sessionId).filter(Boolean)).size;

      // Get views by view type
      const viewTypes = views.reduce((acc, view) => {
        const type = view.viewType || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Get views by category
      const categoryViews = views.reduce((acc, view) => {
        const category = view.category || "unknown";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      // Get recent views (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentViews = views.filter(view =>
        new Date(view.viewedAt) > sevenDaysAgo
      ).length;

      return {
        totalViews,
        uniqueUsers,
        uniqueSessions,
        recentViews,
        viewTypes,
        categoryViews,
      };
    } catch (error) {
      return {
        totalViews: 0,
        uniqueUsers: 0,
        uniqueSessions: 0,
        recentViews: 0,
        viewTypes: {},
        categoryViews: {},
      };
    }
  },
});

// Get most viewed products - SIMPLIFIED VERSION
export const getMostViewedProducts = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Just get products from the category - skip views for now
      let productsQuery = ctx.db
        .query("products")
        .filter((q) => q.neq(q.field("isDeleted"), true))
        .filter((q) => q.neq(q.field("isHidden"), true));

      if (args.category) {
        productsQuery = productsQuery.filter((q) => q.eq(q.field("category"), args.category));
      }

      const products = await productsQuery
        .order("desc")
        .take(args.limit || 8);

      // Return products with simple structure
      return products.map((product) => ({
        itemId: product.itemId,
        name: product.name,
        mainImage: product.mainImage,
        price: product.price,
        category: product.category,
        viewCount: product.buys || 0, // Use buys as proxy for popularity
        uniqueUsers: 0,
        uniqueSessions: 0,
      }));
    } catch (error) {
      console.error("getMostViewedProducts error:", error);
      return [];
    }
  },
});

// Get user's view history
export const getUserViewHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const views = await ctx.db
        .query("views")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .order("desc")
        .take(args.limit || 50);

      return views;
    } catch (error) {
      return [];
    }
  },
});

// Get views by category
export const getViewsByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const views = await ctx.db
        .query("views")
        .withIndex("by_category", (q) => q.eq("category", args.category))
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .order("desc")
        .take(args.limit || 100);

      return views;
    } catch (error) {
      return [];
    }
  },
});

// Soft delete a view (for data retention)
export const deleteView = mutation({
  args: {
    viewId: v.id("views"),
    deletedBy: v.id("users"),
    deletionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.db.patch(args.viewId, {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: args.deletedBy,
        deletionReason: args.deletionReason,
      });

      return { success: true };
    } catch (error) {
      throw new Error("Failed to delete view");
    }
  },
});

// Get view count for a specific product (lightweight)
export const getProductViewCount = query({
  args: {
    productId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const views = await ctx.db
        .query("views")
        .withIndex("by_product", (q) => q.eq("productId", args.productId))
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .collect();

      return {
        totalViews: views.length,
        uniqueUsers: new Set(views.map(v => v.userId).filter(Boolean)).size,
      };
    } catch (error) {
      return { totalViews: 0, uniqueUsers: 0 };
    }
  },
});
