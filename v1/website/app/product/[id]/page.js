import { convexClient } from '@/lib/convex';
import ProductClient from './ProductClient';

export async function generateMetadata({ params }) {
  const unwrappedParams = await params;
  const id = unwrappedParams.id;
  console.log(`[Metadata] Generating for product ID: "${id}"`);
  
  let product = null;
  if (id === 'aw-carry-bag') {
    product = {
      name: 'Aesthetx Ways Bag',
      description: 'Premium Aesthetx Ways Carry Bag. Heavyweight and styled with structural stability to keep your purchases safe and premium.',
      mainImage: '/icons/bag.png',
    };
  } else {
    try {
      product = await convexClient.query('webStore:getProductByItemId', { itemId: id });
      console.log(`[Metadata] Convex query result for "${id}":`, product ? `Found "${product.name}"` : 'Not found');
    } catch (error) {
      console.error(`[Metadata] Convex query failed for "${id}":`, error);
    }
  }

  if (!product) {
    console.log(`[Metadata] Falling back to default metadata for "${id}"`);
    return {
      title: 'Product Details | Aesthetx Ways',
      description: 'Sleek, minimalistic clothing, footwear, headwear, and eyewear.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aesthetxways.com';
  
  // Resolve absolute image URL for previews
  let imageUrl = '';
  if (product.mainImage) {
    imageUrl = product.mainImage.startsWith('http')
      ? product.mainImage
      : `${baseUrl}${product.mainImage}`;
  }

  return {
    title: `${product.name} | Aesthetx Ways`,
    description: product.description || `Buy ${product.name} on Aesthetx Ways`,
    openGraph: {
      title: product.name,
      description: product.description || `Buy ${product.name} on Aesthetx Ways`,
      url: `${baseUrl}/product/${id}`,
      siteName: 'Aesthetx Ways',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 800,
          height: 1000,
          alt: product.name,
        },
      ] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || `Buy ${product.name} on Aesthetx Ways`,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  const unwrappedParams = await params;
  const id = unwrappedParams.id;
  
  let product = null;
  if (id === 'aw-carry-bag') {
    product = {
      _id: 'aw-carry-bag',
      itemId: 'aw-carry-bag',
      name: 'Aesthetx Ways Bag',
      mainImage: '/icons/bag.png',
      otherImages: [],
      category: 'accessories',
      price: 20,
      inStock: true,
      color: 'Default',
      description: 'Premium Aesthetx Ways Carry Bag. Heavyweight and styled with structural stability to keep your purchases safe and premium.',
      sizeDisplayType: 'free',
      availableSizes: ['OS'],
      sizeStock: { 'OS': 999 }
    };
  } else {
    try {
      product = await convexClient.query('webStore:getProductByItemId', { itemId: id });
    } catch (error) {
      console.error('Failed to fetch product on server:', error);
    }
  }

  return <ProductClient params={params} initialProduct={product} />;
}
