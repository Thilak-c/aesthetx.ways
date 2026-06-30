'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Heart, Plus } from 'lucide-react';
import { getCachedImage } from '@/lib/mediaCache';
import FallbackImage from '@/components/FallbackImage';
import Footer from '@/components/Footer';
import SuggestionBar from '@/components/SuggestionBar';
import { trackEvent } from '@/lib/analytics';

export default function WishlistClient() {
  const router = useRouter();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist from local storage and fetch all products
  useEffect(() => {
    async function loadWishlistAndProducts() {
      try {
        setLoading(true);
        // Load wishlisted IDs
        const savedWishlist = JSON.parse(localStorage.getItem('aw_wishlist') || '[]');
        setWishlistIds(savedWishlist);

        // Fetch products
        const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to load wishlist or products:', err);
      } finally {
        setLoading(false);
      }
    }

    if (typeof window !== 'undefined') {
      loadWishlistAndProducts();
    }
  }, []);

  // Update browser tab title
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = "Aesthetx Ways | Wishlist";
    }
  }, []);

  const handleRemoveFromWishlist = (itemId, e) => {
    e.preventDefault();
    e.stopPropagation();

    const updated = wishlistIds.filter(id => id !== itemId);
    setWishlistIds(updated);
    localStorage.setItem('aw_wishlist', JSON.stringify(updated));

    // Dispatch event so product page or header updates if needed
    window.dispatchEvent(new Event('wishlist-updated'));

    trackEvent('action', 'remove_from_wishlist', { itemId });
  };

  // Filter products to show only the ones in wishlist
  const wishlistedProducts = products.filter(p => wishlistIds.includes(p.itemId));

  if (loading) {
    return (
      <div className="flex flex-1 flex-col bg-white justify-center items-center py-32">
        <span className="text-[10px] tracking-widest uppercase text-zinc-400 animate-pulse">Loading wishlist...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white relative pb-28 min-h-[90vh] animate-slide-up-fade">
      {/* Sleek Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-zinc-900 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-400">Wishlist</span>
        <div className="w-4" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-4">
        {wishlistedProducts.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20 text-center px-4 animate-slide-up-fade">
            <div className="w-20 h-20 mb-6 overflow-hidden rounded-full border border-zinc-100 bg-zinc-50 flex items-center justify-center select-none">
              <video
                src="/n0-data.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover filter grayscale opacity-90"
              />
            </div>
            <h2 className="text-[11px] tracking-[0.2em] uppercase font-bold text-zinc-400">Your wishlist is empty</h2>
            <p className="text-[9px] text-zinc-400 uppercase tracking-widest mt-1.5 leading-relaxed max-w-[200px]">
              Save items you love to complete your streetwear aesthetic.
            </p>
            <Link
              href="/"
              className="text-[9px] tracking-[0.25em] uppercase font-bold text-white bg-black hover:bg-zinc-900 px-6 py-2.5 mt-8 rounded-[1px] shadow-md transition-all active:scale-95"
            >
              Go shop
            </Link>

            <div className="w-full mt-12 border-t border-zinc-100 pt-6 text-left">
              <SuggestionBar customTitle="Recommended for you" />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-5 pb-2 border-b border-zinc-100">
              <span className="text-[9px] tracking-widest uppercase font-bold text-zinc-400">Wishlisted Items</span>
              <span className="text-[9px] text-zinc-400 font-medium">
                {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-6">
              {wishlistedProducts.map((product) => {
                return (
                  <div key={product._id} className="group flex flex-col relative">
                    <Link href={`/product/${product.itemId}`} className="flex flex-col relative">
                      <div className="relative w-full aspect-[4/5] bg-zinc-50 overflow-hidden rounded-[2px] border border-zinc-100">
                        <FallbackImage
                          src={getCachedImage(product.itemId, product.mainImage)}
                          alt={product.name}
                          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.02] ${!product.inStock ? 'blur-[3px] grayscale-[20%]' : ''}`}
                        />
                        {!product.inStock && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 pointer-events-none">
                            <span className="text-[10px] tracking-[0.25em] text-white font-lovelo-black font-extrabold uppercase mt-0.5">
                              SOLD OUT
                            </span>
                          </div>
                        )}

                        {/* Remove from Wishlist icon button */}
                        <button
                          onClick={(e) => handleRemoveFromWishlist(product.itemId, e)}
                          className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-red-500 hover:text-red-600 flex items-center justify-center shadow-md transition-transform duration-300 active:scale-95 cursor-pointer"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="mt-2 flex flex-col flex-1">
                        <h3 className="text-[10px] font-bold tracking-wide uppercase text-black line-clamp-1">
                          {product.name}
                        </h3>
                        <span className="text-[8px] text-zinc-400 uppercase tracking-wider font-medium mt-0.5">
                          {product.category}
                        </span>
                        <span className="text-[9px] font-semibold text-black mt-1">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 border-t border-zinc-100 pt-6">
              <SuggestionBar customTitle="Recommended for you" />
            </div>
          </div>
        )}
        <Footer />
      </main>
    </div>
  );
}
