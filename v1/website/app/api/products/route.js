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
    console.error('Failed to fetch products from Convex, falling back to mock data:', error);
    
    // Premium mock products for offline local testing
    const mockProducts = [
      {
        _id: "mock-dusty",
        itemId: "dusty-fade-baggy-jeans",
        name: "Dusty Fade Baggy Jeans / Unisex",
        mainImage: "/home/banner_left.webp",
        category: "apparel",
        price: 3200,
        inStock: true,
        color: "Vintage Grey"
      },
      {
        _id: "mock-black",
        itemId: "black-fade-baggy-jeans",
        name: "Black Fade Baggy Jeans / Unisex",
        mainImage: "/home/banner_right_top.webp",
        category: "apparel",
        price: 3000,
        inStock: true,
        color: "Faded Black"
      },
      {
        _id: "mock-glacier",
        itemId: "glacier-wash-baggy-jeans",
        name: "Glacier Wash Baggy Jeans / Unisex",
        mainImage: "/home/banner_right_bottom.webp",
        category: "apparel",
        price: 3400,
        inStock: true,
        color: "Glacier Blue"
      }
    ];
    
    // Apply client-side filters on mock products to keep search/filters working
    let filtered = [...mockProducts];
    if (category && category !== 'All') {
      const normalizedCategory = category.toLowerCase().trim();
      filtered = filtered.filter(p => p.category === normalizedCategory);
    }
    if (search) {
      const normalizedSearch = search.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(normalizedSearch) || 
        p.itemId.toLowerCase().includes(normalizedSearch)
      );
    }

    return NextResponse.json({ success: true, products: filtered });
  }
}
