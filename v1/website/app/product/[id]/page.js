'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import { OdometerNumber } from '@/components/SplashWrapper';
import { gsap } from 'gsap';
import { getCachedImage } from '@/lib/mediaCache';
import FallbackImage from '@/components/FallbackImage';
import Footer from '@/components/Footer';

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

// Standalone component to animate individual item on a stagger delay
function FlyingItem({ image, coords, index, total, onComplete }) {
  const ref = useRef(null);
  
  useEffect(() => {
    if (ref.current) {
      // Stagger delay based on index (160ms gap between each item)
      const delay = index * 0.16;
      
      // Calculate side-by-side offset at start so they don't overlap on lift-off (spacing: 44px)
      const offset = total > 1 ? (index - (total - 1) / 2) * 44 : 0;
      const startLeft = coords.startLeft + offset;
      
      gsap.set(ref.current, {
        top: coords.startTop,
        left: startLeft,
        scale: 0.1,
        opacity: 0,
        x: 0,
        y: 0
      });
      
      // Converge back to the menu button coordinates
      const deltaX = coords.endLeft - startLeft;
      const deltaY = coords.endTop - coords.startTop;
      
      const tl = gsap.timeline({
        delay: delay,
        onComplete: onComplete
      });
      
      // Phase 1: Lift-off/reveal from behind the Add to Bag button
      tl.to(ref.current, {
        duration: 0.22,
        scale: 1,
        opacity: 1,
        y: -30,
        ease: 'back.out(1.5)',
        onStart: () => {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(30);
          }
        }
      });
      
      // Phase 2: Runway speed vector accelerating directly to the menu button
      tl.to(ref.current, {
        duration: 0.48,
        x: deltaX,
        y: deltaY - 30, // account for phase 1 lift-off translate offset
        scale: 0.1,
        opacity: 0.2,
        ease: 'power3.in',
        onComplete: () => {
          // Only trigger landing vibration feedback once (on the first arriving item)
          if (index === 0 && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(40);
          }
          // Dispatch event to increment menu count locally
          window.dispatchEvent(new Event('cart-updated'));
        }
      });
    }
  }, [coords, index, total, onComplete]);

  return (
    <FallbackImage 
      ref={ref}
      src={image} 
      alt="Flying Product" 
      className="absolute z-35 object-cover rounded-full border border-white/20 shadow-[0_0_16px_5px_rgba(255,255,255,0.8),0_6px_12px_rgba(0,0,0,0.12)] pointer-events-none"
      style={{
        width: '56px',
        height: '56px',
        position: 'absolute'
      }}
      hideText={true}
      logoSize="w-5 h-5"
    />
  );
}

