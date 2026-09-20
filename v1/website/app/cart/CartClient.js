'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Plus, Minus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { getCachedImage } from '@/lib/mediaCache';
import FallbackImage from '@/components/FallbackImage';
import { OdometerNumber } from '@/components/SplashWrapper';
import Footer from '@/components/Footer';
import SuggestionBar from '@/components/SuggestionBar';
import { trackEvent } from '@/lib/analytics';

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

export default function CartClient() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeeDetails, setShowFeeDetails] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [shakeCoupon, setShakeCoupon] = useState(false);

  const [deletingItems, setDeletingItems] = useState([]);
  const [bagExiting, setBagExiting] = useState(false);
  const [animateNewBag, setAnimateNewBag] = useState(false);

  useEffect(() => {
    if (animateNewBag) {
      const timer = setTimeout(() => {
        setAnimateNewBag(false);
      }, 600); // clear after animation completes
      return () => clearTimeout(timer);
    }
  }, [animateNewBag]);

  const handleDeleteClick = (productId, size) => {
    const key = `${productId}-${size}`;
    setDeletingItems((prev) => [...prev, key]);
    setTimeout(() => {
      removeItem(productId, size);
      setDeletingItems((prev) => prev.filter((k) => k !== key));
    }, 400);
  };

  // Load cart from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cart = JSON.parse(localStorage.getItem('aw_cart') || '[]');
      const savedCoupon = localStorage.getItem('aw_coupon');
      
      const timer = setTimeout(() => {
        setCartItems(cart);
        if (savedCoupon) {
          try {
            setAppliedCoupon(JSON.parse(savedCoupon));
          } catch (e) {
            console.error(e);
          }
        }
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Set dynamic browser tab title
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = "Aesthetx Ways | Bag";
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
    const itemToRemove = cartItems.find(item => item.productId === productId && item.size === size);
    const filtered = cartItems.filter(
      (item) => !(item.productId === productId && item.size === size)
    );
    saveCart(filtered);
    if (itemToRemove) {
      trackEvent('action', 'remove_from_cart', {
        productId: itemToRemove.productId,
        name: itemToRemove.name,
        price: itemToRemove.price,
        size: itemToRemove.size,
        quantity: itemToRemove.quantity
      });
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const itemsSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = 70;
  const protectPromiseFee = totalItems * 9;
  
  // order subtotal is items + shipping + fee
  const orderSubtotal = itemsSubtotal + shippingCost + protectPromiseFee;
  
  // free delivery if items subtotal is >= 1000
  const freeDeliveryDiscount = itemsSubtotal >= 1000 ? -70 : 0;
  
  // coupon discount calculation
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.code === 'AESTHETX10') {
      couponDiscount = Math.round(itemsSubtotal * 0.10);
    } else if (appliedCoupon.code === 'FIRSTORDER') {
      if (itemsSubtotal >= 500) {
        couponDiscount = 150;
      }
    }
  }
  
  const estimatedTotal = orderSubtotal + freeDeliveryDiscount - couponDiscount;

  const triggerCouponError = (msg) => {
    setCouponError(msg);
    setShakeCoupon(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80, 50, 80]); // double pulse haptic vibration
    }
    setTimeout(() => {
      setShakeCoupon(false);
    }, 400); // match globals.css animate-shake duration (0.4s)
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      triggerCouponError('Please enter a coupon code.');
      return;
    }

    if (code === 'AESTHETX10') {
      const couponObj = { code, type: 'percent', value: 10 };
      setAppliedCoupon(couponObj);
      localStorage.setItem('aw_coupon', JSON.stringify(couponObj));
      setCouponCode('');
    } else if (code === 'FIRSTORDER') {
      if (itemsSubtotal >= 500) {
        const couponObj = { code, type: 'flat', value: 150 };
        setAppliedCoupon(couponObj);
        localStorage.setItem('aw_coupon', JSON.stringify(couponObj));
        setCouponCode('');
      } else {
        triggerCouponError('Order must be at least ₹500 for this coupon.');
      }
    } else {
      triggerCouponError('Invalid coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('aw_coupon');
    setCouponError('');
  };

  const handleQuickApply = (code) => {
    setCouponError('');
    if (code === 'AESTHETX10') {
      const couponObj = { code, type: 'percent', value: 10 };
      setAppliedCoupon(couponObj);
      localStorage.setItem('aw_coupon', JSON.stringify(couponObj));
    } else if (code === 'FIRSTORDER') {
      if (itemsSubtotal >= 500) {
        const couponObj = { code, type: 'flat', value: 150 };
        setAppliedCoupon(couponObj);
        localStorage.setItem('aw_coupon', JSON.stringify(couponObj));
      } else {
        triggerCouponError('Order must be at least ₹500 for this coupon.');
      }
    }
  };

  const handleProceedToCheckout = (e) => {
    e.preventDefault();

    // Log initiate checkout
    trackEvent('action', 'initiate_checkout', {
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        size: item.size,
        quantity: item.quantity
      })),
      total: estimatedTotal
    });

    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col bg-white justify-center items-center py-32">
        <span className="text-[10px] tracking-widest uppercase text-zinc-400 animate-pulse">Loading bag...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white relative pb-28 min-h-[90vh]">
      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
            max-height: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
            max-height: 150px;
          }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      {/* Sleek Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 py-3.5 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-zinc-950 hover:text-black p-1 -ml-1 cursor-pointer">
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <span className="text-xs tracking-[0.2em] uppercase font-black text-zinc-900">Shopping Bag</span>
        <div className="w-5 h-5"></div> {/* spacer */}
      </header>

      {/* Bag Items list */}
      <main className="flex-1 px-4 py-4 flex flex-col justify-between min-h-[85vh]">
        {cartItems.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center flex-1 py-12">
            <div className="w-24 h-24 mb-5 overflow-hidden rounded-full border border-zinc-100 bg-zinc-50 flex items-center justify-center select-none shadow-xs">
              <video 
                src="/n0-data.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover filter grayscale opacity-90"
              />
            </div>
            <span className="text-xs tracking-widest uppercase text-zinc-900 font-black">Your bag is empty</span>
            <p className="text-xs text-zinc-500 font-medium mt-1.5 max-w-[220px]">Add items from our collection to begin shopping.</p>
            <Link 
              href="/" 
              className="mt-6 text-xs tracking-widest uppercase font-black bg-black text-white px-6 py-3 rounded-xs hover:bg-zinc-900 transition-colors shadow-sm"
            >
              Shop collection
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {cartItems.map((item, idx) => {
              const itemKey = `${item.productId}-${item.size}`;
              const isDeleting = deletingItems.includes(itemKey);
              const isNewBag = item.productId === 'aw-carry-bag' && animateNewBag;
              return (
                <div 
                  key={`${item.productId}-${item.size}-${idx}`}
                  className={`flex gap-3.5 py-3.5 border-b border-zinc-150 last:border-b-0 transition-all duration-400 ease-out origin-right ${
                    isDeleting 
                      ? 'translate-x-full opacity-0 max-h-0 py-0 border-b-0 overflow-hidden pointer-events-none' 
                      : ''
                  } ${isNewBag ? 'animate-slide-in-left' : ''}`}
                  style={{
                    maxHeight: isDeleting ? '0px' : '170px',
                  }}
                >
                {/* Product Image */}
                <Link 
                  href={`/product/${item.productId}`}
                  className="w-20 h-24 bg-zinc-50 border border-zinc-200/80 rounded-xs overflow-hidden shrink-0 relative group block hover:opacity-90 transition-opacity"
                >
                  <FallbackImage 
                    src={getCachedImage(item.productId, item.image)} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                    logoSize="w-6 h-6"
                  />
                </Link>
                
                {/* Details */}
                <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <Link 
                        href={`/product/${item.productId}`}
                        className="flex-1 min-w-0 hover:opacity-85 transition-opacity group"
                      >
                        <h3 className="text-xs sm:text-[13px] font-bold tracking-tight uppercase text-black line-clamp-2 group-hover:underline leading-snug">
                          {item.name}
                        </h3>
                        <span className="text-[10px] tracking-wider uppercase text-zinc-500 font-bold block mt-1">
                          Size: {getDisplaySize(item.size, item.sizeDisplayType)}
                        </span>
                        <div className="text-[10px] text-zinc-500 font-bold flex items-center gap-1 mt-1 font-mono select-none">
                          <OdometerNumber value={`₹${item.price.toLocaleString('en-IN')}`} className="text-[10px] font-bold font-mono text-zinc-500" />
                          <span>×</span>
                          <OdometerNumber value={item.quantity} className="text-[10px] font-bold font-mono text-zinc-500" />
                        </div>
                      </Link>
                      
                      <div className="flex flex-col items-end justify-between min-h-[64px] shrink-0">
                        <div className="flex items-center text-xs sm:text-[13px] font-black text-black font-mono select-none">
                          <OdometerNumber value={`₹${(item.price * item.quantity).toLocaleString('en-IN')}`} className="text-xs sm:text-[13px] font-black text-black font-mono" />
                        </div>
                        <button 
                          onClick={() => handleDeleteClick(item.productId, item.size)}
                          className="text-zinc-400 hover:text-red-600 transition-colors mt-2 p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-2">
                    {/* Inline Quantities */}
                    <div className="flex items-center w-14 h-7 rounded-xs bg-zinc-50/50">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.size, -1)}
                        className="flex-1 flex justify-center items-center text-zinc-600 hover:text-black cursor-pointer h-full"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3 stroke-[2.5]" />
                      </button>
                      <span className="text-[11px] font-black text-black flex-1 flex justify-center items-center select-none font-mono">
                        <OdometerNumber value={item.quantity} className="text-[11px] font-black text-black" />
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.size, 1)}
                        className="flex-1 flex justify-center items-center text-zinc-600 hover:text-black cursor-pointer h-full"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

            {/* Aesthetx Ways Bag Upsell */}
            {(() => {
              const bagInCart = cartItems.some(item => item.productId === 'aw-carry-bag');
              if (bagInCart && !bagExiting) return null;
              return (
                <div className={`py-3.5 border-b border-zinc-150 flex items-center gap-3.5 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) origin-left ${
                  bagExiting 
                    ? '-translate-x-full opacity-0 max-h-0 py-0 border-b-0 overflow-hidden pointer-events-none' 
                    : 'max-h-[170px]'
                }`}>
                  <Link 
                    href="/product/aw-carry-bag"
                    className="w-20 h-24 bg-zinc-50 border border-zinc-200/80 rounded-xs overflow-hidden shrink-0 flex items-center justify-center p-2.5 hover:opacity-90 transition-opacity"
                  >
                    <img src="/icons/bag_t.png" alt="Aesthetx Ways Bag" className="w-full h-full object-contain" />
                  </Link>
                  <Link 
                    href="/product/aw-carry-bag"
                    className="flex flex-col flex-1 min-w-0 hover:opacity-85 transition-opacity group py-0.5"
                  >
                    <h3 className="text-xs sm:text-[13px] font-bold tracking-tight uppercase text-black group-hover:underline">Aesthetx Ways Bag</h3>
                    {/* <span className="text-[10px] tracking-wider uppercase text-zinc-500 font-bold mt-0.5">Premium Carry Bag</span> */}
                    <span className="text-xs font-black text-black mt-1 font-mono">₹20</span>
                  </Link>
                  <button
                    onClick={() => {
                      setBagExiting(true);
                      setTimeout(() => {
                        const newItem = {
                          productId: 'aw-carry-bag',
                          name: 'Aesthetx Ways Bag',
                          price: 20,
                          quantity: 1,
                          size: 'One Size',
                          image: '/icons/bag.png',
                          color: 'Default',
                        };
                        setAnimateNewBag(true);
                        const updated = [...cartItems, newItem];
                        saveCart(updated);
                        setBagExiting(false);
                      }, 500);
                    }}
                    className="bg-black text-white hover:bg-zinc-900 text-[10px] tracking-widest uppercase font-black px-4 py-2 rounded-xs transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    Add
                  </button>
                </div>
              );
            })()}

            {/* Price Calculations */}
            <div className="pt-5 flex flex-col gap-3">
              {/* Item subtotal */}
              <div className="flex justify-between items-center text-xs uppercase font-bold text-zinc-900">
                <span>Items Subtotal</span>
                <OdometerNumber value={`₹${itemsSubtotal.toLocaleString('en-IN')}`} className="text-xs font-bold font-mono text-zinc-900" />
              </div>

              {/* Shipping */}
              <div className="flex justify-between items-center text-xs uppercase font-bold text-zinc-900">
                <span>Shipping</span>
                <div className="flex items-center gap-1 select-none">
                  <OdometerNumber value={`₹${shippingCost}`} className="text-xs font-bold font-mono text-zinc-900" />
                  <span className="text-[11px] font-bold font-mono text-zinc-500 lowercase">fixed</span>
                </div>
              </div>

              {/* Fees with Toggable Dropdown */}
              <div className="flex flex-col gap-1">
                <div 
                  onClick={() => setShowFeeDetails(!showFeeDetails)}
                  className="flex justify-between items-center text-xs uppercase font-bold text-zinc-900 cursor-pointer hover:text-black transition-colors select-none"
                >
                  <span className="flex items-center gap-1.5">
                    Fees 
                    <ChevronRight className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-300 ${showFeeDetails ? 'rotate-90' : 'rotate-0'}`} />
                  </span>
                  <OdometerNumber value={`₹${protectPromiseFee}`} className="text-xs font-bold font-mono text-zinc-900" />
                </div>
                
                <div className={`grid transition-all duration-300 ease-in-out ${showFeeDetails ? 'grid-rows-[1fr] opacity-100 mt-1.5' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                  <div className="overflow-hidden">
                    <div className="pl-3.5 py-2 border-l-2 border-zinc-300 bg-zinc-50 rounded-xs flex justify-between items-center text-[10px] text-zinc-600 tracking-wider font-bold select-none">
                      <div className="flex items-center gap-1">
                        <span>Protect Promise Fee (</span>
                        <OdometerNumber value="₹9" className="text-[10px] text-zinc-900 font-bold" />
                        <span> per item × </span>
                        <OdometerNumber value={totalItems} className="text-[10px] text-zinc-900 font-bold" />
                        <span>)</span>
                      </div>
                      <OdometerNumber value={`₹${protectPromiseFee}`} className="text-[10px] font-mono font-bold text-zinc-900" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bold subtotal (Items + Shipping + Fees) */}
              <div className="flex justify-between items-center border-t border-zinc-200 pt-3.5 mt-1 text-xs uppercase font-black text-black">
                <span>Subtotal</span>
                <OdometerNumber value={`₹${orderSubtotal.toLocaleString('en-IN')}`} className="text-xs font-black font-mono text-black" />
              </div>

              {/* Free delivery discount if order >= 1000 */}
              {itemsSubtotal >= 1000 && (
                <div className="flex justify-between items-center text-xs uppercase text-emerald-600 font-bold tracking-wider select-none">
                  <span>Free Delivery Discount</span>
                  <OdometerNumber value="-₹70" className="text-xs font-bold font-mono text-emerald-600" />
                </div>
              )}

              {/* Coupon Applied Discount row (rendered above final total to make math clear) */}
              {appliedCoupon && (
                <div className="flex justify-between items-center text-xs uppercase text-emerald-600 font-bold tracking-wider select-none">
                  <span className="flex items-center gap-2">
                    Coupon Applied ({appliedCoupon.code})
                    <button 
                      onClick={handleRemoveCoupon}
                      className="text-zinc-500 hover:text-red-600 font-black lowercase text-[10px] tracking-normal border-b border-zinc-300 hover:border-red-400 pb-0.5 cursor-pointer"
                    >
                      [remove]
                    </button>
                  </span>
                  <OdometerNumber value={`-₹${couponDiscount.toLocaleString('en-IN')}`} className="text-xs font-bold font-mono text-emerald-600" />
                </div>
              )}

              {/* Final Estimated Total */}
              <div className="flex justify-between items-center border-t-2 border-zinc-900 pt-4 mt-2">
                <span className="text-xs sm:text-sm uppercase font-black text-black tracking-widest">Total</span>
                <OdometerNumber value={`₹${estimatedTotal.toLocaleString('en-IN')}`} className="text-[15px] sm:text-lg  font-black text-black font-mono" />
              </div>

              {/* Have a Promo Code? Input Section (Located below the Estimated Total) */}
              {!appliedCoupon && (
                <div className={`border-t border-zinc-150 pt-3.5 mt-2 flex flex-col gap-2 ${shakeCoupon ? 'animate-shake' : ''}`}>
                  <div 
                    onClick={() => setShowCouponInput(!showCouponInput)}
                    className="flex justify-between items-center text-xs uppercase font-bold text-zinc-500 cursor-pointer hover:text-black transition-colors"
                  >
                    <span className="flex items-center gap-1.5 select-none">
                      Have a Promo Code?
                      <ChevronRight className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${showCouponInput ? 'rotate-90' : 'rotate-0'}`} />
                    </span>
                  </div>
                  
                  <div className={`grid transition-all duration-300 ease-in-out ${showCouponInput ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-2.5 pb-2">
                        {/* Minimalist Input Bar */}
                        <form onSubmit={handleApplyCoupon} className="flex gap-2 border-b-2 border-zinc-300 focus-within:border-black transition-colors">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="ENTER PROMO CODE"
                            className="flex-1 bg-transparent text-xs font-mono font-bold tracking-wider py-2 uppercase outline-none text-black placeholder-zinc-400"
                          />
                          <button 
                            type="submit"
                            className="text-xs tracking-widest uppercase font-black text-zinc-700 hover:text-black transition-colors py-2 px-3 shrink-0 cursor-pointer"
                          >
                            Apply
                          </button>
                        </form>
                      </div>
                    </div>
                  {couponError && (
                    <span className="text-[10px] text-red-600 tracking-wider font-bold mt-1">{couponError}</span>
                  )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <SuggestionBar />
        <Footer />
      </main>

      {/* Sticky Bottom Actions Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-11 left-0 right-0 z-40 bg-white border-t border-zinc-150 px-4 py-3.5 max-w-[430px] mx-auto shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <button
            onClick={handleProceedToCheckout}
            className="w-full flex items-center justify-center text-xs tracking-[0.2em] uppercase font-black py-4 bg-black text-white hover:bg-zinc-900 rounded-xs transition-all shadow-sm active:scale-[0.99] cursor-pointer"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}