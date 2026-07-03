'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { getCachedImage } from '@/lib/mediaCache';
import Confetti from '@/components/Confetti';
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
  const [showFeeDetails, setShowFeeDetails] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

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

    setPaymentSectionVisible(true);
    
    setTimeout(() => {
      if (paymentSectionRef.current) {
        paymentSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Real-time autosave to database
  const handleAutoSave = useCallback(async (field, value) => {
    const userStr = localStorage.getItem('aw_user');
    if (!userStr) return;
    try {
      const userObj = JSON.parse(userStr);
      if (!userObj || !userObj.email) return;

      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userObj.email,
          updates: { [field]: value },
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Sync local storage if name changed
        if (field === 'fullName') {
          userObj.name = value;
          localStorage.setItem('aw_user', JSON.stringify(userObj));
        }
      }
    } catch (err) {
      console.error('Autosave error:', err);
    }
  }, []);

  // Load cart, verify session, and fetch user profile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cart = JSON.parse(localStorage.getItem('aw_cart') || '[]');
      if (cart.length === 0) {
        router.push('/cart');
        return;
      }

      // Check if user is logged in
      const userStr = localStorage.getItem('aw_user');
      if (!userStr) {
        router.push('/cart');
        return;
      }

      let userObj;
      try {
        userObj = JSON.parse(userStr);
        if (!userObj || !userObj.loggedIn || !userObj.email) {
          router.push('/cart');
          return;
        }
      } catch (err) {
        console.error('Failed to parse user session:', err);
        router.push('/cart');
        return;
      }

      // Fetch user profile and setup state in a deferred manner
      let active = true;
      fetch(`/api/auth/profile?email=${encodeURIComponent(userObj.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!active) return;
          const timer = setTimeout(() => {
            setCartItems(cart);
            if (data.success && data.user) {
              if (!userObj.id && data.user.id) {
                userObj.id = data.user.id;
                localStorage.setItem('aw_user', JSON.stringify(userObj));
              }
              setForm({
                fullName: data.user.fullName || userObj.name || '',
                phone: data.user.phone || '',
                email: data.user.email || userObj.email || '',
                address: data.user.address || '',
                houseNo: data.user.houseNo || '',
                area: data.user.area || '',
                city: data.user.city || '',
                state: data.user.state || '',
                pincode: data.user.pincode || '',
              });
            } else {
              setForm((prev) => ({
                ...prev,
                email: userObj.email,
                fullName: userObj.name || '',
              }));
            }
            const savedCoupon = localStorage.getItem('aw_coupon');
            if (savedCoupon) {
              try {
                setAppliedCoupon(JSON.parse(savedCoupon));
              } catch (e) {
                console.error(e);
              }
            }
            setLoading(false);
          }, 0);
        })
        .catch((err) => {
          console.error('Failed to fetch user profile:', err);
          if (!active) return;
          const timer = setTimeout(() => {
            setCartItems(cart);
            setForm((prev) => ({
              ...prev,
              email: userObj.email,
              fullName: userObj.name || '',
            }));
            const savedCoupon = localStorage.getItem('aw_coupon');
            if (savedCoupon) {
              try {
                setAppliedCoupon(JSON.parse(savedCoupon));
              } catch (e) {
                console.error(e);
              }
            }
            setLoading(false);
          }, 0);
        });

      return () => {
        active = false;
      };
    }
  }, [router]);

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

  // Calculations
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const itemsSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = 70;
  const protectPromiseFee = totalItems * 9;
  
  const orderSubtotal = itemsSubtotal + shippingCost + protectPromiseFee;
  const freeDeliveryDiscount = itemsSubtotal >= 1000 ? -70 : 0;
  
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
        <CheckCircle2 className="w-16 h-16 text-black stroke-[2] mb-4" />
        <h1 className="text-base font-black tracking-widest uppercase text-black">Your order has been confirmed</h1>
        <span className="text-xs tracking-wider font-extrabold text-black block mt-2">ORDER ID: {generatedOrderNum}</span>
        <p className="text-xs text-black mt-4 max-w-[280px] leading-relaxed font-medium">
          Thank you for shopping with AesthetX Ways. Now we are redirecting you to our page...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white relative pb-32">
      {/* Sleek Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-black px-4 py-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-black hover:text-black">
          <ArrowLeft className="w-5 h-5 stroke-[3]" />
        </button>
        <span className="text-xs tracking-[0.2em] uppercase font-black text-black">Checkout</span>
        <div className="w-5 h-5"></div>
      </header>

      <main className="flex-1 px-4 py-4 overflow-y-auto">
        {/* 1. Cart Items listed first */}
        <section className="mb-8">
          <span className="text-xs tracking-[0.15em] uppercase text-black font-black block mb-3">Order Items</span>
          <div className="border border-black rounded-none p-4 flex flex-col gap-4">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center py-2.5 last:border-b-0 border-b border-black">
                {/* Product Image */}
                <div className="w-12 h-16 bg-white border border-black rounded-none overflow-hidden shrink-0 relative">
                  <FallbackImage 
                    src={getCachedImage(item.productId, item.image)} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                    hideText={true}
                    logoSize="w-4 h-4"
                    monochrome={true}
                  />
                  <div className="absolute top-1 left-1 z-10 pointer-events-none opacity-20">
                    <img src="/logo_t.svg" alt="Watermark Logo" className="w-2.5 h-2.5 object-contain" />
                  </div>
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-black uppercase block truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-black block mt-1 uppercase tracking-wide font-semibold">
                    Size: {getDisplaySize(item.size, item.sizeDisplayType)} &bull; Qty: {item.quantity}
                  </span>
                </div>

                {/* Total Item Price */}
                <span className="text-xs font-bold text-black font-mono shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Shipping details form */}
        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4" autoComplete="off">
          <span className="text-xs tracking-[0.15em] uppercase text-black font-black block mb-1">Shipping Details</span>
          
          {/* Group 1: Name, Phone, Email */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest text-black font-black">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={form.fullName}
                  onChange={handleChange}
                  onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                  placeholder="e.g. John Doe"
                  className="border border-black text-sm px-3.5 py-3 outline-none focus:ring-1 focus:ring-black rounded-none text-black placeholder:text-black/35"
                  autoComplete="nope"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest text-black font-black">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength={10}
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                  placeholder="10-digit mobile"
                  className="border border-black text-sm px-3.5 py-3 outline-none focus:ring-1 focus:ring-black rounded-none text-black placeholder:text-black/35"
                  autoComplete="nope"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest text-black font-black">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                placeholder="name@example.com"
                className="border border-black text-sm px-3.5 py-3 outline-none focus:ring-1 focus:ring-black rounded-none text-black placeholder:text-black/35"
                autoComplete="nope"
              />
            </div>
          </div>

          {/* Group 2: Full Address */}
          <div className="flex flex-col gap-1 mt-2">
            <label className="text-[10px] uppercase tracking-widest text-black font-black">Full Address (Road, Street)</label>
            <input
              type="text"
              name="address"
              required
              value={form.address}
              onChange={handleChange}
              onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
              placeholder="Flat/House No, Building, Street Address"
              className="border border-black text-sm px-3.5 py-3 outline-none focus:ring-1 focus:ring-black rounded-none text-black placeholder:text-black/35"
              autoComplete="nope"
            />
          </div>

          {/* Group 3: House No & Area */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest text-black font-black">House No. / Flat</label>
              <input
                type="text"
                name="houseNo"
                required
                value={form.houseNo}
                onChange={handleChange}
                onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                placeholder="e.g. Flat 402"
                className="border border-black text-sm px-3.5 py-3 outline-none focus:ring-1 focus:ring-black rounded-none text-black placeholder:text-black/35"
                autoComplete="nope"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest text-black font-black">Area / Colony Name</label>
              <input
                type="text"
                name="area"
                required
                value={form.area}
                onChange={handleChange}
                onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                placeholder="e.g. Sector 5, Colony"
                className="border border-black text-sm px-3.5 py-3 outline-none focus:ring-1 focus:ring-black rounded-none text-black placeholder:text-black/35"
                autoComplete="nope"
              />
            </div>
          </div>

          {/* Group 4: City, State, PIN Code */}
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="flex flex-col gap-1 col-span-1">
              <label className="text-[10px] uppercase tracking-widest text-black font-black">City</label>
              <input
                type="text"
                name="city"
                required
                value={form.city}
                onChange={handleChange}
                onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                placeholder="e.g. Mumbai"
                className="border border-black text-sm px-3.5 py-3 outline-none focus:ring-1 focus:ring-black rounded-none text-black placeholder:text-black/35"
                autoComplete="nope"
              />
            </div>
            <div className="flex flex-col gap-1 col-span-1">
              <label className="text-[10px] uppercase tracking-widest text-black font-black">State</label>
              <input
                type="text"
                name="state"
                required
                value={form.state}
                onChange={handleChange}
                onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                placeholder="e.g. MH"
                className="border border-black text-sm px-3.5 py-3 outline-none focus:ring-1 focus:ring-black rounded-none text-black placeholder:text-black/35"
                autoComplete="nope"
              />
            </div>
            <div className="flex flex-col gap-1 col-span-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-widest text-black font-black">PIN Code</label>
                {pincodeLoading && (
                  <span className="text-[9px] text-black font-black animate-pulse uppercase">[checking...]</span>
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
                className="border border-black text-sm px-3.5 py-3 outline-none focus:ring-1 focus:ring-black rounded-none text-black placeholder:text-black/35"
                autoComplete="nope"
              />
            </div>
          </div>

          {/* 3. Payment Options Selection */}
          <div ref={paymentSectionRef} className="mt-8 border-t border-black pt-6 flex flex-col gap-4">
            <span className="text-xs tracking-[0.15em] uppercase text-black font-black block mb-1">Select Payment Option</span>
            
            <div className="flex flex-col gap-3">
              {/* UPI Option */}
              <div 
                onClick={() => {
                  setSelectedMethod('upi');
                  setPaymentMethod('UPI');
                }}
                className={`border p-4 flex items-center justify-between cursor-pointer transition-all duration-200 rounded-none ${
                  selectedMethod === 'upi'
                    ? 'border-black bg-zinc-50 ring-1 ring-black' 
                    : 'border-zinc-300 hover:border-black'
                }`}
              >
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-black">UPI (GPay / PhonePe / Paytm)</span>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Pay instantly using any UPI App or UPI ID</span>
                </div>
                <div className="w-4 h-4 rounded-full border border-black flex items-center justify-center shrink-0">
                  {selectedMethod === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                </div>
              </div>

              {/* Cards Option */}
              <div 
                onClick={() => {
                  setSelectedMethod('card');
                  setPaymentMethod('CARD');
                }}
                className={`border p-4 flex items-center justify-between cursor-pointer transition-all duration-200 rounded-none ${
                  selectedMethod === 'card'
                    ? 'border-black bg-zinc-50 ring-1 ring-black' 
                    : 'border-zinc-300 hover:border-black'
                }`}
              >
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-black">Credit / Debit Cards</span>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Visa, MasterCard, RuPay, Maestro</span>
                </div>
                <div className="w-4 h-4 rounded-full border border-black flex items-center justify-center shrink-0">
                  {selectedMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                </div>
              </div>

              {/* Net Banking Option */}
              <div 
                onClick={() => {
                  setSelectedMethod('netbanking');
                  setPaymentMethod('NETBANKING');
                }}
                className={`border p-4 flex items-center justify-between cursor-pointer transition-all duration-200 rounded-none ${
                  selectedMethod === 'netbanking'
                    ? 'border-black bg-zinc-50 ring-1 ring-black' 
                    : 'border-zinc-300 hover:border-black'
                }`}
              >
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-black">Net Banking</span>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Secure login for all major Indian banks</span>
                </div>
                <div className="w-4 h-4 rounded-full border border-black flex items-center justify-center shrink-0">
                  {selectedMethod === 'netbanking' && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Bill Summary (same as cart page) */}
          <div className="mt-8 border-t border-black pt-6 flex flex-col gap-4">
            <span className="text-xs tracking-[0.15em] uppercase text-black font-black block mb-1">Bill Summary</span>

            {/* Item subtotal */}
            <div className="flex justify-between items-center text-xs uppercase text-black font-semibold">
              <span>Items Subtotal</span>
              <span className="font-mono text-black font-bold">₹{itemsSubtotal.toLocaleString('en-IN')}</span>
            </div>

            {/* Shipping */}
            <div className="flex justify-between items-center text-xs uppercase text-black font-semibold">
              <span>Shipping</span>
              <span className="font-mono text-black font-bold">₹{shippingCost} fixed</span>
            </div>

            {/* Fees with Toggable Dropdown */}
            <div className="flex flex-col gap-2">
              <div 
                onClick={() => setShowFeeDetails(!showFeeDetails)}
                className="flex justify-between items-center text-xs uppercase text-black font-semibold cursor-pointer hover:text-black transition-colors"
              >
                <span className="flex items-center gap-1 select-none">
                  Fees 
                  <ChevronRight className={`w-3.5 h-3.5 text-black stroke-[3.5] transition-transform duration-300 ${showFeeDetails ? 'rotate-90' : 'rotate-0'}`} />
                </span>
                <span className="font-mono text-black font-bold">₹{protectPromiseFee}</span>
              </div>
              
              <div className={`grid transition-all duration-300 ease-in-out ${showFeeDetails ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                <div className="overflow-hidden">
                  <div className="pl-3 py-2 border-l border-black bg-white flex justify-between items-center text-[10px] text-black font-bold tracking-wider">
                    <span>Protect Promise Fee (₹9 per item × {totalItems})</span>
                    <span className="font-mono">₹{protectPromiseFee}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bold subtotal (Items + Shipping + Fees) */}
            <div className="flex justify-between items-center border-t border-black pt-4 mt-2 text-xs uppercase font-black text-black">
              <span>Subtotal</span>
              <span className="font-mono">₹{orderSubtotal.toLocaleString('en-IN')}</span>
            </div>

            {/* Free delivery discount if order >= 1000 */}
            {itemsSubtotal >= 1000 && (
              <div className="flex justify-between items-center text-xs uppercase text-black font-black tracking-wider">
                <span>Free Delivery Discount</span>
                <span className="font-mono">-₹70</span>
              </div>
            )}

            {/* Coupon Applied Discount row */}
            {appliedCoupon && (
              <div className="flex justify-between items-center text-xs uppercase text-black font-black tracking-wider">
                <span>Coupon Applied ({appliedCoupon.code})</span>
                <span className="font-mono">-₹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}

            {/* Final Estimated Total */}
            <div className="flex justify-between items-center border-t-2 border-black pt-5 mt-3">
              <span className="text-xs uppercase font-black text-black tracking-widest">Estimated Total</span>
              <span className="text-base font-extrabold text-black font-mono">₹{estimatedTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Place Order Sticky Button */}
          <div className="fixed bottom-12 left-0 right-0 z-40 bg-white border-t border-black px-4 py-4 max-w-[430px] mx-auto">
            {paymentSectionVisible ? (
              <button
                type="submit"
                disabled={placingOrder}
                className="w-full flex items-center justify-center text-xs tracking-[0.25em] uppercase font-black py-4.5 bg-black text-white hover:bg-black active:bg-white active:text-black border border-black rounded-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {placingOrder 
                  ? 'Processing...' 
                  : `Pay ₹${estimatedTotal.toLocaleString('en-IN')} via ${selectedMethod === 'upi' ? 'UPI' : selectedMethod === 'card' ? 'Card' : 'Net Banking'}`
                }
              </button>
            ) : (
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="w-full flex items-center justify-center text-xs tracking-[0.25em] uppercase font-black py-4.5 bg-black text-white hover:bg-black active:bg-white active:text-black border border-black rounded-none transition-all"
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