export default function ProductPage({ params }) {
  const router = useRouter();
  
  // Unwrapping params promise using React.use for compatibility with Next.js 15/16
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`aw_img_cache_${id}`) || '';
    }
    return '';
  });
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [flyingItems, setFlyingItems] = useState([]);
  const [coords, setCoords] = useState({ startTop: 0, startLeft: 0, endTop: 0, endLeft: 0 });
  const sizeSectionRef = useRef(null);

  const handleFlyComplete = useCallback((itemId, index) => {
    setFlyingItems(prev => {
      const remaining = prev.filter(item => item.id !== itemId);
      // When the very last item finishes, show success toast and trigger resets
      if (index === quantity - 1) {
        setShowToast(true);
        setTimeout(() => setAddedToCart(false), 2000);
        setTimeout(() => setShowToast(false), 3000);
      }
      return remaining;
    });
  }, [quantity]);

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
            const cachedUrl = getCachedImage(found.itemId, found.mainImage);
            setActiveImage(cachedUrl);

            // Pre-cache other images in the background
            if (found.otherImages) {
              found.otherImages.forEach((img, idx) => {
                getCachedImage(`${found.itemId}-other-${idx}`, img);
              });
            }
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

  // Flash pulse state when cartCount changes to trigger bounce animation
  useEffect(() => {
    if (cartCount > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 400);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      // Double pulse vibration for warning feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 50, 80]);
      }
      sizeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setSizeError(false), 800);
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
      
      // Calculate coordinates dynamically relative to the mobile mockup container to keep it perfect and local
      const btnEl = document.getElementById('add-to-bag-btn');
      const menuEl = document.getElementById('nav-bag-btn');
      const frameEl = document.getElementById('mobile-frame');
      
      if (btnEl && menuEl) {
        const btnRect = btnEl.getBoundingClientRect();
        const menuRect = menuEl.getBoundingClientRect();
        const frameRect = frameEl ? frameEl.getBoundingClientRect() : { top: 0, left: 0 };
        
        // Centering calculation relative to the mockup frame container (image size: 56x56)
        const startTop = btnRect.top - frameRect.top + btnRect.height / 2 - 28;
        const startLeft = btnRect.left - frameRect.left + btnRect.width / 2 - 28;
        const endTop = menuRect.top - frameRect.top + menuRect.height / 2 - 28;
        const endLeft = menuRect.left - frameRect.left + menuRect.width / 2 - 28;

        setCoords({ startTop, startLeft, endTop, endLeft });
      } else {
        // Fallback defaults relative to viewport
        setCoords({
          startTop: window.innerHeight - 60 - 28,
          startLeft: window.innerWidth - 130 - 28,
          endTop: 12 - 28,
          endLeft: window.innerWidth - 48 - 28
        });
      }
      
      setAddedToCart(true);
      
      // Spawn staggered items based on selected quantity
      const newItems = [];
      for (let i = 0; i < quantity; i++) {
        newItems.push({
          id: `${Date.now()}-${i}-${Math.random()}`,
          image: product.mainImage,
          index: i
        });
      }
      setFlyingItems(newItems);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 bg-white relative pb-28">
        {/* Sleek Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-zinc-950 hover:text-black">
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          {/* <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-400">Product details</span> */}
          <div className="w-14" />
        </header>

        {/* Main Product Image Skeleton */}
        <div className="relative w-full aspect-4/5 bg-zinc-100 animate-pulse animate-shimmer border-b border-zinc-100/50" />

        {/* Thumbnails Skeleton */}
        <div className="flex gap-2 px-4 py-3">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="w-12 h-15 rounded-[1px] bg-zinc-100 animate-pulse animate-shimmer border border-zinc-100/50"
            />
          ))}
        </div>

        {/* Info details Skeleton */}
        <div className="px-4 py-4 flex flex-col gap-2.5">
          {/* Category */}
          <div className="h-2 bg-zinc-50 animate-pulse animate-shimmer rounded-[1px] w-1/6" />
          {/* Name */}
          <div className="h-4 bg-zinc-100 animate-pulse animate-shimmer rounded-[1px] w-1/2 mt-1" />
          {/* Price */}
          <div className="h-3.5 bg-zinc-100 animate-pulse animate-shimmer rounded-[1px] w-1/8 mt-1" />

          {/* Color Separator */}
          <div className="mt-4 border-t border-zinc-100 pt-3 flex flex-col gap-1.5">
            <div className="h-2 bg-zinc-50 animate-pulse animate-shimmer rounded-[1px] w-1/12" />
            <div className="h-3 bg-zinc-100 animate-pulse animate-shimmer rounded-[1px] w-1/5" />
          </div>

          {/* Size Selector Separator */}
          <div className="mt-4 border-t border-zinc-100 pt-3 flex flex-col gap-2">
            <div className="h-2 bg-zinc-50 animate-pulse animate-shimmer rounded-[1px] w-1/6" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-[1px] bg-zinc-100 animate-pulse animate-shimmer border border-zinc-100/50" />
              ))}
            </div>
          </div>

          {/* Quantity Select Separator */}
          <div className="mt-4 border-t border-zinc-100 pt-3 flex flex-col gap-1.5">
            <div className="h-2 bg-zinc-50 animate-pulse animate-shimmer rounded-[1px] w-1/8" />
            <div className="w-24 h-7 bg-zinc-100 animate-pulse animate-shimmer rounded-[1px]" />
          </div>
        </div>

        {/* Sticky Bottom Actions Bar Skeleton */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-100 px-4 py-3 flex items-center justify-between max-w-[450px] mx-auto shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col gap-1.5">
            <div className="h-2 bg-zinc-50 animate-pulse animate-shimmer rounded-[1px] w-12" />
            <div className="h-3 bg-zinc-100 animate-pulse animate-shimmer rounded-[1px] w-16" />
          </div>
          <div className="w-32 h-10 bg-zinc-100 animate-pulse animate-shimmer rounded-[1px]" />
        </div>
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
    <>
      <div className="flex flex-col flex-1 bg-white relative pb-28 animate-slide-up-fade">
      {/* Sleek Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-100 px-4 py-3 flex items-center justify-center">
        <button onClick={() => router.back()} className="absolute left-4 text-zinc-950 hover:text-black">
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
        {/* <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-400">Product details</span> */}
        <div className="absolute right-20 top-1/2 -translate-y-1/2 flex items-center">
          <Link href="/cart" className="flex items-center gap- text-zinc-950 hover:text-black hover:opacity-80 transition-opacity">
            {/* <span className="text-[9px] tracking-[0.2em] uppercase font-bold">Bag</span> */}
            <div id="nav-bag-btn" className={`relative ${pulse ? 'animate-bounce-subtle' : ''}`}>
              <img src="/icons/bag_t.png" alt="Bag" className="w-10 h-10 object-contain" />
              {cartCount > 0 && (
                <span className="absolute top-[1px] -right-[1px] bg-black text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>
        </div>
      </header>

      {/* Premium Minimalist Toast Notification */}
      <div 
        className={`fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-[418px] bg-zinc-950 text-white px-4 py-3 flex items-center justify-between shadow-xl rounded-[2px] transition-all duration-500 ease-out ${
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2">
          {/* <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /> */}
          <span className="text-[9px] tracking-[0.2em] uppercase font-bold">Added to Bag</span>
        </div>
        <Link href="/cart" className="text-[9px] tracking-[0.2em] uppercase font-bold text-white border-b border-white pb-0.5 hover:opacity-85 transition-opacity">
          View Bag &rarr;
        </Link>
      </div>

      {/* Invisible blocker to prevent routing/clicks while flying */}
      {flyingItems.length > 0 && typeof document !== 'undefined' && createPortal(
        <div className="absolute inset-0 z-99 cursor-default pointer-events-auto bg-transparent" />,
        document.getElementById('mobile-frame') || document.body
      )}

      {/* Flying Product Images (Portaled to mobile-frame, popping up one-by-one and flying to cart) */}
      {flyingItems.map((item) => typeof document !== 'undefined' && createPortal(
        <FlyingItem
          key={item.id}
          image={item.image}
          coords={coords}
          index={item.index}
          total={flyingItems.length}
          onComplete={() => handleFlyComplete(item.id, item.index)}
        />,
        document.getElementById('mobile-frame') || document.body
      ))}

      {/* Main product Image */}
      <div className="relative w-full aspect-4/5 bg-zinc-50 border-b border-zinc-100 group">
        <FallbackImage 
          src={activeImage} 
          alt={product.name} 
          className="w-full h-full object-cover" 
          logoSize="w-8 h-8"
        />
      
      </div>

      {/* Other Images (Thumbnails) */}
      {product.otherImages && product.otherImages.length > 0 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveImage(getCachedImage(product.itemId, product.mainImage))}
            className={`relative w-12 h-15 rounded-[1px] overflow-hidden border ${activeImage === getCachedImage(product.itemId, product.mainImage) ? 'border-black' : 'border-zinc-200'}`}
          >
            <FallbackImage 
              src={getCachedImage(product.itemId, product.mainImage)} 
              className="w-full h-full object-cover" 
              hideText={true}
              logoSize="w-4 h-4"
            />
          </button>
          {product.otherImages.map((img, i) => {
            const cachedOther = getCachedImage(`${product.itemId}-other-${i}`, img);
            return (
              <button
                key={i}
                onClick={() => setActiveImage(cachedOther)}
                className={`relative w-12 h-15 rounded-[1px] overflow-hidden border ${activeImage === cachedOther ? 'border-black' : 'border-zinc-200'}`}
              >
                <FallbackImage 
                  src={cachedOther} 
                  className="w-full h-full object-cover" 
                  hideText={true}
                  logoSize="w-4 h-4"
                />
              </button>
            );
          })}
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
        <div ref={sizeSectionRef} className={`mt-4 border-t border-zinc-100 pt-3 transition-all duration-300 ${sizeError ? 'animate-shake' : ''}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[8px] tracking-wider uppercase font-medium transition-colors duration-300 ${sizeError ? 'text-red-500 font-bold animate-pulse' : 'text-zinc-400'}`}>
              {sizeError ? 'Please Select a Size' : 'Select Size'}
            </span>
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
                  onClick={() => {
                    setSelectedSize(size);
                    setSizeError(false);
                  }}
                  className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold rounded-[1px] border transition-all ${
                    !hasStock
                      ? 'border-zinc-100 text-zinc-300 relative line-through cursor-not-allowed'
                      : selectedSize === size
                      ? 'border-black bg-black text-white'
                      : sizeError
                      ? 'border-red-400 text-red-500 hover:border-red-500 animate-pulse'
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
      <Footer />
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-100 px-4 py-3 flex items-center justify-between max-w-[430px] mx-auto shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col">
          <span className="text-[8px] uppercase text-zinc-400 font-medium tracking-wider">Total Price</span>
          <div className="flex items-center mt-0.5">
            <OdometerNumber 
              value={`₹${(product.price * quantity).toLocaleString('en-IN')}`} 
              className="text-xs font-bold text-black" 
            />
          </div>
        </div>
        <button
          id="add-to-bag-btn"
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
    </>
  );
}
