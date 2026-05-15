import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper function to get current timestamp
const nowIso = () => new Date().toISOString();

// Existing insert mutation
export const insert = mutation(async ({ db }, product) => {
  await db.insert("products", {
    buys: 0,
    inCart: 0,
    isHidden: false,
    ...product
  });
});




// Bulletproof case-insensitive category search
export const getProductsByCategoryOrType = query({
  args: { 
    searchTerm: v.string(),
    searchType: v.optional(v.union(v.literal("category"), v.literal("type"), v.literal("both")))
  },
  handler: async (ctx, args) => {
    try {
      const normalizedTerm = args.searchTerm?.trim();
      const searchType = args.searchType || "both";
      
      if (!normalizedTerm) {
        return [];
      }

      // Get all non-deleted, visible, in-stock products
      const allProducts = await ctx.db
        .query("products")
        .filter((q) => 
          q.and(
            q.eq(q.field("isDeleted"), false),
            q.eq(q.field("isHidden"), false),
            q.eq(q.field("inStock"), true)
          )
        )
        .collect();
      
      return allProducts.filter(product => {
        const termLower = normalizedTerm.toLowerCase();
        
        // Check category (case-insensitive)
        const categoryMatch = searchType !== "type" && 
          product.category?.toLowerCase() === termLower;
        
        // Check type array (case-insensitive)
        const typeMatch = searchType !== "category" && 
          product.type && 
          Array.isArray(product.type) && 
          product.type.some(t => t?.toLowerCase() === termLower);
        
        return categoryMatch || typeMatch;
      });
      
    } catch (error) {
      return [];
    }
  },
});

// Also keep the original for backward compatibility
export const getProductsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    try {
      const normalizedCategory = args.category?.trim();
      
      if (!normalizedCategory) {
        return [];
      }

      const allProducts = await ctx.db
        .query("products")
        .filter((q) => 
          q.and(
            q.eq(q.field("isDeleted"), false),
            q.eq(q.field("isHidden"), false),
            q.eq(q.field("inStock"), true)
          )
        )
        .collect();
      
      // Case-insensitive category matching
      return allProducts.filter(product => 
        product.category?.toLowerCase() === normalizedCategory.toLowerCase()
      );
      
    } catch (error) {
      return [];
    }
  },
});

// Get products by subcategory (case-insensitive)
export const getProductsBySubcategory = query({
  args: { subcategory: v.string() },
  handler: async (ctx, args) => {
    try {
      const normalizedSubcategory = args.subcategory?.trim();
      
      if (!normalizedSubcategory) {
        return [];
      }

      const products = await ctx.db
        .query("products")
        .filter((q) => 
          q.and(
            q.eq(q.field("isDeleted"), false),
            q.eq(q.field("isHidden"), false),
            q.eq(q.field("inStock"), true)
          )
        )
        .collect();
      
      // Case-insensitive subcategory matching
      return products.filter(product => 
        product.subcategories?.toLowerCase() === normalizedSubcategory.toLowerCase()
      );
      
    } catch (error) {
      return [];
    }
  },
});















// Move product to trash (store in trash table AND mark as deleted)
export const moveToTrash = mutation({
  args: {
    productId: v.string(),          // ID of the product to delete
    deletedBy: v.optional(v.string()), // Optional, who deleted it
    reason: v.optional(v.string()), // Optional, reason for deletion
  },
  handler: async (ctx, { productId, deletedBy, reason }) => {
    // 1. Fetch the product from the products table
    const product = await ctx.db.get("products", productId);
    if (!product) {
      throw new Error("Product not found.");
    }

    // 2. Insert into trashforproduct
    await ctx.db.insert("trashforproduct", {
      originalId: productId,
      tableName: "products",
      originalData: product,
      deletedAt: nowIso(),
      deletedBy: deletedBy || "admin",
      deletionReason: reason || "",
      canRestore: true,
    });

    // 3. Delete the product from products table
    await ctx.db.delete("products", productId);

    return { success: true, message: "Product deleted and moved to trash." };
  },
});

