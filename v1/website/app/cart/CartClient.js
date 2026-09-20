'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Plus, Minus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { getCachedImage } from '@/lib/mediaCache';
import FallbackImage from '@/components/FallbackImage';
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

const formatPrice = (amount) => {
  return `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
    if (deletingItems.includes(key)) return;
    setDeletingItems((prev) => [...prev, key]);
    setTimeout(() => {
      removeItem(productId, size);
      setDeletingItems((prev) => prev.filter((k) => k !== key));
    }, 450);
  };

  const handleIncrease = (productId, size) => {
    updateQuantity(productId, size, 1);
  };

  const handleDecrease = (productId, size) => {
    const currentItem = cartItems.find((i) => i.productId === productId && i.size === size);
    if (!currentItem) return;
    if (currentItem.quantity <= 1) {
      handleDeleteClick(productId, size);
    } else {
      updateQuantity(productId, size, -1);
    }
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
  const isFreeShipping = itemsSubtotal >= 1000 || itemsSubtotal <= 1;
  const shippingCost = isFreeShipping ? 0 : 70;
  
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
  
  const estimatedTotal = Math.max(0, itemsSubtotal + shippingCost - couponDiscount);

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

    router.push('/checkout');
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
    <div className="flex flex-col flex-1 bg-white relative pb-16 w-full overflow-x-hidden">
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
            max-height: 70px;
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
        <span className="text-[12px] tracking-[0.15em] uppercase font-bold text-zinc-900">Shopping Bag</span>
        <div className="w-4 h-4"></div> {/* spacer */}
      </header>

      {/* Bag Items list */}
      <main className={`flex-1 px-4 py-3 flex flex-col w-full overflow-x-hidden ${cartItems.length > 0 ? 'pb-[250px]' : ''}`}>
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
          <div className="flex-1 flex flex-col justify-between w-full">
            {/* Items container: sized to 280px so exactly 4 items (4 x 70px) fit perfectly */}
            <div className="flex flex-col h-[280px] max-h-[280px] overflow-y-auto scrollbar-hide snap-y snap-mandatory">
              {cartItems.map((item, idx) => {
              const itemKey = `${item.productId}-${item.size}`;
              const isDeleting = deletingItems.includes(itemKey);
              const isNewBag = item.productId === 'aw-carry-bag' && animateNewBag;
              return (
                <div 
                  key={`${item.productId}-${item.size}-${idx}`}
                  className={`shrink-0 flex items-center justify-between gap-3 snap-start ${
                    isNewBag ? 'animate-slide-in-left' : ''
                  }`}
                  style={{
                    height: isDeleting ? '0px' : '70px',
                    maxHeight: isDeleting ? '0px' : '70px',
                    opacity: isDeleting ? 0 : 1,
                    transform: isDeleting ? 'translateX(-110%)' : 'translateX(0)',
                    overflow: isDeleting ? 'hidden' : 'visible',
                    pointerEvents: isDeleting ? 'none' : 'auto',
                    transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease-out, height 0.45s cubic-bezier(0.16, 1, 0.3, 1), maxHeight 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Product Image with Top-Right Quantity Indicator Marker */}
                  <div className="relative shrink-0">
                    <Link 
                      href={`/product/${item.productId}`}
                      className="w-14 h-14 bg-zinc-50 border border-zinc-200/80 rounded-[8px] overflow-hidden block hover:opacity-90 transition-opacity"
                    >
                      <FallbackImage 
                        src={getCachedImage(item.productId, item.image)} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        logoSize="w-5 h-5"
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(item.productId, item.size)}
                      title="Click to remove"
                      className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1  text-white text-[9.5px] font-bold rounded-full flex items-center justify-center  z-10 select-none"
                    >
                      {item.quantity}
                    </button>
                  </div>
                  
                  {/* Name & Size */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <Link 
                      href={`/product/${item.productId}`}
                      className="hover:opacity-85 transition-opacity group"
                    >
                      <h3 className="text-[13.5px] font-semibold text-black tracking-tight leading-snug line-clamp-1 group-hover:underline">
                        {item.name}
                      </h3>
                      <span className="text-[11.5px] text-zinc-400 font-normal block mt-0.5">
                        {getDisplaySize(item.size, item.sizeDisplayType)}
                      </span>
                    </Link>
                  </div>

                  {/* Right Side: Total Price and Quantity Increment/Decrement Controls */}
                  <div className="shrink-0 flex flex-col items-end justify-center pl-2 select-none">
                    <span className="text-[13.5px] font-semibold text-black font-mono select-none shrink-0 pr-0.5 leading-none">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <div className="flex items-center gap-1 mt-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDecrease(item.productId, item.size);
                        }}
                        title="Decrease quantity"
                        className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-zinc-700 hover:text-black transition-all cursor-pointer "
                      >
                        <Minus className="w-2.5 h-2.5 stroke-[2.5]" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleIncrease(item.productId, item.size);
                        }}
                        title="Increase quantity"
                        className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-zinc-700 hover:text-black transition-all cursor-pointer "
                      >
                        <Plus className="w-2.5 h-2.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>

            {/* Bill Summary Section (Fixed to the bottom of the screen) */}
            <div className="fixed bottom-11 left-0 right-0 z-40 bg-white border-t border-zinc-100 px-4 pt-3 pb-2 flex flex-col gap-2.5 max-w-[430px] mx-auto shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
              {/* Discount code or gift card form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2 w-full">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Discount code or gift card"
                  className="flex-1 border border-zinc-300 rounded-[6px] px-3.5 py-2 text-sm text-black placeholder:text-zinc-400 outline-none focus:border-black transition-colors"
                />
                <button
                  type="submit"
                  disabled={!couponCode.trim()}
                  className="bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 text-zinc-900 font-semibold text-sm px-4 py-2 rounded-[6px] border border-zinc-200 transition-colors shrink-0"
                >
                  Apply
                </button>
              </form>

              {appliedCoupon && (
                <div className="flex justify-between items-center text-xs text-green-700 bg-green-50/80 px-2.5 py-1.5 rounded-[4px] border border-green-100">
                  <span className="font-medium">Coupon applied: {appliedCoupon.code}</span>
                  <button 
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-zinc-400 hover:text-red-500 text-xs underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <span className="text-xs text-red-500 font-medium">{couponError}</span>
              )}

              {/* Bill Summary Rows */}
              <div className="flex flex-col gap-1.5 pt-0.5">
                {/* 1. Subtotal · X items */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-700 font-normal">
                    Subtotal · {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                  <span className="font-semibold text-black font-mono text-sm shrink-0 text-right pr-1">
                    {formatPrice(itemsSubtotal)}
                  </span>
                </div>

                {/* Coupon discount line (if applied) */}
                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm text-green-600">
                    <span className="font-normal">Discount ({appliedCoupon.code})</span>
                    <span className="font-semibold font-mono text-sm shrink-0 text-right pr-1">
                      -{formatPrice(couponDiscount)}
                    </span>
                  </div>
                )}

                {/* 2. Shipping (if above ₹1000 free, else ₹70) */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-700 font-normal flex items-center gap-1">
                    Shipping
                    <span className="w-3.5 h-3.5 rounded-full border border-zinc-300 text-[9px] text-zinc-400 flex items-center justify-center font-bold select-none">
                      ?
                    </span>
                  </span>
                  <span className="font-semibold text-black text-sm shrink-0 text-right pr-1">
                    {isFreeShipping ? 'FREE' : formatPrice(shippingCost)}
                  </span>
                </div>

                {/* 3. Total */}
                <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                  <span className="text-base font-bold text-black">Total</span>
                  <span className="text-base font-bold text-black font-mono shrink-0 text-right pr-1">
                    {formatPrice(estimatedTotal)}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full mt-0.5 flex items-center justify-center text-[10px] tracking-[0.2em] uppercase font-bold py-3 bg-black text-white hover:bg-zinc-900 rounded-[4px] transition-colors shadow-sm"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>

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
