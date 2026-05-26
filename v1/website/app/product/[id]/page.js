'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Plus, Minus, Check } from 'lucide-react';

const SIZE_MAP = {
  S: '28',
  M: '30',
  L: '32',
  XL: '34',
  XXL: '36',
  XXXL: '38',
  s: '28',
  m: '30',
  l: '32',
  xl: '34',
  xxl: '36',
  xxxl: '38',
};

const getDisplaySize = (size, sizeDisplayType) => {
  if (sizeDisplayType === 'numeric' && SIZE_MAP[size]) {
    return SIZE_MAP[size];
  }
  return size;
};

export default function ProductPage({ params }) {
  const router = useRouter();
  
  // Unwrapping params promise using React.use for compatibility with Next.js 15/16
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        // We call the products endpoint filter by search or fetch all to find the product
        const res = await fetch(`/api/products`);
        const data = await res.json();
        if (data.success) {
          const found = data.products.find(p => p.itemId === id);
          if (found) {
            setProduct(found);
            setActiveImage(found.mainImage);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // Load cart count
  useEffect(() => {
    function updateCartCount() {
      if (typeof window !== 'undefined') {
        const cart = JSON.parse(localStorage.getItem('aw_cart') || '[]');
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      }
    }
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-updated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    if (typeof window !== 'undefined' && product) {
      const cart = JSON.parse(localStorage.getItem('aw_cart') || '[]');
      const existingIndex = cart.findIndex(
        (item) => item.productId === product.itemId && item.size === selectedSize
      );

      if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          productId: product.itemId,
          name: product.name,
          image: product.mainImage,
          price: product.price,
          size: selectedSize,
          quantity: quantity,
          sizeDisplayType: product.sizeDisplayType || 'alpha',
        });
      }

      localStorage.setItem('aw_cart', JSON.stringify(cart));
      
      // Dispatch custom event to notify components
      window.dispatchEvent(new Event('cart-updated'));
      
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col bg-white justify-center items-center py-32">
        <span className="text-[10px] tracking-widest uppercase text-zinc-400 animate-pulse">Loading product...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-1 flex-col bg-white justify-center items-center py-32 text-center px-4">
        <span className="text-[10px] tracking-widest uppercase text-zinc-500 mb-4">Product not found</span>
        <Link href="/" className="text-[9px] tracking-widest uppercase font-bold border-b border-black pb-1">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white relative pb-28">
      {/* Sleek Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-zinc-950 hover:text-black">
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
        <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-400">Product details</span>
        <div className="w-14" />
      </header>

      {/* Main product Image */}
      <div className="relative w-full aspect-4/5 bg-zinc-50 border-b border-zinc-100 group">
        <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 z-10 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-300">
          <img src="/logo_t.svg" alt="Watermark Logo" className="w-6 h-6 object-contain" />
        </div>
      </div>

      {/* Other Images (Thumbnails) */}
      {product.otherImages && product.otherImages.length > 0 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveImage(product.mainImage)}
            className={`w-12 h-15 rounded-[1px] overflow-hidden border ${activeImage === product.mainImage ? 'border-black' : 'border-zinc-200'}`}
          >
            <img src={product.mainImage} className="w-full h-full object-cover" />
          </button>
          {product.otherImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(img)}
              className={`w-12 h-15 rounded-[1px] overflow-hidden border ${activeImage === img ? 'border-black' : 'border-zinc-200'}`}
            >
              <img src={img} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Info details */}
      <div className="px-4 py-4 flex flex-col">
        <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-medium">
          {product.category}
        </span>
        <h1 className="text-sm font-bold tracking-wide uppercase text-black mt-1">
          {product.name}
        </h1>
        <span className="text-[11px] font-bold text-black mt-1">
          ₹{product.price.toLocaleString('en-IN')}
        </span>

        <div className="mt-4 border-t border-zinc-100 pt-3">
          <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-medium">Color</span>
          <span className="text-[10px] text-black font-medium block mt-0.5">{product.color || 'Default'}</span>
        </div>

        {/* Size Selection */}
        <div className="mt-4 border-t border-zinc-100 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-medium">Select Size</span>
            {selectedSize && (
              <span className="text-[9px] text-zinc-400 uppercase font-bold">
                Selected: {getDisplaySize(selectedSize, product.sizeDisplayType)}
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            {product.availableSizes?.map((size) => {
              const stock = product.sizeStock?.[size] || 0;
              const hasStock = stock > 0;
              return (
                <button
                  key={size}
                  disabled={!hasStock}
                  onClick={() => setSelectedSize(size)}
                  className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold rounded-[1px] border transition-all ${
                    !hasStock
                      ? 'border-zinc-100 text-zinc-300 relative line-through cursor-not-allowed'
                      : selectedSize === size
                      ? 'border-black bg-black text-white'
                      : 'border-zinc-200 text-black hover:border-zinc-400'
                  }`}
                >
                  {getDisplaySize(size, product.sizeDisplayType)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity Select */}
        <div className="mt-4 border-t border-zinc-100 pt-3">
          <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-medium">Quantity</span>
          <div className="flex items-center border border-zinc-200 w-24 h-7 mt-2 rounded-[1px]">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="flex-1 flex justify-center items-center text-zinc-500 hover:text-black"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <span className="text-[10px] font-bold text-black flex-1 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="flex-1 flex justify-center items-center text-zinc-500 hover:text-black"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Description Accordion */}
        <div className="mt-4 border-t border-zinc-100 pt-3">
          <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-medium">Details</span>
          <p className="text-[9.5px] leading-relaxed text-zinc-600 mt-1.5 whitespace-pre-line">
            {product.description || 'No additional details listed for this product.'}
          </p>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-100 px-4 py-3 flex items-center justify-between max-w-[450px] mx-auto shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col">
          <span className="text-[8px] uppercase text-zinc-400 font-medium tracking-wider">Total Price</span>
          <span className="text-xs font-bold text-black">
            ₹{(product.price * quantity).toLocaleString('en-IN')}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`flex items-center justify-center gap-1.5 text-[9px] tracking-[0.2em] uppercase font-bold py-3 px-8 rounded-[1px] transition-colors ${
            !product.inStock
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              : addedToCart
              ? 'bg-zinc-900 text-white'
              : 'bg-black text-white hover:bg-zinc-900'
          }`}
        >
          {addedToCart ? (
            <>
              <Check className="w-3 h-3 stroke-3" />
              Added
            </>
          ) : (
            'Add to Bag'
          )}
        </button>
      </div>
    </div>
  );
}