// Restore product from trash (remove from trash table AND mark as not deleted)
export const restoreFromTrash = mutation({
  args: { 
    productId: v.id("products"),
    restoredBy: v.optional(v.string())
  },
  handler: async (ctx, { productId, restoredBy }) => {
    // Find the trash item for this product
    const trashItem = await ctx.db
      .query("trash")
      .withIndex("by_table", (q) => q.eq("tableName", "products"))
      .filter((q) => q.eq(q.field("originalId"), productId))
      .first();
    
    if (trashItem) {
      // Remove from trash table
      await ctx.db.delete(trashItem._id);
    }
    
    // Mark product as not deleted
    await ctx.db.patch(productId, { 
      isDeleted: false,
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: nowIso() // Ensure this is a string
    });
    
    return { success: true, message: "Product restored from trash successfully" };
  },
});

// New update mutation
export const update = mutation(async ({ db }, { itemId, updates }) => {
  const product = await db
    .query("products")
    .filter(q => q.eq(q.field("itemId"), itemId))
    .unique();

  if (!product) throw new Error("Product not found");

  // Ensure updatedAt is a string
  const updateData = {
    ...updates,
    updatedAt: nowIso()
  };

  await db.patch(product._id, updateData);
});

// Get all products (excluding deleted ones)
export const getAll = query(async ({ db }) => {
  return await db
    .query("products")
    .filter((q) => q.neq(q.field("isDeleted"), true))
    .order("desc", "createdAt")
    .collect();
});


export const getById = query(async ({ db }, { itemId }) => {
  return await db
    .query("products")
    .filter(q => q.eq(q.field("itemId"), itemId))
    .unique();
});

export const toggleHidden = mutation(async ({ db }, { itemId, isHidden }) => {
  const product = await db
    .query("products")
    .filter(q => q.eq(q.field("itemId"), itemId))
    .first();

  if (!product) throw new Error("Product not found");

  await db.patch(product._id, { 
    isHidden,
    updatedAt: nowIso() // Ensure this is a string
  });
});

export const deleteProduct = mutation(async ({ db }, { productId }) => {
  if (!productId) throw new Error("Missing productId");

  await db.delete("products", productId); // pass the _id directly
});


export const debugProducts = query(async ({ db }) => {
  const allProducts = await db.query("products").collect();
  return allProducts.map(p => ({
    _id: p._id,
    name: p.name,
    buys: p.buys,
    isHidden: p.isHidden,
    category: p.category,
    price: p.price,
    mainImage: p.mainImage || p.image || "No image",
    image: p.image || "No image"
  }));
});

// Get single product by _id for public product pages
export const getProductById = query({
  args: { productId: v.string() },
  handler: async (ctx, { productId }) => {
    try {
      // First try to find by itemId (which is the public identifier)
      const products = await ctx.db
        .query("products")
        .filter(q => q.eq(q.field("itemId"), productId))
        .collect();
      
      // Get the first non-deleted product
      let product = products.find(p => !p.isDeleted);
      
      // If not found by itemId, try to find by _id (fallback)
      if (!product) {
        try {
          product = await ctx.db.get(productId);
          // Check if it's a valid product and not deleted
          if (product && product.isDeleted === true) {
            product = null;
          }
        } catch (error) {
          product = null;
        }
      }
      
      return product || null;
    } catch (error) {
      return null;
    }
  },
});

export const getProductsByIds = query({
  args: { productIds: v.array(v.string()) },
  handler: async (ctx, { productIds }) => {
    if (productIds.length === 0) return [];
    
    // First try to get products by itemId
    const productsByItemId = await ctx.db
      .query("products")
      .filter(q => q.and(
        q.neq(q.field("isDeleted"), true),
        q.or(...productIds.map(id => q.eq(q.field("itemId"), id)))
      ))
      .collect();
    
    // For any missing products, try to get by _id (document ID)
    const foundItemIds = new Set(productsByItemId.map(p => p.itemId));
    const missingIds = productIds.filter(id => !foundItemIds.has(id));
    
    const productsByDocId = [];
    for (const id of missingIds) {
      try {
        const product = await ctx.db.get(id);
        if (product && !product.isDeleted) {
          productsByDocId.push(product);
        }
      } catch (error) {
        // Invalid document ID, skip silently
      }
    }
    
    return [...productsByItemId, ...productsByDocId];
  },
});

// Get top 10 products of the week (by sales)
export const getTopPicks = query(async ({ db }) => {
  const allProducts = await db.query("products").collect();
  
  const visibleProducts = allProducts.filter(p => !p.isHidden);
  
  // Sort by buys field (sales count)
  const sortedProducts = visibleProducts.sort((a, b) => (b.buys || 0) - (a.buys || 0));
  
  const topProducts = sortedProducts.slice(0, 10);
  
  // Return products with all necessary fields for display
  return topProducts.map(p => ({
    _id: p._id,
    name: p.name,
    category: p.category,
    price: p.price,
    mainImage: p.mainImage || p.image || "/products/placeholder.jpg", // Fallback for missing images
    buys: p.buys
  }));
});

