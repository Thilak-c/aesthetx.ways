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
  return await db.query("products").order("desc").collect();
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