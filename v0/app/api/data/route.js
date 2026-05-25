import { NextResponse } from 'next/server';
import { executeDataOperation } from '@/lib/dataOperations';
import { verifyToken } from '@/lib/jwt';

// Operations that can be called without authentication
const PUBLIC_OPS = new Set([
  // Auth
  'auth.signup', 'auth.signIn', 'auth.adminSignIn', 'auth.createSuperAdmin',
  'auth.requestPasswordResetOTP', 'auth.verifyPasswordResetOTP', 'auth.resetPasswordWithOTP',
  // User session (these verify tokens internally)
  'users.meByToken', 'users.adminMeByToken',
  // Products (read-only)
  'products.getAll', 'products.getAllProducts', 'products.getById', 'products.getProductById',
  'products.getProductsByIds', 'products.getRecentlyViewed', 'products.getPersonalizedProducts',
  'products.getRelatedProducts', 'products.getProductStats', 'products.searchProducts',
  'products.searchProductsForNavbar',
  // Categories
  'category.getAllProducts', 'category.getAllSubcategories', 'category.getProductsByCategory',
  // Collections
  'collections.getCollectionBySlug', 'collections.getCollectionProducts', 'collections.getActiveCollections',
  // Reviews (read-only)
  'reviews.getProductReviews', 'reviews.getProductReviewStats',
  // Views & tracking
  'views.addView', 'views.getMostViewedProducts', 'views.getProductViewStats',
  'dailyAccess.requestAccess', 'dailyAccess.getDailyCount',
  'analytics.trackActivity',
]);

export async function POST(request) {
  try {
    const { table, operation, args } = await request.json();
    if (!table || !operation) {
      return NextResponse.json({ error: 'table and operation are required' }, { status: 400 });
    }

    const opKey = `${table}.${operation}`;
    let authUser = null;

    // Verify auth from httpOnly cookie
    const token = request.cookies.get('token')?.value;
    if (token) {
      authUser = verifyToken(token);
    }

    // Require auth for non-public operations
    if (!PUBLIC_OPS.has(opKey) && !authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const result = await executeDataOperation({ table, operation, args: args || {}, authUser });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