// Get product statistics for admin dashboard
export const getProductStats = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .filter(q => q.neq(q.field("isDeleted"), true))
      .collect();

    const stats = {
      total: products.length,
      inStock: products.filter(p => p.inStock !== false).length,
      outOfStock: products.filter(p => p.inStock === false).length,
      lowStock: products.filter(p => 
        p.currentStock !== undefined && p.currentStock < 10 && p.currentStock > 0
      ).length,
      totalSales: products.reduce((sum, p) => sum + (p.buys || 0) * (p.price || 0), 0),
      totalBuys: products.reduce((sum, p) => sum + (p.buys || 0), 0),
      averagePrice: products.length > 0 
        ? products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length 
        : 0,
      categories: {}
    };

    // Calculate category stats
    products.forEach(product => {
      const category = product.category || "Uncategorized";
      if (!stats.categories[category]) {
        stats.categories[category] = {
          count: 0,
          totalSales: 0,
          totalBuys: 0
        };
      }
      stats.categories[category].count += 1;
      stats.categories[category].totalSales += (product.buys || 0) * (product.price || 0);
      stats.categories[category].totalBuys += (product.buys || 0);
    });

    return stats;
  },
});

// Get products with advanced filtering for admin
export const getProductsWithFilters = query({
  args: {
    searchQuery: v.optional(v.string()),
    category: v.optional(v.string()),
    stockStatus: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    sortOrder: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("products")
      .filter(q => q.neq(q.field("isDeleted"), true));

    // Apply search filter
    if (args.searchQuery) {
      query = query.filter(q => 
        q.or(
          q.eq(q.field("name"), args.searchQuery),
          q.eq(q.field("itemId"), args.searchQuery)
        )
      );
    }

    // Apply category filter
    if (args.category && args.category !== "All") {
      query = query.filter(q => q.eq(q.field("category"), args.category));
    }

    // Apply stock status filter
    if (args.stockStatus && args.stockStatus !== "All") {
      if (args.stockStatus === "In Stock") {
        query = query.filter(q => q.neq(q.field("inStock"), false));
      } else if (args.stockStatus === "Out of Stock") {
        query = query.filter(q => q.eq(q.field("inStock"), false));
      } else if (args.stockStatus === "Low Stock") {
        query = query.filter(q => 
          q.and(
            q.neq(q.field("currentStock"), undefined),
            q.lt(q.field("currentStock"), 10),
            q.gt(q.field("currentStock"), 0)
          )
        );
      }
    }

    // Apply sorting
    const sortField = args.sortBy || "createdAt";
    const sortOrder = args.sortOrder || "desc";
    
    if (sortField === "name" || sortField === "category") {
      // For string fields, we need to sort after fetching
      const products = await query.collect();
      products.sort((a, b) => {
        const aVal = a[sortField] || "";
        const bVal = b[sortField] || "";
        return sortOrder === "asc" 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
      
      // Apply pagination
      const offset = args.offset || 0;
      const limit = args.limit || 50;
      return products.slice(offset, offset + limit);
    } else {
      // For numeric fields, we can sort in the query
      const order = sortOrder === "asc" ? "asc" : "desc";
      const products = await query.order(order).take(args.limit || 50);
      return products;
    }
  },
});

// Bulk update product status
export const bulkUpdateProductStatus = mutation({
  args: {
    productIds: v.array(v.id("products")),
    updates: v.object({
      inStock: v.optional(v.boolean()),
      isHidden: v.optional(v.boolean()),
      category: v.optional(v.string()),
    }),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, { productIds, updates, updatedBy = "admin" }) => {
    const results = [];
    
    for (const productId of productIds) {
      try {
        const product = await ctx.db.get(productId);
        if (!product) {
          results.push({ id: productId, success: false, error: "Product not found" });
          continue;
        }

        await ctx.db.patch(productId, {
          ...updates,
          updatedAt: nowIso(), // Changed from Date.now() to nowIso()
          updatedBy,
        });

        results.push({ id: productId, success: true });
      } catch (error) {
        results.push({ id: productId, success: false, error: error.message });
      }
    }

    return results;
  },
});

// Bulk delete products
export const bulkDeleteProducts = mutation({
  args: {
    productIds: v.array(v.id("products")),
    deletedBy: v.optional(v.string()),
  },
  handler: async (ctx, { productIds, deletedBy = "admin" }) => {
    const results = [];
    
    for (const productId of productIds) {
      try {
        const product = await ctx.db.get(productId);
        if (!product) {
          results.push({ id: productId, success: false, error: "Product not found" });
          continue;
        }

        // Soft delete by marking as deleted
        await ctx.db.patch(productId, {
          isDeleted: true,
          deletedAt: nowIso(), // Changed from Date.now() to nowIso()
          deletedBy,
          updatedAt: nowIso() // Added this field
        });

        results.push({ id: productId, success: true });
      } catch (error) {
        results.push({ id: productId, success: false, error: error.message });
      }
    }

    return results;
  },
});

// Get product analytics
export const getProductAnalytics = query({
  args: {
    productId: v.optional(v.string()),
    timeRange: v.optional(v.string()), // "7d", "30d", "90d", "1y"
  },
  handler: async (ctx, { productId, timeRange = "30d" }) => {
    const now = Date.now();
    const timeRanges = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
      "1y": 365 * 24 * 60 * 60 * 1000,
    };
    
    const startTime = now - (timeRanges[timeRange] || timeRanges["30d"]);

    if (productId) {
      // Get analytics for specific product
      const product = await ctx.db
        .query("products")
        .filter(q => q.eq(q.field("itemId"), productId))
        .first();

      if (!product) {
        return null;
      }

      // Get orders for this product in the time range
      const orders = await ctx.db
        .query("orders")
        .filter(q => 
          q.and(
            q.gte(q.field("createdAt"), startTime),
            q.eq(q.field("status"), "delivered")
          )
        )
        .collect();

      // Calculate analytics
      const productOrders = orders.filter(order => 
        order.items.some(item => item.itemId === productId)
      );

      const totalSales = productOrders.reduce((sum, order) => {
        const productItem = order.items.find(item => item.itemId === productId);
        return sum + (productItem ? productItem.price * productItem.quantity : 0);
      }, 0);

      const totalQuantity = productOrders.reduce((sum, order) => {
        const productItem = order.items.find(item => item.itemId === productId);
        return sum + (productItem ? productItem.quantity : 0);
      }, 0);

      return {
        product,
        totalSales,
        totalQuantity,
        orderCount: productOrders.length,
        averageOrderValue: productOrders.length > 0 ? totalSales / productOrders.length : 0,
        timeRange,
      };
    } else {
      // Get overall analytics
      const orders = await ctx.db
        .query("orders")
        .filter(q => 
          q.and(
            q.gte(q.field("createdAt"), startTime),
            q.eq(q.field("status"), "delivered")
          )
        )
        .collect();

      const totalRevenue = orders.reduce((sum, order) => sum + order.orderTotal, 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get top selling products
      const productSales = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          if (!productSales[item.itemId]) {
            productSales[item.itemId] = {
              name: item.name,
              totalSales: 0,
              totalQuantity: 0,
            };
          }
          productSales[item.itemId].totalSales += item.price * item.quantity;
          productSales[item.itemId].totalQuantity += item.quantity;
        });
      });

      const topProducts = Object.entries(productSales)
        .map(([itemId, data]) => ({ itemId, ...data }))
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 10);

      return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topProducts,
        timeRange,
      };
    }
  },
});

