import { mutation, query } from "./_generated/server";
// Existing insert mutation
export const insert = mutation(async ({ db }, product) => {
  await db.insert("products", {
    buys: 0,
    inCart: 0,
    isHidden: false,
    ...product
  });
});

// New update mutation
export const update = mutation(async ({ db }, { itemId, updates }) => {
  const product = await db
    .query("products")
    .filter(q => q.eq(q.field("itemId"), itemId))
    .unique();

  if (!product) throw new Error("Product not found");

  await db.patch(product._id, updates);
});

// Get all products
export const getAll = query(async ({ db }) => {
  return await db.query("products").order("desc", "createdAt").collect();
});

// Get single product by itemId
export const getById = query(async ({ db }, { itemId }) => {
  return await db
    .query("products")
    .filter(q => q.eq(q.field("itemId"), itemId))
    .unique();
});
// export const getById = query({
//   args: { itemId: v.string() },
//   handler: async (ctx, args) => {
//     return await ctx.db
//       .query("products")
//       .filter((q) => q.eq(q.field("itemId"), args.itemId))
//       .first();
//   },
// });
export const toggleHidden = mutation(async ({ db }, { itemId, isHidden }) => {
  const product = await db
    .query("products")
    .filter(q => q.eq(q.field("itemId"), itemId))
    .first();

  if (!product) throw new Error("Product not found");

  await db.patch(product._id, { isHidden });
});
export const deleteProduct = mutation(async ({ db }, { productId }) => {
  if (!productId) throw new Error("Missing productId");

  await db.delete("products", productId); // pass the _id directly
});

// Test function to check if API generation works
export const test = query(async ({ db }) => {
  return "test";
});

// Debug function to check database content
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
export const getProductById = query(async ({ db }, { productId }) => {
  return await db
    .query("products")
    .filter(q => q.eq(q.field("_id"), productId))
    .unique();
});

// Get top 10 products of the week (by sales)
export const getTopPicks = query(async ({ db }) => {
  console.log("getTopPicks function called");
  
  const allProducts = await db.query("products").collect();
  console.log("All products:", allProducts.length);
  
  const visibleProducts = allProducts.filter(p => !p.isHidden);
  console.log("Visible products:", visibleProducts.length);
  
  // Sort by buys field (sales count)
  const sortedProducts = visibleProducts.sort((a, b) => (b.buys || 0) - (a.buys || 0));
  console.log("Sorted products by buys:", sortedProducts.map(p => ({ name: p.name, buys: p.buys })));
  
  const topProducts = sortedProducts.slice(0, 10);
  console.log("Top 10 products:", topProducts.length);
  
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