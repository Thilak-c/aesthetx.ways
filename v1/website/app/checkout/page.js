'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { getCachedImage } from '@/lib/mediaCache';
import Confetti from '@/components/Confetti';
import FallbackImage from '@/components/FallbackImage';

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

  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [codError, setCodError] = useState(false);
  const [codErrorMsg, setCodErrorMsg] = useState('');
  const [showCodOption, setShowCodOption] = useState(true);

  // Load cart, verify session, and fetch user profile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cart = JSON.parse(localStorage.getItem('aw_cart') || '[]');
      if (cart.length === 0) {
        router.push('/cart');
        return;
      }
      setCartItems(cart);

      // Check if user is logged in
      const userStr = localStorage.getItem('aw_user');
      if (!userStr) {
        router.push('/cart');
        return;
      }

      try {
        const userObj = JSON.parse(userStr);
        if (!userObj || !userObj.loggedIn || !userObj.email) {
          router.push('/cart');
          return;
        }

        // Fetch user profile to populate previously saved address fields
        fetch(`/api/auth/profile?email=${encodeURIComponent(userObj.email)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.user) {
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
            setLoading(false);
          })
          .catch((err) => {
            console.error('Failed to fetch user profile:', err);
            setForm((prev) => ({
              ...prev,
              email: userObj.email,
              fullName: userObj.name || '',
            }));
            setLoading(false);
          });

      } catch (err) {
        console.error('Failed to parse user session:', err);
        router.push('/cart');
        return;
      }

      // Load coupon
      const savedCoupon = localStorage.getItem('aw_coupon');
      if (savedCoupon) {
        try {
          setAppliedCoupon(JSON.parse(savedCoupon));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [router]);

  // Auto-fetch city, state, area on valid pincode entry
  useEffect(() => {
    const fetchPincodeDetails = async () => {
      const pin = (form.pincode || '').trim();
      if (/^\d{6}$/.test(pin)) {
        setPincodeLoading(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === 'Success') {
            const postOffices = data[0].PostOffice;
            if (postOffices && postOffices.length > 0) {
              const info = postOffices[0];
              const updatedFields = {
                city: info.District || '',
                state: info.State || '',
                area: info.Name || '',
              };
              
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
            }
          }
        } catch (err) {
          console.error('Failed to fetch pincode details:', err);
        } finally {
          setPincodeLoading(false);
        }
      }
    };

    fetchPincodeDetails();
  }, [form.pincode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (method) => {
    if (method === 'COD') {
      setCodError(true);
      setCodErrorMsg(`Sorry ${form.fullName || 'User'} you not Eligible for COD orders`);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 50, 80]);
      }
      setTimeout(() => {
        setCodError(false);
      }, 800);
      setShowCodOption(false);
      setPaymentMethod('CARD');
      return;
    }
    setCodErrorMsg(''); // Clear error if they select CARD
    setPaymentMethod(method);
  };

  // Real-time autosave to database
  const handleAutoSave = async (field, value) => {
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
        console.log(`Auto-saved ${field}:`, value);
        // Sync local storage if name changed
        if (field === 'fullName') {
          userObj.name = value;
          localStorage.setItem('aw_user', JSON.stringify(userObj));
        }
      }
    } catch (err) {
      console.error('Autosave error:', err);
    }
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

  const handlePlaceOrder = async (e) => {
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

              // Clear Cart & Coupon
              localStorage.removeItem('aw_cart');
              localStorage.removeItem('aw_coupon');
              window.dispatchEvent(new Event('cart-updated'));

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
        <span className="text-[10px] tracking-widest uppercase text-zinc-400 animate-pulse">Loading checkout...</span>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="flex flex-col flex-1 bg-white justify-center items-center py-20 px-6 text-center animate-scale-in relative overflow-hidden min-h-[400px]">
        <Confetti />
        <CheckCircle2 className="w-12 h-12 text-green-600 stroke-[1.5] mb-4" />
        <h1 className="text-sm font-bold tracking-widest uppercase text-black">Your order has been confirmed</h1>
        <span className="text-[10px] tracking-wider font-bold text-zinc-400 block mt-1">ORDER ID: {generatedOrderNum}</span>
        <p className="text-[10px] text-zinc-500 mt-3 max-w-[280px] leading-relaxed">
          Thank you for shopping with AesthetX Ways. Now we are redirecting you to our page...
        </p>
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
        <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-400">Checkout</span>
        <div className="w-4 h-4"></div>
      </header>

      <main className="flex-1 px-4 py-4 overflow-y-auto">
        {/* 1. Cart Items listed first */}
        <section className="mb-6">
          <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-bold block mb-2">Order Items</span>
          <div className="border border-zinc-100 rounded-[2px] p-3 flex flex-col gap-3">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-center py-1.5 last:border-b-0 border-b border-zinc-50">
                {/* Product Image */}
                <div className="w-10 h-13 bg-zinc-50 border border-zinc-100 rounded-[1px] overflow-hidden shrink-0 relative">
                  <FallbackImage 
                    src={getCachedImage(item.productId, item.image)} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                    hideText={true}
                    logoSize="w-4 h-4"
                  />
                  <div className="absolute top-1 left-1 z-10 pointer-events-none opacity-20">
                    <img src="/logo_t.svg" alt="Watermark Logo" className="w-2.5 h-2.5 object-contain" />
                  </div>
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[9.5px] font-bold text-black uppercase block truncate">
                    {item.name}
                  </span>
                  <span className="text-[8px] text-zinc-400 block mt-0.5 uppercase tracking-wide">
                    Size: {getDisplaySize(item.size, item.sizeDisplayType)} &bull; Qty: {item.quantity}
                  </span>
                </div>

                {/* Total Item Price */}
                <span className="text-[9.5px] font-bold text-black font-mono shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Shipping details form */}
        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-3" autoComplete="off">
          <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-bold block mb-1">Shipping Details</span>
          
          {/* Group 1: Name, Phone, Email */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <label className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={form.fullName}
                  onChange={handleChange}
                  onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                  placeholder="e.g. John Doe"
                  className="border border-zinc-200 text-xs px-2.5 py-2 outline-none focus:border-black rounded-[1px] text-black"
                  autoComplete="nope"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength={10}
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                  placeholder="10-digit mobile"
                  className="border border-zinc-200 text-xs px-2.5 py-2 outline-none focus:border-black rounded-[1px] text-black"
                  autoComplete="nope"
                />
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                placeholder="name@example.com"
                className="border border-zinc-200 text-xs px-2.5 py-2 outline-none focus:border-black rounded-[1px] text-black"
                autoComplete="nope"
              />
            </div>
          </div>

          {/* Group 2: Full Address */}
          <div className="flex flex-col gap-0.5 mt-2">
            <label className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold">Full Address (Road, Street)</label>
            <input
              type="text"
              name="address"
              required
              value={form.address}
              onChange={handleChange}
              onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
              placeholder="Flat/House No, Building, Street Address"
              className="border border-zinc-200 text-xs px-2.5 py-2 outline-none focus:border-black rounded-[1px] text-black"
              autoComplete="nope"
            />
          </div>

          {/* Group 3: House No & Area */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold">House No. / Flat</label>
              <input
                type="text"
                name="houseNo"
                required
                value={form.houseNo}
                onChange={handleChange}
                onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                placeholder="e.g. Flat 402"
                className="border border-zinc-200 text-xs px-2.5 py-2 outline-none focus:border-black rounded-[1px] text-black"
                autoComplete="nope"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold">Area / Colony Name</label>
              <input
                type="text"
                name="area"
                required
                value={form.area}
                onChange={handleChange}
                onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                placeholder="e.g. Sector 5, Colony"
                className="border border-zinc-200 text-xs px-2.5 py-2 outline-none focus:border-black rounded-[1px] text-black"
                autoComplete="nope"
              />
            </div>
          </div>

          {/* Group 4: City, State, PIN Code */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="flex flex-col gap-0.5 col-span-1">
              <label className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold">City</label>
              <input
                type="text"
                name="city"
                required
                value={form.city}
                onChange={handleChange}
                onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                placeholder="e.g. Mumbai"
                className="border border-zinc-200 text-xs px-2.5 py-2 outline-none focus:border-black rounded-[1px] text-black"
                autoComplete="nope"
              />
            </div>
            <div className="flex flex-col gap-0.5 col-span-1">
              <label className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold">State</label>
              <input
                type="text"
                name="state"
                required
                value={form.state}
                onChange={handleChange}
                onBlur={(e) => handleAutoSave(e.target.name, e.target.value)}
                placeholder="e.g. MH"
                className="border border-zinc-200 text-xs px-2.5 py-2 outline-none focus:border-black rounded-[1px] text-black"
                autoComplete="nope"
              />
            </div>
            <div className="flex flex-col gap-0.5 col-span-1">
              <div className="flex items-center justify-between">
                <label className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold">PIN Code</label>
                {pincodeLoading && (
                  <span className="text-[7px] text-zinc-400 font-bold animate-pulse uppercase">[checking...]</span>
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
                className="border border-zinc-200 text-xs px-2.5 py-2 outline-none focus:border-black rounded-[1px] text-black"
                autoComplete="nope"
              />
            </div>
          </div>

          {/* 3. Bill Summary (same as cart page) */}
          <div className="mt-6 border-t border-zinc-100 pt-5 flex flex-col gap-3">
            <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-bold block mb-1">Bill Summary</span>

            {/* Item subtotal */}
            <div className="flex justify-between items-center text-[9px] uppercase text-zinc-400">
              <span>Items Subtotal</span>
              <span className="font-mono text-zinc-500">₹{itemsSubtotal.toLocaleString('en-IN')}</span>
            </div>

            {/* Shipping */}
            <div className="flex justify-between items-center text-[9px] uppercase text-zinc-400">
              <span>Shipping</span>
              <span className="font-mono text-zinc-500">₹{shippingCost} fixed</span>
            </div>

            {/* Fees with Toggable Dropdown */}
            <div className="flex flex-col gap-1">
              <div 
                onClick={() => setShowFeeDetails(!showFeeDetails)}
                className="flex justify-between items-center text-[9px] uppercase text-zinc-400 cursor-pointer hover:text-black transition-colors"
              >
                <span className="flex items-center gap-1 select-none">
                  Fees 
                  <ChevronRight className={`w-2.5 h-2.5 text-zinc-500 transition-transform duration-300 ${showFeeDetails ? 'rotate-90' : 'rotate-0'}`} />
                </span>
                <span className="font-mono text-zinc-500">₹{protectPromiseFee}</span>
              </div>
              
              <div className={`grid transition-all duration-300 ease-in-out ${showFeeDetails ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                <div className="overflow-hidden">
                  <div className="pl-3 py-1.5 border-l border-zinc-100 bg-zinc-50/50 rounded-[1px] flex justify-between items-center text-[8px] text-zinc-400 tracking-wider">
                    <span>Protect Promise Fee (₹9 per item × {totalItems})</span>
                    <span className="font-mono">₹{protectPromiseFee}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bold subtotal (Items + Shipping + Fees) */}
            <div className="flex justify-between items-center border-t border-zinc-100 pt-3 mt-1 text-[10px] uppercase font-bold text-black">
              <span>Subtotal</span>
              <span className="font-mono">₹{orderSubtotal.toLocaleString('en-IN')}</span>
            </div>

            {/* Free delivery discount if order >= 1000 */}
            {itemsSubtotal >= 1000 && (
              <div className="flex justify-between items-center text-[9px] uppercase text-green-600 font-semibold tracking-wider">
                <span>Free Delivery Discount</span>
                <span className="font-mono">-₹70</span>
              </div>
            )}

            {/* Coupon Applied Discount row */}
            {appliedCoupon && (
              <div className="flex justify-between items-center text-[9px] uppercase text-green-600 font-semibold tracking-wider">
                <span>Coupon Applied ({appliedCoupon.code})</span>
                <span className="font-mono">-₹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}

            {/* Final Estimated Total */}
            <div className="flex justify-between items-center border-t border-zinc-200 pt-4 mt-2">
              <span className="text-[11px] uppercase font-black text-black tracking-widest">Estimated Total</span>
              <span className="text-sm font-black text-black font-mono">₹{estimatedTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* COD Error Message block */}
          {codErrorMsg && (
            <div className="mt-4 rounded-[2px] p-3 text-red-600 flex flex-col gap-2 transition-all duration-300 animate-fade-in">
              <span className="text-[9.5px] font-bold uppercase tracking-wider leading-relaxed">
                {codErrorMsg}
              </span>
              <p className="text-[9px] text-zinc-500 leading-relaxed font-semibold">
                But you can use online card banking, UPI and mobile wallets. We accept Mastercard, Visa, and all major UPI payments.
              </p>
              
              {/* Brand Logos & Pay Online Action */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-2 select-none bg-white/50 p-2  rounded-[1px]">
                <div className="flex flex-wrap items-center gap-3">
                  <img src="/payment-icon/visa.png" alt="Visa" className="h-4 w-auto object-contain shrink-0" />
                  <img src="/payment-icon/card.png" alt="Mastercard" className="h-4 w-auto object-contain shrink-0" />
                  <img src="/payment-icon/phonepe.png" alt="PhonePe" className="h-4 w-auto object-contain shrink-0" />
                  <img src="/payment-icon/google-pay.png" alt="Google Pay" className="h-4 w-auto object-contain shrink-0" />
                  <img src="/payment-icon/paytm.png" alt="Paytm" className="h-4 w-auto object-contain shrink-0" />
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    handlePaymentMethodChange('CARD');
                    // Trigger place order flow
                    handlePlaceOrder();
                  }}
                  className="bg-black text-white hover:bg-zinc-900 text-[8px] tracking-widest uppercase font-bold px-3 py-1.5 rounded-[1px] transition-colors shrink-0"
                >
                  Pay Online
                </button>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className={`mt-4 border-t border-zinc-100 pt-3 transition-all duration-300 ${codError ? 'animate-shake' : ''}`}>
            <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-bold block mb-2">Payment Option</span>
            <div className="flex flex-col gap-2">
              {showCodOption && (
                <label 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePaymentMethodChange('COD');
                  }}
                  className={`flex items-center justify-between p-3 border rounded-[1px] cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-black bg-zinc-50' : 'border-zinc-200'}`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => {}}
                      className="accent-black"
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-black">Cash on Delivery (COD)</span>
                    </div>
                  </div>
                </label>
              )}

              <label 
                onClick={(e) => {
                  e.preventDefault();
                  handlePaymentMethodChange('CARD');
                }}
                className={`flex items-center justify-between p-3 border rounded-[1px] cursor-pointer transition-colors ${paymentMethod === 'CARD' ? 'border-black bg-zinc-50' : 'border-zinc-200'}`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => {}}
                    className="accent-black"
                  />
                  <span className="text-[10px] font-bold uppercase text-black">Card / UPI</span>
                </div>
                <span className="text-[9px] text-zinc-400">Instant validation</span>
              </label>
            </div>

            {/* <button
              type="button"
              onClick={() => {
                setGeneratedOrderNum('ORD-TEST-12345');
                setOrderSuccess(true);
                setTimeout(() => {
                  router.push('/orders');
                }, 4000);
              }}
              className="w-full text-center text-[8px] tracking-widest uppercase font-bold py-2 border border-dashed border-zinc-300 text-zinc-500 hover:text-black hover:border-black rounded-[1px] transition-colors mt-3 mb-8"
            >
              [Dev] Test Confetti & Success Screen
            </button> */}
          </div>

          {/* Place Order Sticky Button */}
          <div className="fixed bottom-12 left-0 right-0 z-40 bg-white border-t border-zinc-100 px-4 py-3 max-w-[430px] mx-auto shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
            <button
              type="submit"
              disabled={placingOrder}
              className="w-full flex items-center justify-center text-[9px] tracking-[0.2em] uppercase font-bold py-3.5 bg-black text-white hover:bg-zinc-900 rounded-[1px] disabled:bg-zinc-400 transition-colors"
            >
              {placingOrder 
                ? 'Processing...' 
                : `Pay ₹${estimatedTotal.toLocaleString('en-IN')} & Place Order`
              }
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
