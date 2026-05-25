import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

const MOCK_PRODUCTS = [
  {
    itemId: 'aw-apparel-001',
    name: 'Oversized Cotton Tee',
    category: 'Apparel / Clothing',
    price: 1499,
    description: 'Heavyweight 240GSM combed cotton t-shirt with a relaxed drop-shoulder fit. Styled with a small high-density chest print and ribbed collar.',
    mainImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    otherImages: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80'],
    color: 'Vintage White',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    sizeStock: { S: 10, M: 15, L: 8, XL: 5, XXL: 2 },
    inStock: true,
  },
  {
    itemId: 'aw-apparel-002',
    name: 'Minimal Linen Shirt',
    category: 'Apparel / Clothing',
    price: 2499,
    description: 'Premium organic linen weave shirt. Breathable, relaxed, and styled with chest utility pockets and natural horn buttons.',
    mainImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    otherImages: ['https://images.unsplash.com/photo-1621072156002-e2fcc104e761?w=800&auto=format&fit=crop&q=80'],
    color: 'Sand Beige',
    availableSizes: ['S', 'M', 'L', 'XL'],
    sizeStock: { S: 5, M: 8, L: 10, XL: 4 },
    inStock: true,
    sizeDisplayType: 'numeric',
  },
  {
    itemId: 'aw-apparel-003',
    name: 'Ribbed Knit Sweater',
    category: 'Apparel / Clothing',
    price: 3499,
    description: 'Mediumweight wool blend knitted sweater with refined micro-ribbing. Offers a snug structured silhouette.',
    mainImage: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=800&auto=format&fit=crop&q=80',
    otherImages: [],
    color: 'Slate Gray',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    sizeStock: { S: 4, M: 7, L: 5, XL: 3, XXL: 1 },
    inStock: true,
  },
  {
    itemId: 'aw-footwear-001',
    name: 'Classic White Trainers',
    category: 'Footwear',
    price: 4999,
    description: 'Handcrafted full-grain calfskin leather low-tops. Minimal branding with a cushioned cork insole and rubber cupsole.',
    mainImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
    otherImages: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80'],
    color: 'Chalk White',
    availableSizes: ['S', 'M', 'L', 'XL'],
    sizeStock: { S: 3, M: 6, L: 8, XL: 5 },
    inStock: true,
  },
  {
    itemId: 'aw-footwear-002',
    name: 'Chelsea Suede Boots',
    category: 'Footwear',
    price: 6999,
    description: 'Water-resistant Italian split-suede leather boots. Styled with comfortable elastic side gores and pull tabs.',
    mainImage: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80',
    otherImages: [],
    color: 'Tan Suede',
    availableSizes: ['S', 'M', 'L', 'XL'],
    sizeStock: { S: 2, M: 4, L: 5, XL: 3 },
    inStock: true,
  },
  {
    itemId: 'aw-headwear-001',
    name: 'Structured Dad Cap',
    category: 'Headwear',
    price: 999,
    description: 'Unstructured six-panel profile in heavy washed cotton twill. Features an adjustable self-fabric back strap.',
    mainImage: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
    otherImages: [],
    color: 'Olive Drab',
    availableSizes: ['S', 'M', 'L'],
    sizeStock: { S: 5, M: 10, L: 10 },
    inStock: true,
  },
  {
    itemId: 'aw-headwear-002',
    name: 'Merino Wool Beanie',
    category: 'Headwear',
    price: 1299,
    description: 'Superfine 100% merino wool knit beanie. Offers exceptional warmth and comfort with a classic double-fold cuff.',
    mainImage: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&auto=format&fit=crop&q=80',
    otherImages: [],
    color: 'Ink Black',
    availableSizes: ['S', 'M', 'L'],
    sizeStock: { S: 8, M: 12, L: 12 },
    inStock: true,
  },
  {
    itemId: 'aw-eyewear-001',
    name: 'Acetate D-Frame Sunglasses',
    category: 'Eyewear',
    price: 1999,
    description: 'Premium hand-polished cellulose acetate frame with 100% UVA/UVB protection polarized dark gray lenses.',
    mainImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
    otherImages: [],
    color: 'Tortoiseshell',
    availableSizes: ['S', 'M', 'L'],
    sizeStock: { S: 5, M: 8, L: 8 },
    inStock: true,
    sizeDisplayType: 'numeric',
  },
  {
    itemId: 'aw-eyewear-002',
    name: 'Minimalist Round Wireframes',
    category: 'Eyewear',
    price: 2299,
    description: 'Ultra lightweight titanium alloy round wireframes with anti-reflective, blue-light filtering clear lenses.',
    mainImage: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
    otherImages: [],
    color: 'Brushed Gold',
    availableSizes: ['S', 'M', 'L'],
    sizeStock: { S: 4, M: 6, L: 6 },
    inStock: true,
  }
];

export async function GET(request) {
  try {
    await dbConnect();
    
    // Check if products exist in MongoDB
    let count = await Product.countDocuments({ isDeleted: { $ne: true } });
    
    if (count === 0) {
      console.log('No products found in MongoDB. Seeding mock items...');
      await Product.insertMany(MOCK_PRODUCTS);
    }
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    const filter = { isDeleted: { $ne: true }, isHidden: { $ne: true } };
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
