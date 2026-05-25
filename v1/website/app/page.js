'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, ClipboardList, ChevronRight, X } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const categories = ['All', 'Apparel / Clothing', 'Footwear', 'Headwear', 'Eyewear'];

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const url = `/api/products?category=${encodeURIComponent(activeCategory)}&search=${encodeURIComponent(searchQuery)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [activeCategory, searchQuery]);

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

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Sleek Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-[10px] tracking-[0.25em] uppercase font-bold text-black hover:opacity-80 transition-opacity">
          Aesthetx Ways
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSearchOpen(!searchOpen)} 
            className="text-zinc-900 hover:text-black transition-colors"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
          <Link href="/cart" className="relative text-zinc-900 hover:text-black transition-colors">
            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[8px] font-bold w-3 h-3 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Conditionally Render Search Bar */}
      {searchOpen && (
        <div className="px-4 py-2 border-b border-zinc-100 flex items-center gap-2 bg-zinc-50 transition-all duration-300">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full text-xs bg-transparent border-none outline-none py-1 text-black placeholder-zinc-400"
            autoFocus
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-black">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Horizontal Category Scroll */}
      <nav className="flex overflow-x-auto scrollbar-hide px-4 py-3 gap-5 border-b border-zinc-100 bg-white">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-[9px] tracking-wider uppercase font-semibold whitespace-nowrap pb-1 transition-all relative ${
              activeCategory === cat ? 'text-black' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {cat === 'Apparel / Clothing' ? 'Apparel' : cat}
            {activeCategory === cat && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-black rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Minimal Hero Section */}
      <div className="px-4 py-3">
        <div className="relative h-44 w-full bg-zinc-100 overflow-hidden rounded-[2px] flex items-end p-4">
          {/* Unsplash Minimalist Fashion Image */}
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80"
            alt="Season Header"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.95]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="relative z-10 text-white">
            <span className="text-[8px] tracking-[0.2em] uppercase opacity-90 font-medium">Summer / Autumn 26</span>
            <h2 className="text-sm font-bold tracking-wide uppercase mt-0.5">REFINED ESSENTIALS</h2>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-4 pb-20">
        <div className="flex items-center justify-between py-2 mb-2">
          <span className="text-[9px] tracking-widest uppercase font-bold text-zinc-400">
            {activeCategory === 'All' ? 'ALL PRODUCTS' : activeCategory.toUpperCase()}
          </span>
          <span className="text-[9px] text-zinc-400">
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <span className="text-[10px] tracking-widest uppercase text-zinc-400 animate-pulse">Loading...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-16 text-center">
            <span className="text-[10px] tracking-widest uppercase text-zinc-400">No products found</span>
          </div>
        ) : (
          /* Products Grid: 2 columns, ultra-sleek, minimalistic */
          <div className="grid grid-cols-2 gap-x-3 gap-y-6">
            {products.map((product) => (
              <Link key={product._id} href={`/product/${product.itemId}`} className="group flex flex-col">
                <div className="relative w-full aspect-[4/5] bg-zinc-50 overflow-hidden rounded-[2px] border border-zinc-100">
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                  />
                  {!product.inStock && (
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
      </main>

      {/* Sticky Bottom Nav Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-100 max-w-[450px] mx-auto">
        <div className="flex items-center justify-around py-3">
          <Link href="/" className="flex flex-col items-center gap-0.5 text-black">
            <span className="text-[9px] tracking-widest uppercase font-bold">Shop</span>
            <span className="w-1 h-1 bg-black rounded-full"></span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-black">
            <span className="text-[9px] tracking-widest uppercase font-bold">Bag</span>
            <span className="w-1 h-1 bg-transparent rounded-full"></span>
          </Link>
          <Link href="/orders" className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-black">
            <span className="text-[9px] tracking-widest uppercase font-bold">Orders</span>
            <span className="w-1 h-1 bg-transparent rounded-full"></span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