// Update product stock
export const updateProductStock = mutation({
  args: {
    productId: v.id("products"),
    stockData: v.object({
      currentStock: v.optional(v.number()),
      inStock: v.optional(v.boolean()),
      sizeStock: v.optional(v.any()), // Change this to v.any() to allow any object structure
    }),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, { productId, stockData, updatedBy = "admin" }) => {
    const product = await ctx.db.get(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Update the product with new stock data
    await ctx.db.patch(productId, {
      ...stockData,
      updatedAt: nowIso(), // Changed from Date.now() to nowIso()
      updatedBy,
    });

    return { success: true };
  },
});


export const searchProducts = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    sortBy: v.optional(v.string()),
  },
  handler: async (ctx, { query, limit = 20, sortBy = "relevance" }) => {
    const products = await ctx.db
      .query("products")
      .filter(q => q.neq(q.field("isDeleted"), true))
      .collect();

    const searchTerm = query.toLowerCase().trim();
    
    const filtered = products.filter(product => {
      const name = (product.name || "").toLowerCase();
      const itemId = (product.itemId || "").toLowerCase();
      const category = (product.category || "").toLowerCase();
      const description = (product.description || "").toLowerCase();
      
      return name.includes(searchTerm) ||
             itemId.includes(searchTerm) ||
             category.includes(searchTerm) ||
             description.includes(searchTerm);
    });

    return filtered.slice(0, limit);
  },
});


