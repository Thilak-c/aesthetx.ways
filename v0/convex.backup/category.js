// convex/queries/getProductsByCategory.js
import { query } from "./_generated/server";
import { v } from "convex/values";



























// import { query } from "./_generated/server";

// Get all products (with optional filtering)
export const getAllProducts = query({
  args: {},
  handler: async (ctx) => {
    // Fetch all products from the database
    const products = await ctx.db.query("products").collect();
    
    // Filter out hidden products (optional - remove if you want to show all)
    const visibleProducts = products.filter(
      (product) => !product.isHidden
    );
    
    return visibleProducts;
  },
});

// Get all unique subcategories
export const getAllSubcategories = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    
    const subcategories = new Set();
    products.forEach((product) => {
      if (product.subcategories && !product.isHidden) {
        subcategories.add(product.subcategories);
      }
    });
    
    return Array.from(subcategories).sort();
  },
});






export const getProductsByCategory = query(async ({ db }, { category }) => {
  return await db
    .query("products")
    .filter(
      (p) => p.neq(p.field("isDeleted"), true) && p.eq(p.field("category"), category)
    )
    .order("desc", "createdAt")
    .collect();
});

