/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as backup from "../backup.js";
import type * as cart from "../cart.js";
import type * as category from "../category.js";
import type * as chatSessions from "../chatSessions.js";
import type * as convex__generated_api from "../convex/_generated/api.js";
import type * as convex__generated_server from "../convex/_generated/server.js";
import type * as convex_auth from "../convex/auth.js";
import type * as convex_backup from "../convex/backup.js";
import type * as convex_cart from "../convex/cart.js";
import type * as convex_category from "../convex/category.js";
import type * as convex_chatSessions from "../convex/chatSessions.js";
import type * as convex_coupons from "../convex/coupons.js";
import type * as convex_crons from "../convex/crons.js";
import type * as convex_dailyAccess from "../convex/dailyAccess.js";
import type * as convex_emailNotifications from "../convex/emailNotifications.js";
import type * as convex_emailService from "../convex/emailService.js";
import type * as convex_insys from "../convex/insys.js";
import type * as convex_inventory from "../convex/inventory.js";
import type * as convex_mutations_shares from "../convex/mutations/shares.js";
import type * as convex_offStore from "../convex/offStore.js";
import type * as convex_orders from "../convex/orders.js";
import type * as convex_products from "../convex/products.js";
import type * as convex_reportGenerator from "../convex/reportGenerator.js";
import type * as convex_reportTemplates from "../convex/reportTemplates.js";
import type * as convex_reports from "../convex/reports.js";
import type * as convex_reviews from "../convex/reviews.js";
import type * as convex_shiprocketConfig from "../convex/shiprocketConfig.js";
import type * as convex_users from "../convex/users.js";
import type * as convex_utils_helpers from "../convex/utils/helpers.js";
import type * as convex_views from "../convex/views.js";
import type * as convex_webStore from "../convex/webStore.js";
import type * as convex_wishlist from "../convex/wishlist.js";
import type * as coupons from "../coupons.js";
import type * as crons from "../crons.js";
import type * as dailyAccess from "../dailyAccess.js";
import type * as emailNotifications from "../emailNotifications.js";
import type * as emailService from "../emailService.js";
import type * as insys from "../insys.js";
import type * as inventory from "../inventory.js";
import type * as mutations_shares from "../mutations/shares.js";
import type * as offStore from "../offStore.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as reportGenerator from "../reportGenerator.js";
import type * as reportTemplates from "../reportTemplates.js";
import type * as reports from "../reports.js";
import type * as reviews from "../reviews.js";
import type * as shiprocketConfig from "../shiprocketConfig.js";
import type * as siteSettings from "../siteSettings.js";
import type * as users from "../users.js";
import type * as utils_helpers from "../utils/helpers.js";
import type * as views from "../views.js";
import type * as webStore from "../webStore.js";
import type * as wishlist from "../wishlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  backup: typeof backup;
  cart: typeof cart;
  category: typeof category;
  chatSessions: typeof chatSessions;
  "convex/_generated/api": typeof convex__generated_api;
  "convex/_generated/server": typeof convex__generated_server;
  "convex/auth": typeof convex_auth;
  "convex/backup": typeof convex_backup;
  "convex/cart": typeof convex_cart;
  "convex/category": typeof convex_category;
  "convex/chatSessions": typeof convex_chatSessions;
  "convex/coupons": typeof convex_coupons;
  "convex/crons": typeof convex_crons;
  "convex/dailyAccess": typeof convex_dailyAccess;
  "convex/emailNotifications": typeof convex_emailNotifications;
  "convex/emailService": typeof convex_emailService;
  "convex/insys": typeof convex_insys;
  "convex/inventory": typeof convex_inventory;
  "convex/mutations/shares": typeof convex_mutations_shares;
  "convex/offStore": typeof convex_offStore;
  "convex/orders": typeof convex_orders;
  "convex/products": typeof convex_products;
  "convex/reportGenerator": typeof convex_reportGenerator;
  "convex/reportTemplates": typeof convex_reportTemplates;
  "convex/reports": typeof convex_reports;
  "convex/reviews": typeof convex_reviews;
  "convex/shiprocketConfig": typeof convex_shiprocketConfig;
  "convex/users": typeof convex_users;
  "convex/utils/helpers": typeof convex_utils_helpers;
  "convex/views": typeof convex_views;
  "convex/webStore": typeof convex_webStore;
  "convex/wishlist": typeof convex_wishlist;
  coupons: typeof coupons;
  crons: typeof crons;
  dailyAccess: typeof dailyAccess;
  emailNotifications: typeof emailNotifications;
  emailService: typeof emailService;
  insys: typeof insys;
  inventory: typeof inventory;
  "mutations/shares": typeof mutations_shares;
  offStore: typeof offStore;
  orders: typeof orders;
  products: typeof products;
  reportGenerator: typeof reportGenerator;
  reportTemplates: typeof reportTemplates;
  reports: typeof reports;
  reviews: typeof reviews;
  shiprocketConfig: typeof shiprocketConfig;
  siteSettings: typeof siteSettings;
  users: typeof users;
  "utils/helpers": typeof utils_helpers;
  views: typeof views;
  webStore: typeof webStore;
  wishlist: typeof wishlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
