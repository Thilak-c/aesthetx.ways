'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';

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

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cart = JSON.parse(localStorage.getItem('aw_cart') || '[]');
      setCartItems(cart);
      setLoading(false);
    }
  }, []);

  // Update local storage and notify updates
  const saveCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem('aw_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQuantity = (productId, size, amount) => {
    const updated = cartItems.map((item) => {
      if (item.productId === productId && item.size === size) {
        const newQty = Math.max(1, item.quantity + amount);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveCart(updated);
  };

  const removeItem = (productId, size) => {
    const filtered = cartItems.filter(
      (item) => !(item.productId === productId && item.size === size)
    );
    saveCart(filtered);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col bg-white justify-center items-center py-32">
        <span className="text-[10px] tracking-widest uppercase text-zinc-400 animate-pulse">Loading bag...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white relative pb-28">
      {/* Sleek Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-zinc-950 hover:text-black">
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
        <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-400">Shopping Bag</span>
        <div className="w-4 h-4"></div> {/* spacer */}
      </header>

      {/* Bag Items list */}
      <main className="flex-1 px-4 py-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="w-8 h-8 text-zinc-200 stroke-[1.5] mb-3" />
            <span className="text-[10px] tracking-widest uppercase text-zinc-400 font-bold">Your bag is empty</span>
            <p className="text-[9px] text-zinc-400 mt-1 max-w-[200px]">Add items from our collection to begin shopping.</p>
            <Link 
              href="/" 
              className="mt-6 text-[9px] tracking-widest uppercase font-bold bg-black text-white px-5 py-2.5 rounded-[1px] hover:bg-zinc-900 transition-colors"
            >
              Shop collection
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {cartItems.map((item, idx) => (
              <div 
                key={`${item.productId}-${item.size}-${idx}`}
                className="flex gap-3 py-3 border-b border-zinc-100 last:border-b-0"
              >
                {/* Product Image */}
                <div className="w-16 h-20 bg-zinc-50 border border-zinc-100 rounded-[1px] overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                {/* Details */}
                <div className="flex flex-col flex-1 min-w-0 justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="text-[10px] font-bold tracking-wide uppercase text-black line-clamp-1">
                        {item.name}
                      </h3>
                      <button 
                        onClick={() => removeItem(item.productId, item.size)}
                        className="text-zinc-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-medium block mt-0.5">
                      Size: {getDisplaySize(item.size, item.sizeDisplayType)}
                    </span>
                  </div>

                  <div className="flex justify-between items-end mt-2">
                    {/* Inline Quantities */}
                    <div className="flex items-center border border-zinc-200 w-18 h-5.5 rounded-[1px]">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.size, -1)}
                        className="flex-1 flex justify-center items-center text-zinc-400 hover:text-black"
                      >
                        <Minus className="w-2 h-2" />
                      </button>
                      <span className="text-[9px] font-bold text-black flex-1 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.size, 1)}
                        className="flex-1 flex justify-center items-center text-zinc-400 hover:text-black"
                      >
                        <Plus className="w-2 h-2" />
                      </button>
                    </div>
                    
                    <span className="text-[10px] font-semibold text-black">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Price Calculations */}
            <div className="mt-4 border-t border-zinc-100 pt-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase text-zinc-400">Subtotal</span>
                <span className="text-[10px] font-bold text-black">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase text-zinc-400">Shipping</span>
                <span className="text-[9px] uppercase text-green-600 font-bold">Free</span>
              </div>
              <div className="flex justify-between items-center border-t border-zinc-100 pt-3 mt-1">
                <span className="text-[10px] uppercase font-bold text-black">Estimated Total</span>
                <span className="text-xs font-bold text-black">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Actions Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-100 px-4 py-3 max-w-[450px] mx-auto shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
          <Link
            href="/checkout"
            className="flex items-center justify-center text-[9px] tracking-[0.2em] uppercase font-bold py-3.5 bg-black text-white hover:bg-zinc-900 rounded-[1px] transition-colors"
          >
            Proceed to Checkout
          </Link>
        </div>
      )}
    </div>
  );
}
