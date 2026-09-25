'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { getCachedImage } from '@/lib/mediaCache';
import Confetti from '@/components/Confetti';
import FallbackImage from '@/components/FallbackImage';
import { trackEvent } from '@/lib/analytics';
import { getProductPricing } from '@/lib/pricing';

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

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [generatedOrderNum, setGeneratedOrderNum] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [showFeeDetails, setShowFeeDetails] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [phoneLookupLoading, setPhoneLookupLoading] = useState(false);
  const [returningCustomerFound, setReturningCustomerFound] = useState(false);
  const [returningCustomerName, setReturningCustomerName] = useState('');
  const lastLookedUpPhoneRef = useRef('');

  // Form Fields
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    houseNo: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [selectedMethod, setSelectedMethod] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [paymentSectionVisible, setPaymentSectionVisible] = useState(false);
  const paymentSectionRef = useRef(null);

  const handleProceedToPayment = () => {
    const cleanPhone = (form.phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    // Validation
    if (!form.fullName || !form.email || !form.address || !form.houseNo || !form.area || !form.city || !form.state || !form.pincode) {
      alert('Please fill in all shipping details');
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      alert('Please enter a valid 6-digit PIN code');
      return;
    }

    setPaymentSectionVisible(true);
    
    setTimeout(() => {
      if (paymentSectionRef.current) {
        paymentSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Real-time autosave to database
  const handleAutoSave = useCallback(async (field, value) => {
    let emailToUse = '';
    const userStr = localStorage.getItem('aw_user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj && userObj.email) {
          emailToUse = userObj.email;
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (!emailToUse && form.email) {
      emailToUse = form.email;
    }
    if (!emailToUse) return;

    try {
      await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          updates: { [field]: value },
        }),
      });
    } catch (err) {
      console.error('Autosave error:', err);
    }
  }, [form.email]);

  // Load cart and check for existing session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let cart = [];
      try {
        cart = JSON.parse(localStorage.getItem('aw_cart') || '[]');
      } catch (e) {
        cart = [];
      }
      if (cart.length === 0) {
        router.push('/cart');
        return;
      }
      setCartItems(cart);

      const savedCoupon = localStorage.getItem('aw_coupon');
      if (savedCoupon) {
        try {
          setAppliedCoupon(JSON.parse(savedCoupon));
        } catch (e) {
          console.error(e);
        }
      }

      // Check if user session already exists in localStorage
      const userStr = localStorage.getItem('aw_user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj) {
            setForm((prev) => ({
              ...prev,
              fullName: userObj.name || prev.fullName,
              email: userObj.email || prev.email,
              phone: userObj.phone || prev.phone,
            }));

            if (userObj.email) {
              fetch(`/api/auth/profile?email=${encodeURIComponent(userObj.email)}`)
                .then((res) => res.json())
                .then((data) => {
                  if (data.success && data.user) {
                    setForm((prev) => ({
                      ...prev,
                      fullName: data.user.fullName || prev.fullName,
                      phone: data.user.phone || prev.phone,
                      email: data.user.email || prev.email,
                      address: data.user.address || prev.address,
                      houseNo: data.user.houseNo || prev.houseNo,
                      area: data.user.area || prev.area,
                      city: data.user.city || prev.city,
                      state: data.user.state || prev.state,
                      pincode: data.user.pincode || prev.pincode,
                    }));
                  }
                })
                .catch((e) => console.error('Failed to load profile:', e));
            }
          }
        } catch (err) {
          console.error('Failed to parse user session:', err);
        }
      }

      setLoading(false);
    }
  }, [router]);

  // Live phone number profile lookup for returning customers
  useEffect(() => {
    let active = true;
    const cleanPhone = (form.phone || '').replace(/\D/g, '').slice(-10);

    if (cleanPhone.length === 10 && cleanPhone !== lastLookedUpPhoneRef.current) {
      lastLookedUpPhoneRef.current = cleanPhone;
      setPhoneLookupLoading(true);

      fetch(`/api/auth/phone-lookup?phone=${cleanPhone}`)
        .then((res) => res.json())
        .then((data) => {
          if (!active) return;
          if (data.success && data.found && data.user) {
            setReturningCustomerFound(true);
            setReturningCustomerName(data.user.fullName || '');

            setForm((prev) => ({
              ...prev,
              fullName: data.user.fullName || prev.fullName,
              email: data.user.email || prev.email,
              address: data.user.address || prev.address,
              houseNo: data.user.houseNo || prev.houseNo,
              area: data.user.area || prev.area,
              city: data.user.city || prev.city,
              state: data.user.state || prev.state,
              pincode: data.user.pincode || prev.pincode,
            }));

            // Sync user session
            const session = {
              id: data.user.id,
              name: data.user.fullName,
              email: data.user.email,
              phone: cleanPhone,
              loggedIn: true,
            };
            localStorage.setItem('aw_user', JSON.stringify(session));
          } else {
            setReturningCustomerFound(false);
          }
        })
        .catch((err) => {
          console.error('Phone lookup error:', err);
        })
        .finally(() => {
          if (active) setPhoneLookupLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [form.phone]);

  // Auto-fetch city, state, area on valid pincode entry
  useEffect(() => {
    let active = true;
    const fetchPincodeDetails = async () => {
      const pin = (form.pincode || '').trim();
      if (/^\d{6}$/.test(pin)) {
        setTimeout(() => {
          if (active) setPincodeLoading(true);
        }, 0);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
          const data = await res.json();
          if (active && data && data[0] && data[0].Status === 'Success') {
            const postOffices = data[0].PostOffice;
            if (postOffices && postOffices.length > 0) {
              const info = postOffices[0];
              const updatedFields = {
                city: info.District || '',
                state: info.State || '',
                area: info.Name || '',
              };
              
              setTimeout(() => {
                if (!active) return;
                setForm((prev) => ({
                  ...prev,
                  ...updatedFields,
                }));

                // Autosave to backend dynamically
                Object.entries(updatedFields).forEach(([field, value]) => {
                  if (value) {
                    handleAutoSave(field, value);
                  }
                });
              }, 0);
            }
          }
        } catch (err) {
          console.error('Failed to fetch pincode details:', err);
        } finally {
          setTimeout(() => {
            if (active) setPincodeLoading(false);
          }, 0);
        }
      }
    };

    fetchPincodeDetails();
    return () => {
      active = false;
    };
  }, [form.pincode, handleAutoSave]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Calculations (synchronized with Cart page)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const itemsSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isFreeShipping = itemsSubtotal >= 1000 || itemsSubtotal <= 1;
  const shippingCost = isFreeShipping ? 0 : 70;
  const protectPromiseFee = totalItems * 9;
  
  // Total MRP and savings calculation
  const totalMRP = cartItems.reduce((sum, item) => {
    if (item.productId === 'aw-carry-bag') return sum + item.price * item.quantity;
    const pricing = getProductPricing(item.price, item.productId);
    return sum + (pricing.originalPrice || item.price) * item.quantity;
  }, 0);
  const totalBagDiscount = Math.max(0, totalMRP - itemsSubtotal);

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
  
  const estimatedTotal = Math.max(0, itemsSubtotal + shippingCost + protectPromiseFee - couponDiscount);
  const totalSavings = totalBagDiscount + couponDiscount + (itemsSubtotal >= 1000 ? 70 : 0);

  const handleApplyCouponInCheckout = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (code === 'AESTHETX10') {
      const couponData = { code: 'AESTHETX10', discountType: 'percentage', discountValue: 10 };
      setAppliedCoupon(couponData);
      localStorage.setItem('aw_coupon', JSON.stringify(couponData));
      setCouponInput('');
      setCouponError('');
    } else if (code === 'FIRSTORDER') {
      if (itemsSubtotal < 500) {
        setCouponError('Minimum order value of ₹500 required');
        return;
      }
      const couponData = { code: 'FIRSTORDER', discountType: 'flat', discountValue: 150 };
      setAppliedCoupon(couponData);
      localStorage.setItem('aw_coupon', JSON.stringify(couponData));
      setCouponInput('');
      setCouponError('');
    } else {
      setCouponError('Invalid promo code');
    }
  };

  const handleRemoveCouponInCheckout = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('aw_coupon');
    setCouponError('');
  };

  const handlePlaceOrder = async (e, forceConfirm = false) => {
    if (e && e.preventDefault) e.preventDefault();

    // Validation
    if (!form.fullName || !form.phone || !form.email || !form.address || !form.houseNo || !form.area || !form.city || !form.state || !form.pincode) {
      alert('Please fill in all shipping details');
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      alert('Please enter a valid 6-digit PIN code');
      return;
    }

    try {
      setPlacingOrder(true);

      // Pre-flight stock check before payment initiation
      try {
        const prodRes = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
        const prodData = await prodRes.json();
        if (prodData.success && prodData.products) {
          for (const item of cartItems) {
            if (item.productId === 'aw-carry-bag') continue;
            const p = prodData.products.find(prod => prod.itemId === item.productId);
            if (p && p.sizeStock) {
              const currentStock = p.sizeStock[item.size] || 0;
              if (currentStock < item.quantity) {
                alert(`Insufficient stock for ${item.name} (${item.size}). Only ${currentStock} available.`);
                setPlacingOrder(false);
                router.push('/cart');
                return;
              }
            }
          }
        }
      } catch (checkErr) {
        console.warn('Pre-flight stock verification skipped:', checkErr);
      }

      const payAmount = estimatedTotal;

      // 1. Create Razorpay order on backend
      const orderRes = await fetch('/api/checkout/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: payAmount }),
      });
      
      const orderResult = await orderRes.json();
      if (!orderResult.success) {
        alert(orderResult.message || 'Failed to initialize payment. Please try again.');
        setPlacingOrder(false);
        return;
      }

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load Razorpay payment gateway script. Please check your network connection.');
        setPlacingOrder(false);
        return;
      }

      // 3. Open Razorpay payment gateway modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderResult.amount,
        currency: orderResult.currency,
        name: 'Aesthetxways',
        description: 'Prepaid Order Payment',
        image: 'https://manage.aesthetxways.com/logo.png',
        order_id: orderResult.orderId,
        handler: async function (response) {
          try {
            setPlacingOrder(true);
            
            // 4. Place order with signature verification details
            const orderData = {
              items: cartItems,
              customerDetails: form,
              paymentMethod,
              orderTotal: estimatedTotal,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            };

            const res = await fetch('/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(orderData),
            });

            const data = await res.json();

            if (data.success) {
              setGeneratedOrderNum(data.orderNumber);
              
              // Automatically initialize and save local user session
              const userSession = {
                id: (data.userId && typeof data.userId === 'string' && !data.userId.startsWith('m97'))
                  ? data.userId
                  : undefined,
                name: form.fullName,
                email: form.email,
                phone: form.phone,
                loggedIn: true,
              };
              localStorage.setItem('aw_user', JSON.stringify(userSession));

              // Save order to browser local storage for Orders history page
              const existingOrders = JSON.parse(localStorage.getItem('aw_orders') || '[]');
              existingOrders.unshift({
                orderNumber: data.orderNumber,
                date: new Date().toISOString(),
                items: cartItems,
                total: estimatedTotal,
                status: 'pending',
                customerDetails: form,
              });
              localStorage.setItem('aw_orders', JSON.stringify(existingOrders));

              trackEvent('action', 'purchase_complete', {
                orderNumber: data.orderNumber,
                items: cartItems.map(item => ({
                  productId: item.productId,
                  name: item.name,
                  price: item.price,
                  size: item.size,
                  quantity: item.quantity
                })),
                total: estimatedTotal,
                paymentMethod: paymentMethod
              });

              // Clear Cart & Coupon
              localStorage.removeItem('aw_cart');
              localStorage.removeItem('aw_coupon');
              window.dispatchEvent(new Event('cart-updated'));
              window.dispatchEvent(new Event('orders-updated'));

              setOrderSuccess(true);
              setTimeout(() => {
                router.push('/orders');
              }, 4000);
            } else {
              alert(data.message || 'Payment verified but failed to place order. Please contact support.');
            }
          } catch (err) {
            console.error(err);
            alert('An error occurred while confirming your payment and placing order.');
          } finally {
            setPlacingOrder(false);
          }
        },
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
          method: selectedMethod,
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function () {
            setPlacingOrder(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert('An error occurred while initiating your order.');
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col bg-white justify-center items-center py-32">
        <span className="text-xs tracking-widest uppercase text-black font-semibold animate-pulse">Loading checkout...</span>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="flex flex-col flex-1 bg-white justify-center items-center py-20 px-6 text-center animate-scale-in relative overflow-hidden min-h-[400px]">
        <Confetti />
        <CheckCircle2 className="w-14 h-14 text-emerald-600 stroke-[2] mb-4" />
        <h1 className="text-base font-bold tracking-tight text-zinc-900">Your order has been confirmed</h1>
        <span className="text-xs tracking-wider font-mono text-zinc-500 block mt-2">ORDER ID: {generatedOrderNum}</span>
        <p className="text-xs text-zinc-500 mt-4 max-w-[280px] leading-relaxed">
          Thank you for shopping with AesthetX Ways. Now we are redirecting you to your orders...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white relative pb-32 w-full overflow-x-hidden">
      {/* Sleek Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-zinc-950 hover:text-black">
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
        <span className="text-[12px] tracking-[0.15em] uppercase font-bold text-zinc-900">Checkout</span>
        <div className="w-4 h-4"></div>
      </header>

      <main className="flex-1 px-4 py-3 flex flex-col w-full overflow-x-hidden pb-36">
        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4" autoComplete="off">
          {/* 1. Shipping details form */}
          <div>
            <span className="text-xs tracking-[0.15em] uppercase text-zinc-900 font-bold block mb-2.5">Shipping Details</span>
            
            <div className="flex flex-col gap-4">
              {/* Mobile Number (Primary identification) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                    Mobile Number
                  </label>
                  {phoneLookupLoading && (
                    <span className="text-[10px] text-zinc-400 font-medium animate-pulse">Checking...</span>
                  )}
                </div>
                <div className="flex items-center border border-zinc-300 rounded-[6px] focus-within:border-black bg-white transition-colors overflow-hidden">
                  <span className="px-3.5 py-2.5 text-xs font-semibold text-zinc-700 border-r border-zinc-200 bg-zinc-50 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    required
                    maxLength={10}
                    value={form.phone}
                    onChange={handleChange}
                    onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                    placeholder="10-digit mobile number"
                    className="flex-1 text-sm px-3.5 py-2.5 outline-none text-black placeholder:text-zinc-400 font-mono"
                    autoComplete="nope"
                  />
                </div>

                {/* Returning customer recognized banner */}
                {returningCustomerFound && (
                  <div className="mt-1 bg-zinc-50 border border-zinc-200 rounded-[6px] px-3.5 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5] shrink-0" />
                      <span className="text-xs text-zinc-700 font-medium">
                        Welcome back{returningCustomerName ? `, ${returningCustomerName}` : ''}! Saved details loaded.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReturningCustomerFound(false)}
                      className="text-[10px] uppercase tracking-wider text-zinc-500 hover:text-black underline font-semibold shrink-0"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Customer Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={form.fullName}
                    onChange={handleChange}
                    onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                    placeholder="e.g. John Doe"
                    className="border border-zinc-300 rounded-[6px] text-sm px-3.5 py-2.5 outline-none focus:border-black text-black placeholder:text-zinc-400 transition-colors"
                    autoComplete="nope"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                    placeholder="name@example.com"
                    className="border border-zinc-300 rounded-[6px] text-sm px-3.5 py-2.5 outline-none focus:border-black text-black placeholder:text-zinc-400 transition-colors"
                    autoComplete="nope"
                  />
                </div>
              </div>

              {/* Full Address (Road / Street) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Full Address (Road, Street)</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={form.address}
                  onChange={handleChange}
                  onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                  placeholder="Flat/House No, Building, Street Address"
                  className="border border-zinc-300 rounded-[6px] text-sm px-3.5 py-2.5 outline-none focus:border-black text-black placeholder:text-zinc-400 transition-colors"
                  autoComplete="nope"
                />
              </div>

              {/* House No & Area */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">House No. / Flat</label>
                  <input
                    type="text"
                    name="houseNo"
                    required
                    value={form.houseNo}
                    onChange={handleChange}
                    onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                    placeholder="e.g. Flat 402"
                    className="border border-zinc-300 rounded-[6px] text-sm px-3.5 py-2.5 outline-none focus:border-black text-black placeholder:text-zinc-400 transition-colors"
                    autoComplete="nope"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Area / Colony Name</label>
                  <input
                    type="text"
                    name="area"
                    required
                    value={form.area}
                    onChange={handleChange}
                    onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                    placeholder="e.g. Sector 5, Colony"
                    className="border border-zinc-300 rounded-[6px] text-sm px-3.5 py-2.5 outline-none focus:border-black text-black placeholder:text-zinc-400 transition-colors"
                    autoComplete="nope"
                  />
                </div>
              </div>

              {/* City, State, PIN Code */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={form.city}
                    onChange={handleChange}
                    onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="border border-zinc-300 rounded-[6px] text-sm px-3 py-2.5 outline-none focus:border-black text-black placeholder:text-zinc-400 transition-colors"
                    autoComplete="nope"
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">State</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={form.state}
                    onChange={handleChange}
                    onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                    placeholder="e.g. MH"
                    className="border border-zinc-300 rounded-[6px] text-sm px-3 py-2.5 outline-none focus:border-black text-black placeholder:text-zinc-400 transition-colors"
                    autoComplete="nope"
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">PIN Code</label>
                    {pincodeLoading && (
                      <span className="text-[9px] text-zinc-400 animate-pulse font-medium">...</span>
                    )}
                  </div>
                  <input
                    type="text"
                    name="pincode"
                    required
                    maxLength={6}
                    value={form.pincode}
                    onChange={handleChange}
                    onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                    placeholder="6-digit"
                    className="border border-zinc-300 rounded-[6px] text-sm px-3 py-2.5 outline-none focus:border-black text-black placeholder:text-zinc-400 transition-colors font-mono"
                    autoComplete="nope"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Payment Options Selection */}
          <div ref={paymentSectionRef} className="mt-4 pt-4 border-t border-zinc-100 flex flex-col gap-3">
            <span className="text-xs tracking-[0.15em] uppercase text-zinc-900 font-bold block">Payment Options</span>
            
            <div className="flex flex-col gap-2.5">
              {/* UPI Option */}
              <div 
                onClick={() => {
                  setSelectedMethod('upi');
                  setPaymentMethod('UPI');
                }}
                className={`relative overflow-hidden border p-3.5 flex items-center justify-between cursor-pointer transition-all duration-200 rounded-[8px] ${
                  selectedMethod === 'upi'
                    ? 'border-black bg-zinc-50/50 shadow-xs ring-1 ring-black' 
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-xs font-bold text-zinc-900">UPI (GPay / PhonePe / Paytm)</span>
                    <span className="text-[11px] text-zinc-400 font-normal">Pay instantly using any UPI App or QR</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 ml-2">
                  <div className="overflow-hidden rounded-[6px] flex items-center justify-center">
                    <img 
                      src="/payment-icon/upi-options.png" 
                      alt="UPI (GPay / PhonePe / Paytm)" 
                      className="h-12 sm:h-14 w-auto object-contain shrink-0 mix-blend-multiply" 
                    />
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedMethod === 'upi' ? 'border-black' : 'border-zinc-300'}`}>
                    {selectedMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                  </div>
                </div>
              </div>

              {/* Cards Option */}
              <div 
                onClick={() => {
                  setSelectedMethod('card');
                  setPaymentMethod('CARD');
                }}
                className={`border p-3.5 flex items-center justify-between cursor-pointer transition-all duration-200 rounded-[8px] ${
                  selectedMethod === 'card'
                    ? 'border-black bg-zinc-50/50 shadow-xs ring-1 ring-black' 
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-xs font-bold text-zinc-900">Credit / Debit Cards</span>
                  <span className="text-[11px] text-zinc-400 font-normal">Visa, MasterCard, RuPay, Maestro</span>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedMethod === 'card' ? 'border-black' : 'border-zinc-300'}`}>
                  {selectedMethod === 'card' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                </div>
              </div>

              {/* Net Banking Option */}
              <div 
                onClick={() => {
                  setSelectedMethod('netbanking');
                  setPaymentMethod('NETBANKING');
                }}
                className={`border p-3.5 flex items-center justify-between cursor-pointer transition-all duration-200 rounded-[8px] ${
                  selectedMethod === 'netbanking'
                    ? 'border-black bg-zinc-50/50 shadow-xs ring-1 ring-black' 
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-xs font-bold text-zinc-900">Net Banking</span>
                  <span className="text-[11px] text-zinc-400 font-normal">All major Indian banks supported</span>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedMethod === 'netbanking' ? 'border-black' : 'border-zinc-300'}`}>
                  {selectedMethod === 'netbanking' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Bill Summary (exact style as Cart page) */}
          <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col gap-3">
            <span className="text-xs tracking-[0.15em] uppercase text-zinc-900 font-bold block">Bill Summary</span>

            {/* Discount code or gift card form */}
            <div className="flex gap-2 w-full">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Discount code or gift card"
                className="flex-1 border border-zinc-300 rounded-[6px] px-3.5 py-2 text-sm text-black placeholder:text-zinc-400 outline-none focus:border-black transition-colors"
              />
              <button
                type="button"
                onClick={handleApplyCouponInCheckout}
                disabled={!couponInput.trim()}
                className="bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 text-zinc-900 font-semibold text-sm px-4 py-2 rounded-[6px] border border-zinc-200 transition-colors shrink-0"
              >
                Apply
              </button>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between items-center text-xs text-green-700 bg-green-50/80 px-2.5 py-1.5 rounded-[4px] border border-green-100">
                <span className="font-medium">Coupon applied: {appliedCoupon.code}</span>
                <button 
                  type="button"
                  onClick={handleRemoveCouponInCheckout}
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
            <div className="flex flex-col gap-1.5 pt-1">
              {totalBagDiscount > 0 && (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-normal">Total MRP</span>
                    <span className="font-semibold text-zinc-400 font-mono text-sm shrink-0 text-right pr-1 line-through">
                      {formatPrice(totalMRP)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-green-600">
                    <span className="font-normal">Bag Discount</span>
                    <span className="font-semibold font-mono text-sm shrink-0 text-right pr-1">
                      -{formatPrice(totalBagDiscount)}
                    </span>
                  </div>
                </>
              )}

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
                </span>
                <span className="font-semibold text-black text-sm shrink-0 text-right pr-1 font-mono">
                  {isFreeShipping ? 'FREE' : formatPrice(shippingCost)}
                </span>
              </div>

              {/* 3. Protect Promise Fee */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-700 font-normal">
                  Protect Promise Fee ({totalItems} {totalItems === 1 ? 'item' : 'items'} × ₹9)
                </span>
                <span className="font-semibold text-black text-sm shrink-0 text-right pr-1 font-mono">
                  {formatPrice(protectPromiseFee)}
                </span>
              </div>

              {/* 4. Total */}
              <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                <span className="text-base font-bold text-black">Total</span>
                <span className="text-base font-bold text-black font-mono shrink-0 text-right pr-1">
                  {formatPrice(estimatedTotal)}
                </span>
              </div>

              {totalSavings > 0 && (
                <div className="bg-emerald-50 border border-dashed border-emerald-300 rounded px-2.5 py-1.5 flex items-center justify-between text-[11px] font-bold text-emerald-700 tracking-wide mt-1 select-none">
                  <span>Total Savings on this order</span>
                  <span className="font-mono">{formatPrice(totalSavings)}</span>
                </div>
              )}
            </div>
          </div>

          {/* 4. Order Items */}
          <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col gap-3">
            <span className="text-xs tracking-[0.15em] uppercase text-zinc-900 font-bold block">Order Items</span>
            <div className="flex flex-col border border-zinc-200/80 rounded-[8px] p-3 divide-y divide-zinc-100 bg-white">
              {cartItems.map((item, idx) => (
                <div key={`${item.productId}-${item.size}-${idx}`} className="h-[70px] shrink-0 flex items-center justify-between gap-3">
                  {/* Product Image with Top-Right Quantity Indicator Marker */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 bg-zinc-50 border border-zinc-200/80 rounded-[8px] overflow-hidden block">
                      <FallbackImage 
                        src={getCachedImage(item.productId, item.image)} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        logoSize="w-5 h-5"
                      />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-black text-white text-[9.5px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs z-10 select-none">
                      {item.quantity}
                    </span>
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="text-[13.5px] font-semibold text-black tracking-tight leading-snug line-clamp-1">
                      {item.name}
                    </h3>
                    <span className="text-[11.5px] text-zinc-400 font-normal block mt-0.5">
                      {getDisplaySize(item.size, item.sizeDisplayType)}
                    </span>
                  </div>

                  {/* Total Item Price */}
                  <div className="shrink-0 text-right flex flex-col items-end pl-2">
                    <span className="text-[13.5px] font-semibold text-black font-mono select-none shrink-0 pr-1">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    {(() => {
                      if (item.productId === 'aw-carry-bag') return null;
                      const p = getProductPricing(item.price, item.productId);
                      if (p.originalPrice > item.price) {
                        return (
                          <span className="text-[11px] text-zinc-400 line-through font-mono pr-1 select-none">
                            {formatPrice(p.originalPrice * item.quantity)}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Place Order Sticky Action Button */}
          <div className="fixed bottom-11 left-0 right-0 z-40 bg-white border-t border-zinc-100 px-4 py-3 max-w-[430px] mx-auto shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            {paymentSectionVisible ? (
              <button
                type="submit"
                disabled={placingOrder}
                className="w-full flex items-center justify-center text-[11px] tracking-[0.2em] uppercase font-bold py-3.5 bg-black text-white hover:bg-zinc-900 rounded-[6px] disabled:opacity-50 transition-colors shadow-sm"
              >
                {placingOrder 
                  ? 'Processing...' 
                  : `Pay ${formatPrice(estimatedTotal)} via ${selectedMethod === 'upi' ? 'UPI' : selectedMethod === 'card' ? 'Card' : 'Net Banking'}`
                }
              </button>
            ) : (
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="w-full flex items-center justify-center text-[11px] tracking-[0.2em] uppercase font-bold py-3.5 bg-black text-white hover:bg-zinc-900 rounded-[6px] transition-colors shadow-sm"
              >
                Proceed to Payment
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
