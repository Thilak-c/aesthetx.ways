'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, ClipboardList, ChevronRight, ChevronDown, X } from 'lucide-react';
import { getCachedVideo, getCachedImage } from '@/lib/mediaCache';
import FallbackImage from '@/components/FallbackImage';
import Footer from '@/components/Footer';

export default function HomeClient() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [banners, setBanners] = useState([]);
  const searchInputRef = useRef(null);

  // Fetch banners on mount
  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch('/api/banners');
        const data = await res.json();
        if (data.success && data.banners?.length > 0) {
          setBanners(data.banners);
        }
      } catch (err) {
        console.error('Failed to fetch banners:', err);
      }
    }
    fetchBanners();
  }, []);

  // Reset tab title to home page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = "​​🇦​​🇪​​🇸​​🇹​​🇭​​🇪​​🇹​​🇽​​🇼​​🇦​​🇾​​🇸​ | ​🇭​​🇴​​🇲​​🇪​ ​🇵​​🇦​​🇬​​🇪​";
    }
  }, []);

  // Fetch all products once on mount (and when search changes)
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const url = `/api/products?category=All&search=${encodeURIComponent(searchQuery)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setAllProducts(data.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [searchQuery]);

  // Derive categories from fetched products
  const categories = (() => {
    const catSet = new Set();
    allProducts.forEach(p => {
      if (p.category) catSet.add(p.category);
    });
    return ['All', ...Array.from(catSet).sort()];
  })();

  // Filter products client-side by active category
  useEffect(() => {
    if (activeCategory === 'All') {
      setProducts(allProducts);
    } else {
      const norm = activeCategory.toLowerCase().trim();
      setProducts(allProducts.filter(p => {
        const pCat = (p.category || '').toLowerCase().trim();
        if (norm === 'apparel' || norm === 'apparel / clothing') {
          return pCat === 'apparel' || pCat === 'apparel / clothing';
        }
        return pCat === norm;
      }));
    }
  }, [activeCategory, allProducts]);

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
    // Listen to localstorage updates
    window.addEventListener('storage', updateCartCount);
    // Listen to custom cart updates
    window.addEventListener('cart-updated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  // Handle programmatic focus on search toggle
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else if (!searchOpen && searchInputRef.current) {
      searchInputRef.current?.blur();
    }
  }, [searchOpen]);

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Sleek Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-[16px] tracking-wider uppercase font-lovelo-black text-black hover:opacity-80 transition-opacity">
          Aesthetx Ways
        </Link>
        <div className="flex items-center gap-3 pr-24">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-zinc-900 hover:text-black transition-colors"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* Conditionally Render Search Bar with Smooth Slide/Fade Animation */}
      <div 
        className={`px-4 flex items-center gap-2 bg-zinc-50 transition-all duration-300 ease-in-out origin-top overflow-hidden ${
          searchOpen 
            ? 'h-[37px] opacity-100 py-2 border-b border-zinc-100 scale-y-100' 
            : 'h-0 opacity-0 py-0 border-b-0 border-transparent scale-y-0 pointer-events-none'
        }`}
      >
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full text-xs bg-transparent border-none outline-none py-1 text-black placeholder-zinc-400"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-black">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Horizontal Category Scroll */}
      <nav className="flex overflow-x-auto scrollbar-hide px-4 py-3 gap-5 border-b border-zinc-100 bg-white">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              document.getElementById('shop-content')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`text-[9px] tracking-wider uppercase font-semibold whitespace-nowrap pb-1 transition-all relative ${activeCategory === cat ? 'text-black' : 'text-zinc-400 hover:text-zinc-600'
              }`}
          >
            {cat === 'Apparel / Clothing' ? 'Apparel' : cat}
            {activeCategory === cat && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-black rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Dynamic Hero Banner Grid */}
      {(() => {
        const leftBanner = banners.find((b) => b.position === 'left') || {
          imageUrl: '/home/banner_left.webp',
          productLink: '#'
        };
        const rightTopBanner = banners.find((b) => b.position === 'right_top') || {
          imageUrl: '/home/banner_right_top.webp',
          productLink: '#'
        };
        const rightBottomBanner = banners.find((b) => b.position === 'right_bottom') || {
          imageUrl: '/home/banner_right_bottom.webp',
          productLink: '#'
        };

        return (
          <div className="px-4 py-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 h-auto md:h-[65vh] w-full">
              {/* Left Tall Banner */}
              <Link
                href={leftBanner.productLink}
                className="md:col-span-3 h-[50vh] md:h-full relative overflow-hidden rounded-[2px] border border-zinc-150 bg-zinc-50 group block"
              >
                <img
                  src={leftBanner.imageUrl}
                  alt="Left Hero Banner"
                  className="absolute inset-0 w-full h-full object-cover filter brightness-[0.98] group-hover:scale-[1.01] transition-transform duration-500 ease-out"
                />
              </Link>

              {/* Right Stacked Column */}
              <div className="md:col-span-2 grid grid-cols-1 grid-rows-2 gap-3 h-[60vh] md:h-full">
                {/* Right Top Banner */}
                <Link
                  href={rightTopBanner.productLink}
                  className="h-full relative overflow-hidden rounded-[2px] border border-zinc-150 bg-zinc-50 group block"
                >
                  <img
                    src={rightTopBanner.imageUrl}
                    alt="Right Top Banner"
                    className="absolute inset-0 w-full h-full object-cover filter brightness-[0.98] group-hover:scale-[1.01] transition-transform duration-500 ease-out"
                  />
                </Link>

                {/* Right Bottom Banner */}
                <Link
                  href={rightBottomBanner.productLink}
                  className="h-full relative overflow-hidden rounded-[2px] border border-zinc-150 bg-zinc-50 group block"
                >
                  <img
                    src={rightBottomBanner.imageUrl}
                    alt="Right Bottom Banner"
                    className="absolute inset-0 w-full h-full object-cover filter brightness-[0.98] group-hover:scale-[1.01] transition-transform duration-500 ease-out"
                  />
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Content Area */}
      <main id="shop-content" className="flex-1 px-4 pb-20">
        <div className="flex items-center justify-between py-2 mb-2">
          <span className="text-[9px] tracking-widest uppercase font-bold text-zinc-400">
            {activeCategory === 'All' ? 'ALL PRODUCTS' : activeCategory.toUpperCase()}
          </span>
          <span className="text-[9px] text-zinc-400">
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col">
                <div className="relative w-full aspect-4/5 bg-zinc-100 animate-pulse animate-shimmer rounded-[2px] border border-zinc-100/50" />
                <div className="mt-2 flex flex-col gap-1.5">
                  <div className="h-3 bg-zinc-100 animate-pulse animate-shimmer rounded-[1px] w-2/3" />
                  <div className="h-2 bg-zinc-50 animate-pulse animate-shimmer rounded-[1px] w-1/3" />
                  <div className="h-2.5 bg-zinc-100 animate-pulse animate-shimmer rounded-[1px] w-1/4 mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-16 text-center">
            <div className="w-20 h-20 mb-5 overflow-hidden rounded-full border border-zinc-100 bg-zinc-50 flex items-center justify-center select-none">
              <video 
                src="/n0-data.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover filter grayscale opacity-90"
              />
            </div>
            <span className="text-[10px] tracking-widest uppercase text-zinc-400">No products found</span>
          </div>
        ) : (
          /* Products Grid: 2 columns, ultra-sleek, minimalistic */
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 animate-slide-up-fade">
            {products.map((product) => (
              <Link key={product._id} href={`/product/${product.itemId}`} className="group flex flex-col">
                <div className="relative w-full aspect-4/5 bg-zinc-50 overflow-hidden rounded-[2px] border border-zinc-100">
                  <FallbackImage
                    src={getCachedImage(product.itemId, product.mainImage)}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                  />
                  {product.inStock ? (
                    <div className="absolute top-2 left-2 z-10 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                   
                    </div>
                  ) : (
                    <div className="absolute top-2 left-2 bg-black text-white text-[7px] tracking-wider uppercase font-semibold px-1.5 py-0.5 rounded-[1px]">
                      Out of Stock
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-col flex-1">
                  <h3 className="text-[10px] font-bold tracking-wide uppercase text-black line-clamp-1">
                    {product.name}
                  </h3>
                  <span className="text-[8px] text-zinc-400 mt-0.5">
                    {product.color || 'Default'}
                  </span>
                  <span className="text-[9px] font-semibold text-black mt-1">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* End of Products Indicator */}
        {!loading && products.length > 0 && (
          <div className="flex flex-col justify-center items-center py-12 text-center">
            <div className="w-16 h-16 mb-4 overflow-hidden rounded-full border border-zinc-100 bg-zinc-50 flex items-center justify-center select-none">
              <video 
                src="/n0-data.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover filter grayscale opacity-80"
              />
            </div>
            <span className="text-[8px] tracking-[0.2em] uppercase text-zinc-400 font-medium">No more products to show</span>
          </div>
        )}
        <Footer />
      </main>


    </div>
  );
}
