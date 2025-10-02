// convex/queries/getProductsByCategory.js
import { query } from "./_generated/server";



export const getProductsByCategory = query(async ({ db }, { category }) => {
  return await db
    .query("products")
    .filter(
      (p) => p.neq(p.field("isDeleted"), true) && p.eq(p.field("category"), category)
    )
    .order("desc", "createdAt")
    .collect();
});

export const getAll = query(async ({ db }) => {
  return await db
    .query("products")
    .filter((q) => q.neq(q.field("isDeleted"), true))
    .order("desc", "createdAt")
    .collect();
});