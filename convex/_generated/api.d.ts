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
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as cart from "../cart.js";
import type * as category from "../category.js";
import type * as chatMessages from "../chatMessages.js";
import type * as chatSessions from "../chatSessions.js";
import type * as dailyAccess from "../dailyAccess.js";
import type * as emailNotifications from "../emailNotifications.js";
import type * as emailService from "../emailService.js";
import type * as mutations_shares from "../mutations/shares.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as reportGenerator from "../reportGenerator.js";
import type * as reportTemplates from "../reportTemplates.js";
import type * as reports from "../reports.js";
import type * as reviews from "../reviews.js";
import type * as sampleTemplates from "../sampleTemplates.js";
import type * as supportTickets from "../supportTickets.js";
import type * as users from "../users.js";
import type * as utils_helpers from "../utils/helpers.js";
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
  analytics: typeof analytics;
  auth: typeof auth;
  cart: typeof cart;
  category: typeof category;
  chatMessages: typeof chatMessages;
  chatSessions: typeof chatSessions;
  dailyAccess: typeof dailyAccess;
  emailNotifications: typeof emailNotifications;
  emailService: typeof emailService;
  "mutations/shares": typeof mutations_shares;
  orders: typeof orders;
  products: typeof products;
  reportGenerator: typeof reportGenerator;
  reportTemplates: typeof reportTemplates;
  reports: typeof reports;
  reviews: typeof reviews;
  sampleTemplates: typeof sampleTemplates;
  supportTickets: typeof supportTickets;
  users: typeof users;
  "utils/helpers": typeof utils_helpers;
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
