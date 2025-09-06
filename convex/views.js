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

      console.log(`View recorded for product ${args.productId}`, {
        viewId,
        userId: args.userId,
        sessionId: args.sessionId,
        viewType: args.viewType
      });

      return { success: true, viewId };
    } catch (error) {
      console.error("Error adding view:", error);
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
      console.error("Error fetching product views:", error);
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
      console.error("Error fetching view stats:", error);
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

// Get most viewed products with better debugging
export const getMostViewedProducts = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      console.log('getMostViewedProducts called with:', args);
      
      // First try to get products based on views
      let viewsQuery = ctx.db
        .query("views")
        .filter((q) => q.eq(q.field("isDeleted"), false));

      if (args.category) {
        viewsQuery = viewsQuery.filter((q) => q.eq(q.field("category"), args.category));
      }

      const views = await viewsQuery.collect();
      console.log('Found views:', views.length);

      if (views.length > 0) {
        // Group by productId and count views
        const productViewCounts = views.reduce((acc, view) => {
          const productId = view.productId;
          if (!acc[productId]) {
            acc[productId] = {
              productId,
              viewCount: 0,
              uniqueUsers: new Set(),
              uniqueSessions: new Set(),
            };
          }
          acc[productId].viewCount++;
          if (view.userId) acc[productId].uniqueUsers.add(view.userId);
          if (view.sessionId) acc[productId].uniqueSessions.add(view.sessionId);
          return acc;
        }, {});

        console.log('Product view counts:', Object.keys(productViewCounts));

        // Convert to array and sort by view count
        const sortedProducts = Object.values(productViewCounts)
          .map(item => ({
            ...item,
            uniqueUsers: item.uniqueUsers.size,
            uniqueSessions: item.uniqueSessions.size,
          }))
          .sort((a, b) => b.viewCount - a.viewCount)
          .slice(0, args.limit || 6);

        console.log('Sorted products:', sortedProducts.length);

        // Fetch product details for each trending product
        const productsWithDetails = [];
        
        for (const item of sortedProducts) {
          console.log(`Looking for product with itemId: ${item.productId}`);
          
          try {
            // Try to find by itemId first
            let product = await ctx.db
              .query("products")
              .filter((q) => q.eq(q.field("itemId"), item.productId))
              .filter((q) => q.neq(q.field("isDeleted"), true))
              .first();

            console.log(`Found product by itemId for ${item.productId}:`, product ? 'Yes' : 'No');

            if (!product) {
              // Try to find by _id as fallback
              product = await ctx.db
                .query("products")
                .filter((q) => q.eq(q.field("_id"), item.productId))
                .filter((q) => q.neq(q.field("isDeleted"), true))
                .first();

              console.log(`Found product by _id for ${item.productId}:`, product ? 'Yes' : 'No');
            }

            if (product) {
              console.log(`Adding product: ${product.name} (${product.itemId})`);
              productsWithDetails.push({
                itemId: product.itemId,
                name: product.name,
                mainImage: product.mainImage,
                price: product.price,
                category: product.category,
                viewCount: item.viewCount,
                uniqueUsers: item.uniqueUsers,
                uniqueSessions: item.uniqueSessions,
              });
            } else {
              console.log(`No product found for ${item.productId}`);
            }
          } catch (error) {
            console.error(`Error fetching product details for ${item.productId}:`, error);
          }
        }

        console.log('Returning trending products:', productsWithDetails.length);
        return productsWithDetails;
      } else {
        // Fallback: Get regular products from the same category
        console.log('No views found, falling back to regular products');
        
        let productsQuery = ctx.db
          .query("products")
          .filter((q) => q.neq(q.field("isDeleted"), true));

        if (args.category) {
          productsQuery = productsQuery.filter((q) => q.eq(q.field("category"), args.category));
        }

        const products = await productsQuery
          .order("desc")
          .take(args.limit || 6);

        console.log('Found fallback products:', products.length);

        // Add mock view counts for display
        const productsWithMockCounts = products.map((product, index) => ({
          itemId: product.itemId,
          name: product.name,
          mainImage: product.mainImage,
          price: product.price,
          category: product.category,
          viewCount: Math.floor(Math.random() * 50) + 5, // Mock view count
          uniqueUsers: Math.floor(Math.random() * 15) + 3,
          uniqueSessions: Math.floor(Math.random() * 25) + 5,
        }));

        console.log('Returning fallback products:', productsWithMockCounts.length);
        return productsWithMockCounts;
      }
    } catch (error) {
      console.error("Error fetching most viewed products:", error);
      return [];
    }
  },
});

