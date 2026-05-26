import { NextResponse } from 'next/server';
import { convexClient } from '@/lib/convex';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    // Fetch products from Convex using the webStore:getAllProducts query
    // Passing a large limit to retrieve all products for client filtering
    let products = await convexClient.query('webStore:getAllProducts', { limit: 1000 });
    
    // Ensure we filter out hidden and deleted products (just in case they aren't by the query)
    products = products.filter(p => !p.isHidden && !p.isDeleted);
    
    // Apply Category filtering
    if (category && category !== 'All') {
      const normalizedCategory = category.toLowerCase().trim();
      products = products.filter(p => {
        const pCat = (p.category || '').toLowerCase().trim();
        if (normalizedCategory === 'apparel' || normalizedCategory === 'apparel / clothing') {
          return pCat === 'apparel' || pCat === 'apparel / clothing';
        }
        return pCat === normalizedCategory;
      });
    }
    
    // Apply Search Query filtering
    if (search) {
      const normalizedSearch = search.toLowerCase().trim();
      products = products.filter(p => 
        (p.name || '').toLowerCase().includes(normalizedSearch) || 
        (p.itemId || '').toLowerCase().includes(normalizedSearch) ||
        (p.description || '').toLowerCase().includes(normalizedSearch)
      );
    }
    
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Failed to fetch products from Convex:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
