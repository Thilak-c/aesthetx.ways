'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Plus, Minus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { OdometerNumber } from '@/components/SplashWrapper';
import { gsap } from 'gsap';
import { getCachedImage } from '@/lib/mediaCache';
import FallbackImage from '@/components/FallbackImage';
import SuggestionBar from '@/components/SuggestionBar';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sliderRef = useRef(null);
  const isScrollingRef = useRef(false);
  const ignoreNextScrollEffectRef = useRef(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [flyingItems, setFlyingItems] = useState([]);
  const [coords, setCoords] = useState({ startTop: 0, startLeft: 0, endTop: 0, endLeft: 0 });
  const sizeSectionRef = useRef(null);
  const cartTimerRef = useRef(null);
  const [shakeSuggestions, setShakeSuggestions] = useState(false);
  const suggestionSectionRef = useRef(null);
  const [showedSocksNudge, setShowedSocksNudge] = useState(false);
  const [toastMessage, setToastMessage] = useState('Added to Bag');

  const handleFlyComplete = useCallback((itemId, index) => {
    setFlyingItems(prev => {
      const remaining = prev.filter(item => item.id !== itemId);
      // When the very last animated item finishes, show success toast
      if (remaining.length === 0) {
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          // Wait for the fade animation to complete, then reset the toast message
          setTimeout(() => {
            setToastMessage('Added to Bag');
          }, 500);
        }, 3000);
      }
      return remaining;
    });
  }, []);

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        // We call the products endpoint filter by search or fetch all to find the product
        const res = await fetch(`/api/products`);
        const data = await res.json();
        if (data.success) {
          let found = data.products.find(p => p.itemId === id);
          if (!found && id === 'aw-carry-bag') {
            found = {
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
          }
          if (found) {
            setProduct(found);

            // Auto-select size if it's a free-size product (socks, caps, cap, or sizeDisplayType is free)
            const catLower = found.category?.toLowerCase().trim();
            const isFreeSize = found.sizeDisplayType === 'free' || 
                               catLower === 'socks' || 
                               catLower === 'cap' || 
                               catLower === 'caps' ||
                               (found.availableSizes?.length === 1 && found.availableSizes?.[0] === 'OS');

            if (isFreeSize && found.availableSizes?.includes('OS')) {
              setSelectedSize('OS');
            } else if (isFreeSize && found.availableSizes?.length === 1) {
              setSelectedSize(found.availableSizes[0]);
            }

            // Pre-cache main and other images in the background
            getCachedImage(found.itemId, found.mainImage);
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

  // Load cart count & cleanup timer
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
      if (cartTimerRef.current) {
        clearTimeout(cartTimerRef.current);
      }
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

  // Derived array of all product images
  const productImages = product
    ? [
      getCachedImage(product.itemId, product.mainImage),
      ...(product.otherImages || []).map((img, idx) =>
        getCachedImage(`${product.itemId}-other-${idx}`, img)
      ),
    ]
    : [];

  const isSocksProduct = product?.category?.toLowerCase() === 'socks';
  const catLower = product?.category?.toLowerCase().trim();
  const isFreeSizeProduct = product?.sizeDisplayType === 'free' || 
                             catLower === 'socks' || 
                             catLower === 'cap' || 
                             catLower === 'caps' ||
                             (product?.availableSizes?.length === 1 && product?.availableSizes?.[0] === 'OS');
  const suggestionCategory = isSocksProduct ? 'pants' : 'socks';
  const suggestionTitle = isSocksProduct
    ? "Complete your aesthetic with our pants"
    : "For ₹199, don't lose aesthetic in your feet";

  const handleScroll = () => {
    if (isScrollingRef.current) return;
    if (sliderRef.current && product) {
      const container = sliderRef.current;
      const width = container.clientWidth;
      if (width > 0) {
        const newIndex = Math.round(container.scrollLeft / width);
        if (newIndex !== currentImageIndex && newIndex >= 0 && newIndex < productImages.length) {
          ignoreNextScrollEffectRef.current = true;
          setCurrentImageIndex(newIndex);
        }
      }
    }
  };

  useEffect(() => {
    if (ignoreNextScrollEffectRef.current) {
      ignoreNextScrollEffectRef.current = false;
      return;
    }
    if (sliderRef.current && product) {
      const container = sliderRef.current;
      const scrollTarget = currentImageIndex * container.clientWidth;
      if (Math.abs(container.scrollLeft - scrollTarget) > 10) {
        isScrollingRef.current = true;
        container.scrollTo({
          left: scrollTarget,
          behavior: 'smooth'
        });
        const timer = setTimeout(() => {
          isScrollingRef.current = false;
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [currentImageIndex, product]);

  const handleAddToCart = () => {
    if (addedToCart) {
      router.push('/cart');
      return;
    }

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

    if (!showedSocksNudge) {
      // Step 1: Just scroll down to socks suggestions and shake/nudge them
      setShowedSocksNudge(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 50, 80]);
      }
      suggestionSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setShakeSuggestions(true);
      setTimeout(() => setShakeSuggestions(false), 800);
      return;
    }

    // Step 2: "Add anyway" clicked (nudge is active and button clicked again)
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

      let currentCoords = { startTop: 0, startLeft: 0, endTop: 0, endLeft: 0 };
      if (btnEl && menuEl) {
        const btnRect = btnEl.getBoundingClientRect();
        const menuRect = menuEl.getBoundingClientRect();
        const frameRect = frameEl ? frameEl.getBoundingClientRect() : { top: 0, left: 0 };
        const scrollTop = frameEl ? frameEl.scrollTop : 0;

        // Centering calculation relative to the mockup frame container (image size: 56x56)
        currentCoords.startTop = btnRect.top - frameRect.top + scrollTop + btnRect.height / 2 - 28;
        currentCoords.startLeft = btnRect.left - frameRect.left + btnRect.width / 2 - 28;
        currentCoords.endTop = menuRect.top - frameRect.top + scrollTop + menuRect.height / 2 - 28;
        currentCoords.endLeft = menuRect.left - frameRect.left + menuRect.width / 2 - 28;

        setCoords(currentCoords);
      } else {
        // Fallback defaults relative to viewport
        currentCoords = {
          startTop: window.innerHeight - 60 - 28,
          startLeft: window.innerWidth - 130 - 28,
          endTop: 12 - 28,
          endLeft: window.innerWidth - 48 - 28
        };
        setCoords(currentCoords);
      }

      setToastMessage("Ig U dont want your feet to be happy 🙃");
      setAddedToCart(true);

      // Start 3-second cooldown to reset button back to "Add to Bag"
      if (cartTimerRef.current) {
        clearTimeout(cartTimerRef.current);
      }
      cartTimerRef.current = setTimeout(() => {
        setAddedToCart(false);
        setShowedSocksNudge(false);
      }, 3000);

      // Spawn staggered items based on selected quantity, capped at 3 for animation performance
      const animCount = Math.min(quantity, 3);
      const newItems = [];
      for (let i = 0; i < animCount; i++) {
        newItems.push({
          id: `${Date.now()}-${i}-${Math.random()}`,
          image: product.mainImage,
          index: i,
          coords: currentCoords
        });
      }
      setFlyingItems(newItems);
      setShowedSocksNudge(false);
    }
  };

  const addBothToCart = (suggestedProduct, clickedElement) => {
    if (typeof window !== 'undefined' && product) {
      const cart = JSON.parse(localStorage.getItem('aw_cart') || '[]');

      // 1. Add main product
      const existingMainIndex = cart.findIndex(
        (item) => item.productId === product.itemId && item.size === selectedSize
      );
      if (existingMainIndex > -1) {
        cart[existingMainIndex].quantity += quantity;
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

      // 2. Add suggested product
      const suggestedSize = (suggestedProduct.availableSizes && suggestedProduct.availableSizes.length > 0)
        ? suggestedProduct.availableSizes[0]
        : 'OS';

      const existingSuggestedIndex = cart.findIndex(
        (item) => item.productId === suggestedProduct.itemId && item.size === suggestedSize
      );
      if (existingSuggestedIndex > -1) {
        cart[existingSuggestedIndex].quantity += 1;
      } else {
        cart.push({
          productId: suggestedProduct.itemId,
          name: suggestedProduct.name,
          image: suggestedProduct.mainImage,
          price: suggestedProduct.price,
          size: suggestedSize,
          quantity: 1,
          sizeDisplayType: suggestedProduct.sizeDisplayType || 'alpha',
        });
      }

      localStorage.setItem('aw_cart', JSON.stringify(cart));

      // Calculate coordinates dynamically relative to the mobile mockup container
      const btnEl = document.getElementById('add-to-bag-btn');
      const menuEl = document.getElementById('nav-bag-btn');
      const frameEl = document.getElementById('mobile-frame');
      const frameRect = frameEl ? frameEl.getBoundingClientRect() : { top: 0, left: 0 };

      const scrollTop = frameEl ? frameEl.scrollTop : 0;

      let endTop = 12 - 28 + scrollTop;
      let endLeft = window.innerWidth - 48 - 28;
      if (menuEl) {
        const menuRect = menuEl.getBoundingClientRect();
        endTop = menuRect.top - frameRect.top + scrollTop + menuRect.height / 2 - 28;
        endLeft = menuRect.left - frameRect.left + menuRect.width / 2 - 28;
      }

      // Main product coordinates (flies from the button)
      let mainStartTop = window.innerHeight - 60 - 28 + scrollTop;
      let mainStartLeft = window.innerWidth - 130 - 28;
      if (btnEl) {
        const btnRect = btnEl.getBoundingClientRect();
        mainStartTop = btnRect.top - frameRect.top + scrollTop + btnRect.height / 2 - 28;
        mainStartLeft = btnRect.left - frameRect.left + btnRect.width / 2 - 28;
      }
      const mainCoords = { startTop: mainStartTop, startLeft: mainStartLeft, endTop, endLeft };

      // Suggested product coordinates (flies from the clicked suggestion element)
      let suggestedStartTop = window.innerHeight / 2 + scrollTop;
      let suggestedStartLeft = window.innerWidth / 2;
      if (clickedElement) {
        const suggestedRect = clickedElement.getBoundingClientRect();
        suggestedStartTop = suggestedRect.top - frameRect.top + scrollTop + suggestedRect.height / 2 - 28;
        suggestedStartLeft = suggestedRect.left - frameRect.left + suggestedRect.width / 2 - 28;
      }
      const suggestedCoords = { startTop: suggestedStartTop, startLeft: suggestedStartLeft, endTop, endLeft };

      setCoords(mainCoords);

      setToastMessage("Added to Bag");
      setAddedToCart(true);

      // Start 3-second cooldown to reset button back to "Add to Bag"
      if (cartTimerRef.current) {
        clearTimeout(cartTimerRef.current);
      }
      cartTimerRef.current = setTimeout(() => {
        setAddedToCart(false);
        setShowedSocksNudge(false);
      }, 3000);

      // Spawn staggered items
      const mainAnimCount = Math.min(quantity, 3);
      const newItems = [];
      for (let i = 0; i < mainAnimCount; i++) {
        newItems.push({
          id: `main-${Date.now()}-${i}-${Math.random()}`,
          image: product.mainImage,
          index: i,
          coords: mainCoords
        });
      }
      // Append suggested item flying animation
      newItems.push({
        id: `suggested-${Date.now()}-${Math.random()}`,
        image: suggestedProduct.mainImage,
        index: mainAnimCount,
        coords: suggestedCoords
      });

      setFlyingItems(newItems);
      setShowedSocksNudge(false);
    }
  };

  const handleSuggestionClick = (suggestedProduct, e) => {
    if (showedSocksNudge) {
      e.preventDefault();
      addBothToCart(suggestedProduct, e.currentTarget);
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
        <div className="relative w-full aspect-[4/5] bg-zinc-100 animate-pulse animate-shimmer border-b border-zinc-100/50" />

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
        <div className="fixed bottom-12 left-0 right-0 z-40 bg-white border-t border-zinc-100 px-4 py-3 flex items-center justify-between max-w-[430px] mx-auto shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
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
                  <span className="absolute top-[1px] -right-[1px] bg-black text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold overflow-hidden">
                    <OdometerNumber value={cartCount} className="text-white text-[8px] font-bold" />
                  </span>
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Premium Minimalist Sticky Toast Notification */}
        <div className="sticky top-12 left-0 right-0 z-50 h-0 w-full pointer-events-none px-4">
          <div
            className={`absolute left-4 right-4 bg-zinc-950 text-white px-4 py-3 flex items-center justify-between shadow-xl rounded-[2px] transition-all duration-500 ease-out pointer-events-auto ${showToast ? 'opacity-100 translate-y-2' : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[9px] tracking-[0.2em] uppercase font-bold">{toastMessage}</span>
            </div>
            <Link href="/cart" className="text-[9px] tracking-[0.2em] uppercase font-bold text-white border-b border-white pb-0.5 hover:opacity-85 transition-opacity">
              View Bag &rarr;
            </Link>
          </div>
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
            coords={item.coords || coords}
            index={item.index}
            total={flyingItems.length}
            onComplete={() => handleFlyComplete(item.id, item.index)}
          />,
          document.getElementById('mobile-frame') || document.body
        ))}

        {/* Main product Image Carousel */}
        <div className="relative w-full aspect-[4/5] bg-zinc-50 border-b border-zinc-100 group overflow-hidden">
          {/* Slides Wrapper for Scroll Snap */}
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-[2px]"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {productImages.map((imgUrl, index) => (
              <div
                key={index}
                className="w-full h-full flex-shrink-0 snap-start snap-always relative"
              >
                <FallbackImage
                  src={imgUrl}
                  alt={`${product.name} Image ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  logoSize="w-8 h-8"
                />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {productImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </>
          )}

          {/* Glassy Indicator Dots */}
          {productImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {productImages.map((_, index) => {
                const isActive = index === currentImageIndex;
                return (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImageIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer border ${isActive
                        ? 'w-5 bg-white border-white shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                        : 'w-2 bg-white/20 backdrop-blur-md border-white/10 hover:bg-white/40'
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Other Images (Thumbnails) */}
        {productImages.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
            {productImages.map((imgUrl, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`relative w-12 h-15 rounded-[1px] overflow-hidden border transition-all duration-200 ${currentImageIndex === i ? 'border-black scale-[1.02]' : 'border-zinc-200 opacity-60 hover:opacity-100'
                  }`}
              >
                <FallbackImage
                  src={imgUrl}
                  className="w-full h-full object-cover"
                  hideText={true}
                  logoSize="w-4 h-4"
                />
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
          {isFreeSizeProduct ? (
            <div className="mt-4 border-t border-zinc-100 pt-3">
              <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-medium">Size</span>
              <span className="text-[10px] text-black font-medium block mt-0.5">Free Size</span>
            </div>
          ) : (
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
                        if (cartTimerRef.current) clearTimeout(cartTimerRef.current);
                        setAddedToCart(false);
                      }}
                      className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold rounded-[1px] border transition-all ${!hasStock
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
          )}

          {/* Quantity Select */}
          <div className="mt-4 border-t border-zinc-100 pt-3">
            <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-medium">Quantity</span>
            <div className="flex items-center border border-zinc-200 w-24 h-7 mt-2 rounded-[1px]">
              <button
                onClick={() => {
                  setQuantity(Math.max(1, quantity - 1));
                  if (cartTimerRef.current) clearTimeout(cartTimerRef.current);
                  setAddedToCart(false);
                }}
                className="flex-1 flex justify-center items-center text-zinc-500 hover:text-black"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="text-[10px] font-bold text-black flex-1 text-center">{quantity}</span>
              <button
                onClick={() => {
                  setQuantity(quantity + 1);
                  if (cartTimerRef.current) clearTimeout(cartTimerRef.current);
                  setAddedToCart(false);
                }}
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
        <div
          ref={suggestionSectionRef}
          className={`transition-all duration-300 ${shakeSuggestions ? 'animate-shake' : ''}`}
        >
          <SuggestionBar
            category={suggestionCategory}
            customTitle={suggestionTitle}
            highlightRed={showedSocksNudge}
            shake={shakeSuggestions}
            onItemClick={handleSuggestionClick}
          />
        </div>
        <Footer />
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-11 left-0 right-0 z-40 bg-white border-t border-zinc-100 px-4 py-3 flex items-center justify-between max-w-[430px] mx-auto shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
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
          className={`relative overflow-hidden flex items-center justify-center gap-1.5 text-[9px] tracking-[0.2em] uppercase font-bold py-3 px-8 rounded-[1px] transition-colors ${!product.inStock
            ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
            : addedToCart
              ? 'bg-zinc-900 text-white'
              : 'bg-black text-white hover:bg-zinc-900'
            }`}
        >
          <span>{addedToCart ? 'Go to Bag' : showedSocksNudge ? 'Add anyway' : 'Add to Bag'}</span>

          {/* Draining Progress Bar */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-[2.5px] bg-zinc-800/80 transition-opacity duration-300 ${addedToCart ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
          >
            <div
              className="h-full bg-white transition-all duration-[3000ms] ease-linear"
              style={{ width: addedToCart ? '0%' : '100%' }}
            />
          </div>
        </button>
      </div>
    </>
  );
}
