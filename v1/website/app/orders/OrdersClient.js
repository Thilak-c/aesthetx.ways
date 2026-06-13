'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import FallbackImage from '@/components/FallbackImage';
import Footer from '@/components/Footer';
import SuggestionBar from '@/components/SuggestionBar';

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

export default function OrdersClient() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);


  // Authentication states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState('email'); // 'email', 'otp', 'success'
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [shakeModal, setShakeModal] = useState(false);

  // Load orders and session from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedOrders = JSON.parse(localStorage.getItem('aw_orders') || '[]');
      setOrders(storedOrders);

      const userStr = localStorage.getItem('aw_user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj && userObj.loggedIn) {
            setUser(userObj);
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
  }, []);

  // Set dynamic browser tab title (fallback for client side router updates)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = "Aesthetx Ways | Orders";
    }
  }, []);

  // Helper to calculate estimated delivery date (4 business days after order placement)
  const getEstimatedDeliveryDate = (orderDateStr) => {
    const d = new Date(orderDateStr);
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const triggerModalShake = () => {
    setShakeModal(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80, 50, 80]); // double pulse haptic vibration
    }
    setTimeout(() => {
      setShakeModal(false);
    }, 400);
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
          email: data.user.email,
          name: data.user.name,
          loggedIn: true,
        };
        localStorage.setItem('aw_user', JSON.stringify(userSession));
        setUser(userSession);

        // Show success confirmation state inside the popup
        setAuthStep('success');
        setAuthLoading(false);

        setTimeout(() => {
          setShowAuthModal(false);
          setAuthStep('email');
          setAuthEmail('');
          setAuthOtp('');
          setAuthError('');
          // Refresh orders from local storage after login
          const storedOrders = JSON.parse(localStorage.getItem('aw_orders') || '[]');
          setOrders(storedOrders);
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
        <span className="text-[10px] tracking-widest uppercase text-zinc-400 animate-pulse">Loading orders...</span>
      </div>
    );
  }



  // --- ORDERS LIST VIEW ---
  return (
    <div className="flex flex-col flex-1 bg-white relative pb-20 min-h-[90vh]">
      {/* Sleek Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push('/')} className="text-zinc-950 hover:text-black">
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
        <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-400">Order History</span>
        <div className="w-4 h-4"></div>
      </header>

      {/* Orders List */}
      <main className="flex-1 px-4 py-4 flex flex-col justify-between min-h-[85vh]">
        {orders.length === 0 ? (
          <div className="flex min-h-[52vh] flex-col items-center justify-center text-center flex-1 py-12">
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
            <span className="text-[10px] tracking-widest uppercase text-zinc-400 font-bold">
              {!user ? 'Login Required' : 'No orders found'}
            </span>
            <p className="text-[9px] text-zinc-400 mt-1 max-w-[200px]">
              {!user 
                ? 'Please log in to view or track your orders.' 
                : "You haven't placed any orders yet."}
            </p>
            {!user ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="mt-6 text-[9px] tracking-widest uppercase font-bold bg-black text-white px-5 py-2.5 rounded-[1px] hover:bg-zinc-900 transition-colors"
              >
                Log In
              </button>
            ) : (
              <Link
                href="/"
                className="mt-6 text-[9px] tracking-widest uppercase font-bold bg-black text-white px-5 py-2.5 rounded-[1px] hover:bg-zinc-900 transition-colors"
              >
                Start shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order, idx) => (
              <div
                key={`${order.orderNumber}-${idx}`}
                onClick={() => router.push(`/orders/${order.orderNumber}`)}
                className="border border-zinc-100 rounded-[2px] p-3.5 flex flex-col gap-3.5 bg-zinc-50 hover:border-black cursor-pointer transition-colors animate-slide-up-fade"
              >
                {/* Order Header */}
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold">Order number</span>
                      <span className="text-[9.5px] font-black text-black uppercase tracking-wide ml-1">{order.orderNumber}</span>
                    </div>
                    <span className="text-[8px] text-zinc-400">
                      {new Date(order.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className="text-[7.5px] tracking-wider uppercase font-black px-2 py-0.5 rounded-[1px] bg-black text-white">
                    {order.status}
                  </span>
                </div>

                {/* Group Images Stack */}
                <div className="flex -space-x-3.5 py-1.5 items-center overflow-x-auto scrollbar-hide pl-1">
                  {order.items.map((item, itemIdx) => (
                    <div 
                      key={itemIdx} 
                      className="w-10 h-13 bg-white border border-zinc-200 rounded-[1px] overflow-hidden shrink-0 relative shadow-[2px_0_5px_rgba(0,0,0,0.05)] transition-transform hover:translate-y-[-2px]"
                      style={{ zIndex: order.items.length - itemIdx }}
                    >
                      <FallbackImage 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        hideText={true}
                        logoSize="w-4 h-4"
                      />
                      {item.quantity > 1 && (
                        <span className="absolute bottom-0.5 right-0.5 bg-black/85 text-white text-[7.5px] font-black px-1 py-0.2 rounded-[1px] leading-tight select-none z-10">
                          x{item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer Details */}
                <div className="flex justify-between items-center border-t border-zinc-100 pt-2.5 mt-0.5 text-[9px] uppercase font-medium">
                  <div className="flex items-center gap-1 text-[8.5px]">
                    <span className="text-zinc-400">Est. Delivery:</span>
                    <span className="text-black font-bold">{getEstimatedDeliveryDate(order.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-400">Total:</span>
                    <span className="font-bold text-black font-mono">₹{order.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <SuggestionBar />
        <Footer />
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
                  <span className="text-[8px] text-zinc-400 uppercase tracking-widest font-medium mt-1">Logging you in...</span>
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