// Get global trending products (all categories)
export const getGlobalTrendingProducts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const views = await ctx.db
        .query("views")
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .collect();

      // Group by productId and count views
      const productViewCounts = views.reduce((acc, view) => {
        const productId = view.productId;
        if (!acc[productId]) {
          acc[productId] = {
            productId,
            viewCount: 0,
            uniqueUsers: new Set(),
            uniqueSessions: new Set(),
            lastViewed: view.viewedAt,
            category: view.category,
          };
        }
        acc[productId].viewCount++;
        if (view.userId) acc[productId].uniqueUsers.add(view.userId);
        if (view.sessionId) acc[productId].uniqueSessions.add(view.sessionId);
        
        return acc;
      }, {});

      // Convert to array and sort by view count
      const sortedProducts = Object.values(productViewCounts)
        .map(item => ({
          ...item,
          uniqueUsers: item.uniqueUsers.size,
          uniqueSessions: item.uniqueSessions.size,
        }))
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, args.limit || 10);

      // Fetch product details for each trending product
      const productsWithDetails = await Promise.all(
        sortedProducts.map(async (item) => {
          try {
            const product = await ctx.db
              .query("products")
              .filter((q) => q.eq(q.field("itemId"), item.productId))
              .filter((q) => q.eq(q.field("isDeleted"), false))
              .first();

            return {
              ...item,
              productName: product?.name || 'Unknown Product',
              productImage: product?.mainImage || '/placeholder-product.jpg',
              price: product?.price || 0,
              category: product?.category || item.category,
            };
          } catch (error) {
            console.error(`Error fetching product details for ${item.productId}:`, error);
            return {
              ...item,
              productName: 'Unknown Product',
              productImage: '/placeholder-product.jpg',
              price: 0,
              category: item.category,
            };
          }
        })
      );

      return productsWithDetails;
    } catch (error) {
      console.error("Error fetching global trending products:", error);
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
      console.error("Error fetching user view history:", error);
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
      console.error("Error fetching views by category:", error);
      return [];
    }
  },
});

// Get analytics data for admin dashboard
export const getViewAnalytics = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      let viewsQuery = ctx.db
        .query("views")
        .filter((q) => q.eq(q.field("isDeleted"), false));

      const views = await viewsQuery.collect();

      // Filter by date range if provided
      let filteredViews = views;
      if (args.startDate) {
        filteredViews = filteredViews.filter(view => 
          new Date(view.viewedAt) >= new Date(args.startDate)
        );
      }
      if (args.endDate) {
        filteredViews = filteredViews.filter(view => 
          new Date(view.viewedAt) <= new Date(args.endDate)
        );
      }

      // Calculate analytics
      const totalViews = filteredViews.length;
      const uniqueUsers = new Set(filteredViews.map(v => v.userId).filter(Boolean)).size;
      const uniqueSessions = new Set(filteredViews.map(v => v.sessionId).filter(Boolean)).size;
      const uniqueProducts = new Set(filteredViews.map(v => v.productId)).size;

      // Views by day (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dailyViews = {};
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        dailyViews[dateStr] = 0;
      }

      filteredViews.forEach(view => {
        const viewDate = new Date(view.viewedAt).toISOString().split('T')[0];
        if (dailyViews.hasOwnProperty(viewDate)) {
          dailyViews[viewDate]++;
        }
      });

      // Top products by views
      const productViewCounts = filteredViews.reduce((acc, view) => {
        acc[view.productId] = (acc[view.productId] || 0) + 1;
        return acc;
      }, {});

      const topProducts = Object.entries(productViewCounts)
        .map(([productId, count]) => ({ productId, viewCount: count }))
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 10);

      // Views by view type
      const viewTypeCounts = filteredViews.reduce((acc, view) => {
        const type = view.viewType || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Views by category
      const categoryCounts = filteredViews.reduce((acc, view) => {
        const category = view.category || "unknown";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      return {
        totalViews,
        uniqueUsers,
        uniqueSessions,
        uniqueProducts,
        dailyViews,
        topProducts,
        viewTypeCounts,
        categoryCounts,
      };
    } catch (error) {
      console.error("Error fetching view analytics:", error);
      return {
        totalViews: 0,
        uniqueUsers: 0,
        uniqueSessions: 0,
        uniqueProducts: 0,
        dailyViews: {},
        topProducts: [],
        viewTypeCounts: {},
        categoryCounts: {},
      };
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
      console.error("Error deleting view:", error);
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
      console.error("Error fetching product view count:", error);
      return { totalViews: 0, uniqueUsers: 0 };
    }
  },
}); 
 