export const getRecentlyViewed = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 10 }) => {
    const recentlyViewed = await ctx.db
      .query("recentlyViewed")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc", "viewedAt")
      .collect();

    return recentlyViewed.slice(0, limit);
  },
});


export const addRecentlyViewed = mutation({
  args: {
    userId: v.id("users"),
    productId: v.string(),
    productName: v.string(),
    productImage: v.string(),
    productPrice: v.number(),
    productCategory: v.string(),
  },
  handler: async (ctx, { userId, productId, productName, productImage, productPrice, productCategory }) => {
    // Check if this product is already in recently viewed
    const existing = await ctx.db
      .query("recentlyViewed")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("productId"), productId))
      .first();

    if (existing) {
      // Update the viewedAt timestamp
      await ctx.db.patch(existing._id, {
        viewedAt: nowIso(),
      });
    } else {
      // Add new entry
      await ctx.db.insert("recentlyViewed", {
        userId,
        productId,
        productName,
        productImage,
        productPrice,
        productCategory,
        viewedAt: nowIso(),
      });     
    }

    // Clean up old entries (keep only last 50 per user)
    const allRecent = await ctx.db
      .query("recentlyViewed")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc", "viewedAt")
      .collect();

    if (allRecent.length > 50) {
      const toDelete = allRecent.slice(50);
      for (const item of toDelete) {
        await ctx.db.delete(item._id);
      }
    }

    return { success: true };
  },
});

// Get related products based on category and price
export const getRelatedProducts = query({
  args: {
    productId: v.string(),
    category: v.string(),
    price: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { productId, category, price, limit = 4 }) => {
    // Get products in the same category, excluding the current product
    const relatedProducts = await ctx.db
      .query("products")
      .filter((q) => 
        q.and(
          q.eq(q.field("category"), category),
          q.neq(q.field("itemId"), productId),
          q.neq(q.field("isDeleted"), true),
          q.neq(q.field("isHidden"), true)
        )
      )
      .collect();

    // If we don't have enough products in the same category, get products with similar price range
    if (relatedProducts.length < limit) {
      const priceRange = price * 0.3; // 30% price range
      const minPrice = price - priceRange;
      const maxPrice = price + priceRange;

      const priceSimilarProducts = await ctx.db
        .query("products")
        .filter((q) => 
          q.and(
            q.neq(q.field("itemId"), productId),
            q.neq(q.field("isDeleted"), true),
            q.neq(q.field("isHidden"), true),
            q.gte(q.field("price"), minPrice),
            q.lte(q.field("price"), maxPrice)
          )
        )
        .collect();

      // Merge and deduplicate
      const allProducts = [...relatedProducts, ...priceSimilarProducts];
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.itemId === product.itemId)
      );

      // Sort by relevance (category match first, then price similarity)
      uniqueProducts.sort((a, b) => {
        const aCategoryMatch = a.category === category ? 1 : 0;
        const bCategoryMatch = b.category === category ? 1 : 0;
        
        if (aCategoryMatch !== bCategoryMatch) {
          return bCategoryMatch - aCategoryMatch;
        }
        
        // If both have same category match, sort by price similarity
        const aPriceDiff = Math.abs(a.price - price);
        const bPriceDiff = Math.abs(b.price - price);
        return aPriceDiff - bPriceDiff;
      });

      return uniqueProducts.slice(0, limit);
    }

    // If we have enough products in the same category, sort by price similarity
    relatedProducts.sort((a, b) => {
      const aPriceDiff = Math.abs(a.price - price);
      const bPriceDiff = Math.abs(b.price - price);
      return aPriceDiff - bPriceDiff;
    });

    return relatedProducts.slice(0, limit);
  },
});

// Reports Functions

