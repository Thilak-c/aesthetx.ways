/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as cart from "../cart.js";
import type * as dailyAccess from "../dailyAccess.js";
import type * as mutations_shares from "../mutations/shares.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as reports from "../reports.js";
import type * as reviews from "../reviews.js";
import type * as users from "../users.js";
import type * as views from "../views.js";
import type * as wishlist from "../wishlist.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  cart: typeof cart;
  dailyAccess: typeof dailyAccess;
  "mutations/shares": typeof mutations_shares;
  orders: typeof orders;
  products: typeof products;
  reports: typeof reports;
  reviews: typeof reviews;
  users: typeof users;
  views: typeof views;
  wishlist: typeof wishlist;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
