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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState('email'); // 'email' or 'otp'
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [shakeModal, setShakeModal] = useState(false);
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

  const triggerModalShake = () => {
    setShakeModal(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80, 50, 80]); // double pulse warning
    }
    setTimeout(() => {
      setShakeModal(false);
    }, 400);
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

    const userStr = localStorage.getItem('aw_user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj && userObj.email && userObj.loggedIn) {
          router.push('/checkout');
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    // Open auth modal if not logged in
    setShowAuthModal(true);
  };

  const sendVerificationOtp = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail) {
      setAuthError('Email is required.');
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthStep('otp');
      } else {
        setAuthError(data.message || 'Failed to send OTP.');
        triggerModalShake();
      }
    } catch (err) {
      setAuthError('An error occurred. Please try again.');
      triggerModalShake();
    } finally {
      setAuthLoading(false);
    }
  };

  const verifyOtpCode = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authOtp) {
      setAuthError('Verification code is required.');
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, otp: authOtp }),
      });
      const data = await res.json();
      if (data.success) {
        const userSession = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          loggedIn: true,
        };
        localStorage.setItem('aw_user', JSON.stringify(userSession));
        
        // Show success confirmation state inside the popup
        setAuthStep('success');
        setAuthLoading(false);
        
        setTimeout(() => {
          setShowAuthModal(false);
          setAuthStep('email');
          setAuthEmail('');
          setAuthOtp('');
          setAuthError('');
          router.push('/checkout');
        }, 1500);
      } else {
        setAuthError(data.message || 'Invalid verification code.');
        triggerModalShake();
        setAuthLoading(false);
      }
    } catch (err) {
      setAuthError('An error occurred. Please try again.');
      triggerModalShake();
      setAuthLoading(false);
    }
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
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-zinc-950 hover:text-black">
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
        <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-400">Shopping Bag</span>
        <div className="w-4 h-4"></div> {/* spacer */}
      </header>

      {/* Bag Items list */}
      <main className="flex-1 px-4 py-4 flex flex-col justify-between min-h-[85vh]">
        {cartItems.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center flex-1 py-12">
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
            {cartItems.map((item, idx) => {
              const itemKey = `${item.productId}-${item.size}`;
              const isDeleting = deletingItems.includes(itemKey);
              const isNewBag = item.productId === 'aw-carry-bag' && animateNewBag;
              return (
                <div 
                  key={`${item.productId}-${item.size}-${idx}`}
                  className={`flex gap-3 py-3 border-b border-zinc-100 last:border-b-0 transition-all duration-400 ease-out origin-right ${
                    isDeleting 
                      ? 'translate-x-full opacity-0 max-h-0 py-0 border-b-0 overflow-hidden pointer-events-none' 
                      : ''
                  } ${isNewBag ? 'animate-slide-in-left' : ''}`}
                  style={{
                    maxHeight: isDeleting ? '0px' : '150px',
                  }}
                >
                {/* Product Image */}
                <Link 
                  href={`/product/${item.productId}`}
                  className="w-16 h-20 bg-zinc-50 border border-zinc-100 rounded-[1px] overflow-hidden shrink-0 relative group block hover:opacity-90 transition-opacity"
                >
                  <FallbackImage 
                    src={getCachedImage(item.productId, item.image)} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                    logoSize="w-5 h-5"
                  />
                </Link>
                
                {/* Details */}
                <div className="flex flex-col flex-1 min-w-0 justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <Link 
                        href={`/product/${item.productId}`}
                        className="flex-1 min-w-0 hover:opacity-85 transition-opacity group"
                      >
                        <h3 className="text-[10px] font-bold tracking-wide uppercase text-black line-clamp-1 group-hover:underline">
                          {item.name}
                        </h3>
                        <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-medium block mt-0.5">
                          Size: {getDisplaySize(item.size, item.sizeDisplayType)}
                        </span>
                        <div className="text-[9px] text-zinc-400 flex items-center gap-0.5 mt-1 font-mono select-none">
                          <OdometerNumber value={`₹${item.price.toLocaleString('en-IN')}`} className="text-[9px] font-mono text-zinc-400" />
                          <span>×</span>
                          <OdometerNumber value={item.quantity} className="text-[9px] font-mono text-zinc-400" />
                        </div>
                      </Link>
                      
                      <div className="flex flex-col items-end justify-between min-h-[60px] shrink-0">
                        <div className="flex items-center text-[10px] font-bold text-black font-mono select-none">
                          <OdometerNumber value={`₹${(item.price * item.quantity).toLocaleString('en-IN')}`} className="text-[10px] font-bold text-black font-mono" />
                        </div>
                        <button 
                          onClick={() => handleDeleteClick(item.productId, item.size)}
                          className="text-zinc-400 hover:text-red-500 transition-colors mt-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
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
                      <span className="text-[9px] font-bold text-black flex-1 flex justify-center items-center select-none">
                        <OdometerNumber value={item.quantity} className="text-[9px] font-bold text-black" />
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.size, 1)}
                        className="flex-1 flex justify-center items-center text-zinc-400 hover:text-black"
                      >
                        <Plus className="w-2 h-2" />
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
                <div className={`mt-2 py-3 border-b border-zinc-100 flex items-center gap-3 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) origin-left ${
                  bagExiting 
                    ? '-translate-x-full opacity-0 max-h-0 py-0 border-b-0 overflow-hidden pointer-events-none' 
                    : 'max-h-[150px]'
                }`}>
                  <Link 
                    href="/product/aw-carry-bag"
                    className="w-16 h-20 bg-zinc-50 border border-zinc-100 rounded-[1px] overflow-hidden shrink-0 flex items-center justify-center p-2 hover:opacity-90 transition-opacity"
                  >
                    <img src="/icons/bag_t.png" alt="Aesthetx Ways Bag" className="w-full h-full object-contain" />
                  </Link>
                  <Link 
                    href="/product/aw-carry-bag"
                    className="flex flex-col flex-1 min-w-0 hover:opacity-85 transition-opacity group"
                  >
                    <h3 className="text-[10px] font-bold tracking-wide uppercase text-black group-hover:underline">Aesthetx Ways Bag</h3>
                    <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-medium mt-0.5">Premium Carry Bag</span>
                    <span className="text-[9px] font-semibold text-black mt-1 font-mono">₹20</span>
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
                    className="bg-black text-white hover:bg-zinc-900 text-[8px] tracking-widest uppercase font-bold px-3 py-1.5 rounded-[1px] transition-colors shrink-0"
                  >
                    Add
                  </button>
                </div>
              );
            })()}

            {/* Price Calculations */}
            <div className="mt-6 border-t border-zinc-100 pt-5 flex flex-col gap-3">
              {/* Item subtotal */}
              <div className="flex justify-between items-center text-[9px] uppercase text-zinc-400">
                <span>Items Subtotal</span>
                <OdometerNumber value={`₹${itemsSubtotal.toLocaleString('en-IN')}`} className="text-[9px] font-mono text-zinc-500" />
              </div>

              {/* Shipping */}
              <div className="flex justify-between items-center text-[9px] uppercase text-zinc-400">
                <span>Shipping</span>
                <div className="flex items-center gap-1 select-none">
                  <OdometerNumber value={`₹${shippingCost}`} className="text-[9px] font-mono text-zinc-500" />
                  <span className="text-[9px] font-mono text-zinc-500 lowercase">fixed</span>
                </div>
              </div>

              {/* Fees with Toggable Dropdown */}
              <div className="flex flex-col gap-1">
                <div 
                  onClick={() => setShowFeeDetails(!showFeeDetails)}
                  className="flex justify-between items-center text-[9px] uppercase text-zinc-400 cursor-pointer hover:text-black transition-colors select-none"
                >
                  <span className="flex items-center gap-1">
                    Fees 
                    <ChevronRight className={`w-2.5 h-2.5 text-zinc-500 transition-transform duration-300 ${showFeeDetails ? 'rotate-90' : 'rotate-0'}`} />
                  </span>
                  <OdometerNumber value={`₹${protectPromiseFee}`} className="text-[9px] font-mono text-zinc-500" />
                </div>
                
                <div className={`grid transition-all duration-300 ease-in-out ${showFeeDetails ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                  <div className="overflow-hidden">
                    <div className="pl-3 py-1.5 border-l border-zinc-100 bg-zinc-50/50 rounded-[1px] flex justify-between items-center text-[8px] text-zinc-400 tracking-wider select-none">
                      <div className="flex items-center gap-0.5">
                        <span>Protect Promise Fee (</span>
                        <OdometerNumber value="₹9" className="text-[8px] text-zinc-400 font-bold" />
                        <span> per item × </span>
                        <OdometerNumber value={totalItems} className="text-[8px] text-zinc-400 font-bold" />
                        <span>)</span>
                      </div>
                      <OdometerNumber value={`₹${protectPromiseFee}`} className="text-[8px] font-mono text-zinc-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bold subtotal (Items + Shipping + Fees) */}
              <div className="flex justify-between items-center border-t border-zinc-100 pt-3 mt-1 text-[10px] uppercase font-bold text-black">
                <span>Subtotal</span>
                <OdometerNumber value={`₹${orderSubtotal.toLocaleString('en-IN')}`} className="text-[10px] font-bold font-mono text-black" />
              </div>

              {/* Free delivery discount if order >= 1000 */}
              {itemsSubtotal >= 1000 && (
                <div className="flex justify-between items-center text-[9px] uppercase text-green-600 font-semibold tracking-wider select-none">
                  <span>Free Delivery Discount</span>
                  <OdometerNumber value="-₹70" className="text-[9px] font-mono text-green-600 font-semibold" />
                </div>
              )}

              {/* Coupon Applied Discount row (rendered above final total to make math clear) */}
              {appliedCoupon && (
                <div className="flex justify-between items-center text-[9px] uppercase text-green-600 font-semibold tracking-wider select-none">
                  <span className="flex items-center gap-1.5">
                    Coupon Applied ({appliedCoupon.code})
                    <button 
                      onClick={handleRemoveCoupon}
                      className="text-zinc-400 hover:text-red-500 font-bold lowercase text-[8px] tracking-normal border-b border-zinc-200 hover:border-red-400 pb-0.5"
                    >
                      [remove]
                    </button>
                  </span>
                  <OdometerNumber value={`-₹${couponDiscount.toLocaleString('en-IN')}`} className="text-[9px] font-mono text-green-600 font-semibold" />
                </div>
              )}

              {/* Final Estimated Total */}
              <div className="flex justify-between items-center border-t border-zinc-200 pt-4 mt-2">
                <span className="text-[11px] uppercase font-black text-black tracking-widest">Estimated Total</span>
                <OdometerNumber value={`₹${estimatedTotal.toLocaleString('en-IN')}`} className="text-sm font-black text-black font-mono" />
              </div>

              {/* Have a Promo Code? Input Section (Located below the Estimated Total) */}
              {!appliedCoupon && (
                <div className={`border-t border-zinc-100 pt-3 mt-2 flex flex-col gap-2 ${shakeCoupon ? 'animate-shake' : ''}`}>
                  <div 
                    onClick={() => setShowCouponInput(!showCouponInput)}
                    className="flex justify-between items-center text-[9px] uppercase text-zinc-400 cursor-pointer hover:text-black transition-colors"
                  >
                    <span className="flex items-center gap-1 select-none">
                      Have a Promo Code?
                      <ChevronRight className={`w-2.5 h-2.5 text-zinc-500 transition-transform duration-300 ${showCouponInput ? 'rotate-90' : 'rotate-0'}`} />
                    </span>
                  </div>
                  
                  <div className={`grid transition-all duration-300 ease-in-out ${showCouponInput ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-2.5 pb-2">
                        {/* Minimalist Input Bar */}
                        <form onSubmit={handleApplyCoupon} className="flex gap-2 border-b border-zinc-200 focus-within:border-black transition-colors">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="ENTER PROMO CODE"
                            className="flex-1 bg-transparent text-[10px] font-mono tracking-wider py-1.5 uppercase outline-none text-black placeholder-zinc-300"
                          />
                          <button 
                            type="submit"
                            className="text-[9px] tracking-widest uppercase font-bold text-zinc-400 hover:text-black transition-colors py-1.5 px-2 shrink-0"
                          >
                            Apply
                          </button>
                        </form>
                      </div>
                    </div>
                  {couponError && (
                    <span className="text-[8px] text-red-500 tracking-wider font-medium mt-1">{couponError}</span>
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
        <div className="fixed bottom-11 left-0 right-0 z-40 bg-white border-t border-zinc-100 px-4 py-3 max-w-[430px] mx-auto shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
          <button
            onClick={handleProceedToCheckout}
            className="w-full flex items-center justify-center text-[9px] tracking-[0.2em] uppercase font-bold py-3.5 bg-black text-white hover:bg-zinc-900 rounded-[1px] transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      )}

      {/* Premium OTP Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs custom-fade-in">
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUpFade {
              from { transform: translateY(12px) scale(0.98); opacity: 0; }
              to { transform: translateY(0) scale(1); opacity: 1; }
            }
            .custom-fade-in {
              animation: fadeIn 0.2s ease-out forwards;
            }
            .custom-slide-up-fade {
              animation: slideUpFade 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
          <div className="bg-white w-full max-w-[320px] border border-zinc-200 p-6 flex flex-col gap-4 relative shadow-2xl rounded-[2px] custom-slide-up-fade">
            
            {/* Close Button */}
            <button 
              onClick={() => {
                setShowAuthModal(false);
                setAuthStep('email');
                setAuthEmail('');
                setAuthOtp('');
                setAuthError('');
              }} 
              className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors"
            >
              <span className="text-[10px] uppercase font-bold tracking-widest">[close]</span>
            </button>

            <div className={shakeModal ? 'animate-shake' : ''}>
              {authStep === 'success' ? (
                <div className="flex flex-col items-center justify-center py-6 text-center animate-scale-in">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-emerald-500 mb-3">
                    <svg className="w-4 h-4 text-emerald-500 stroke-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="font-lovelo-black text-sm tracking-wider text-black">VERIFIED</h3>
                  <span className="text-[8px] text-zinc-400 uppercase tracking-widest font-medium mt-1">Redirecting to checkout...</span>
                </div>
              ) : authStep === 'email' ? (
                <form onSubmit={sendVerificationOtp} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2 mt-2 mb-1 items-center">
                    <div className="flex items-center justify-center gap-2">
                      <img src="/logo_t.svg" alt="Aesthetx Ways Logo" className="w-5.5 h-5.5 object-contain shrink-0" />
                      <span className="font-lovelo-black text-sm tracking-wider text-black leading-none pt-0.5">AESTHETX WAYS</span>
                    </div>
                    <span className="text-[8px] text-zinc-400 uppercase tracking-widest font-medium text-center">Verify your email to proceed</span>
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <label className="text-[8px] uppercase tracking-wider text-zinc-900 font-bold">Email Address</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="ENTER YOUR EMAIL"
                      className="border-b border-zinc-200 focus-within:border-black bg-transparent text-[10px] tracking-wider py-1.5      outline-none text-black placeholder-zinc-300"
                    />
                  </div>

                  {authError && (
                    <span className="text-[8px] text-red-500 tracking-wider font-semibold">{authError}</span>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full flex items-center justify-center text-[9px] tracking-[0.2em] uppercase font-bold py-3 bg-black text-white hover:bg-zinc-900 rounded-[1px] disabled:bg-zinc-400 transition-colors mt-2"
                  >
                    {authLoading ? 'Sending...' : 'Send Verification Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyOtpCode} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2 mt-2 mb-1 items-center">
                    <div className="flex items-center justify-center gap-2">
                      <img src="/logo_t.svg" alt="Aesthetx Ways Logo" className="w-5.5 h-5.5 object-contain shrink-0" />
                      <span className="font-lovelo-black text-sm tracking-wider text-black leading-none pt-0.5">AESTHETX WAYS</span>
                    </div>
                    <span className="text-[8px] text-zinc-400 uppercase tracking-widest font-medium text-center">Verification code sent to {authEmail}</span>
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <label className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold">6-Digit Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={authOtp}
                      onChange={(e) => setAuthOtp(e.target.value)}
                      placeholder="ENTER CODE"
                      className="border-b border-zinc-200 focus-within:border-black bg-transparent text-xs font-mono tracking-[0.2em] py-1.5 text-center outline-none text-black placeholder-zinc-300 uppercase"
                    />
                  </div>

                  {authError && (
                    <span className="text-[8px] text-red-500 tracking-wider font-semibold">{authError}</span>
                  )}

                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full flex items-center justify-center text-[9px] tracking-[0.2em] uppercase font-bold py-3 bg-black text-white hover:bg-zinc-900 rounded-[1px] disabled:bg-zinc-400 transition-colors"
                    >
                      {authLoading ? 'Verifying...' : 'Verify & Continue'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthStep('email');
                        setAuthOtp('');
                        setAuthError('');
                      }}
                      className="text-[8px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black transition-colors py-1 mt-1 text-center"
                    >
                      Back to email
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