// Get dashboard summary statistics
export const getDashboardStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, { startDate, endDate }) => {
    const now = Date.now();
    const defaultStartDate = startDate || (now - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const defaultEndDate = endDate || now;

    // Get orders within date range
    let ordersQuery = ctx.db.query("orders");
    if (startDate) {
      ordersQuery = ordersQuery.filter(q => q.gte(q.field("createdAt"), defaultStartDate));
    }
    if (endDate) {
      ordersQuery = ordersQuery.filter(q => q.lte(q.field("createdAt"), defaultEndDate));
    }
    
    const orders = await ordersQuery.collect();
    
    // Calculate metrics
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + order.orderTotal, 0);
    const completedOrders = orders.filter(order => order.status === "delivered");
    const netProfit = completedOrders.reduce((sum, order) => sum + (order.orderTotal * 0.3), 0); // Assuming 30% profit margin
    
    // Get unique customers
    const uniqueCustomers = new Set(orders.map(order => order.userId)).size;
    
    return {
      totalSales,
      totalOrders,
      totalCustomers: uniqueCustomers,
      netProfit,
    };
  },
});











// Fix the getSalesPerformance function to return proper format
export const getSalesPerformanceFixed = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    period: v.optional(v.string()), // "7d", "30d", "90d", "1y"
  },
  handler: async (ctx, { startDate, endDate, period = "30d" }) => {
    const now = Date.now();
    const defaultStartDate = startDate || (now - 30 * 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate || now;

    let ordersQuery = ctx.db.query("orders")
      .filter(q => q.gte(q.field("createdAt"), defaultStartDate))
      .filter(q => q.lte(q.field("createdAt"), defaultEndDate));
    
    const orders = await ordersQuery.collect();
    
    // Group by time interval based on period
    const salesData = {};
    const interval = period === "7d" ? "day" : period === "30d" ? "day" : period === "90d" ? "week" : "month";
    
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      let key;
      
      if (interval === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (interval === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = date.toISOString().split('T')[0];
      }
      
      if (!salesData[key]) {
        salesData[key] = { date: key, sales: 0, orders: 0 };
      }
      salesData[key].sales += order.orderTotal;
      salesData[key].orders += 1;
    });
    
    const sortedData = Object.values(salesData).sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      labels: sortedData.map(d => d.date),
      revenue: sortedData.map(d => d.sales),
      orders: sortedData.map(d => d.orders)
    };
  },
});

// Get all products for admin
export const getAllProducts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .filter(q => q.neq(q.field("isDeleted"), true))
      .order("desc")
      .take(args.limit || 1000);
    
    return products;
  },
});

// Get comprehensive analytics with proper return format
export const getAdvancedAnalyticsFixed = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    period: v.optional(v.string()), // "day", "week", "month", "year"
  },
  handler: async (ctx, { startDate, endDate, period = "month" }) => {
    const now = Date.now();
    const defaultStartDate = startDate || (now - 30 * 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate || now;

    // Get all orders in date range
    const orders = await ctx.db.query("orders")
      .filter(q => q.gte(q.field("createdAt"), defaultStartDate))
      .filter(q => q.lte(q.field("createdAt"), defaultEndDate))
      .collect();

    // Get all products
    const products = await ctx.db.query("products")
      .filter(q => q.neq(q.field("isDeleted"), true))
      .collect();

    // Get all users
    const users = await ctx.db.query("users").collect();

    // Calculate comprehensive metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.orderTotal, 0);
    const totalOrders = orders.length;
    const totalCustomers = users.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate conversion rate (simplified - orders/users)
    const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;
    
    // Calculate growth metrics
    const previousPeriodStart = defaultStartDate - (defaultEndDate - defaultStartDate);
    const previousOrders = await ctx.db.query("orders")
      .filter(q => q.gte(q.field("createdAt"), previousPeriodStart))
      .filter(q => q.lt(q.field("createdAt"), defaultStartDate))
      .collect();
    
    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.orderTotal, 0);
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const orderGrowth = previousOrders.length > 0 ? ((totalOrders - previousOrders.length) / previousOrders.length) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      averageOrderValue,
      conversionRate,
      revenueGrowth,
      orderGrowth,
      period
    };
  },
});

// Get detailed reports with proper format
export const getDetailedReportsFixed = query({
  args: {
    reportType: v.string(), // "orders", "products", "comprehensive"
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    category: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const defaultStartDate = args.startDate || (now - 30 * 24 * 60 * 60 * 1000);
    const defaultEndDate = args.endDate || now;

    if (args.reportType === "orders") {
      let ordersQuery = ctx.db.query("orders")
        .filter(q => q.gte(q.field("createdAt"), defaultStartDate))
        .filter(q => q.lte(q.field("createdAt"), defaultEndDate));
      
      if (args.searchQuery) {
        ordersQuery = ordersQuery.filter(q => 
          q.eq(q.field("orderNumber"), args.searchQuery)
        );
      }
      
      const orders = await ordersQuery
        .order("desc")
        .collect();
      
      const startIndex = args.offset || 0;
      const endIndex = startIndex + (args.limit || 50);
      
      return {
        data: orders.slice(startIndex, endIndex),
        total: orders.length,
      };
    } else if (args.reportType === "products") {
      // Products report
      let productsQuery = ctx.db.query("products")
        .filter(q => q.neq(q.field("isDeleted"), true));
      
      if (args.category) {
        productsQuery = productsQuery.filter(q => q.eq(q.field("category"), args.category));
      }
      
      if (args.searchQuery) {
        productsQuery = productsQuery.filter(q => 
          q.or(
            q.eq(q.field("name"), args.searchQuery),
            q.eq(q.field("itemId"), args.searchQuery)
          )
        );
      }
      
      const products = await productsQuery.collect();
      
      const startIndex = args.offset || 0;
      const endIndex = startIndex + (args.limit || 50);
      
      return {
        data: products.slice(startIndex, endIndex),
        total: products.length,
      };
    } else {
      // Comprehensive report
      const orders = await ctx.db.query("orders")
        .filter(q => q.gte(q.field("createdAt"), defaultStartDate))
        .filter(q => q.lte(q.field("createdAt"), defaultEndDate))
        .collect();
      
      const products = await ctx.db.query("products")
        .filter(q => q.neq(q.field("isDeleted"), true))
        .collect();
      
      return {
        orders: {
          data: orders,
          total: orders.length,
        },
        products: {
          data: products,
          total: products.length,
        }
      };
    }
  },
});

// Simplified personalized products function
export const getPersonalizedProducts = query({
  args: {
    limit: v.optional(v.number()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    try {
      if (!args.userId) {
        return [];
      }

      // Get user data
      const user = await ctx.db.get(args.userId);
      
      if (!user || !user.interests || user.interests.length === 0) {
        return [];
      }

      // Get all products (remove isDeleted filter)
      const allProducts = await ctx.db
        .query("products")
        .collect();

      // Simple matching - check if any product type matches any user interest
      const personalizedProducts = allProducts.filter(product => {
        if (!product.type || !Array.isArray(product.type)) {
          return false;
        }
        
        return product.type.some(productType => 
          user.interests.includes(productType)
        );
      });

      // Sort by creation date (newest first) and limit
      const sortedProducts = personalizedProducts
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, args.limit || 6);
      
      return sortedProducts;
    } catch (error) {
      return [];
    }
  },
});


// Frontend search function optimized for navbar
export const searchProductsForNavbar = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { searchTerm, limit = 8 }) => {
    if (!searchTerm || searchTerm.trim().length < 1) {
      return [];
    }

    const products = await ctx.db
      .query("products")
      .filter(q => q.neq(q.field("isDeleted"), true))
      .filter(q => q.neq(q.field("isHidden"), true))
      .collect();

    const searchQuery = searchTerm.toLowerCase().trim();
    
    // Enhanced search with scoring
    const searchResults = products
      .map(product => {
        let score = 0;
        const name = product.name.toLowerCase();
        const category = (product.category || "").toLowerCase();
        const description = (product.description || "").toLowerCase();
        const itemId = product.itemId.toLowerCase();
        
        // Exact name match gets highest score
        if (name === searchQuery) score += 100;
        // Name starts with search term
        else if (name.startsWith(searchQuery)) score += 80;
        // Name contains search term
        else if (name.includes(searchQuery)) score += 60;
        
        // Category matches
        if (category.includes(searchQuery)) score += 40;
        
        // Description matches
        if (description.includes(searchQuery)) score += 20;
        
        // Item ID matches
        if (itemId.includes(searchQuery)) score += 30;
        
        return { ...product, searchScore: score };
      })
      .filter(product => product.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore)
      .slice(0, limit);

    return searchResults.map(({ searchScore, ...product }) => product);
  },
});
