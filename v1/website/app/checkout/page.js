'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

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

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [generatedOrderNum, setGeneratedOrderNum] = useState('');

  // Form Fields
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Load cart from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cart = JSON.parse(localStorage.getItem('aw_cart') || '[]');
      if (cart.length === 0) {
        router.push('/cart');
        return;
      }
      setCartItems(cart);
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      setSubtotal(total);
      setLoading(false);
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.fullName || !form.phone || !form.email || !form.address || !form.city || !form.state || !form.pincode) {
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

      const orderData = {
        items: cartItems,
        customerDetails: form,
        paymentMethod,
        orderTotal: subtotal,
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
          total: subtotal,
          status: 'pending',
          customerDetails: form,
        });
        localStorage.setItem('aw_orders', JSON.stringify(existingOrders));

        // Clear Cart
        localStorage.removeItem('aw_cart');
        window.dispatchEvent(new Event('cart-updated'));

        setOrderSuccess(true);
      } else {
        alert(data.message || 'Failed to place order. Try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while placing your order.');
    } finally {
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
      <div className="flex flex-col flex-1 bg-white justify-center items-center py-20 px-6 text-center animate-fade-in">
        <CheckCircle2 className="w-12 h-12 text-black stroke-[1.5] mb-4" />
        <h1 className="text-sm font-bold tracking-widest uppercase text-black">Order Placed</h1>
        <span className="text-[10px] tracking-wider font-bold text-zinc-400 block mt-1">ORDER ID: {generatedOrderNum}</span>
        <p className="text-[10px] text-zinc-500 mt-3 max-w-[240px] leading-relaxed">
          Thank you for shopping with Aesthetx Ways. Your package will ship shortly.
        </p>

        <div className="flex flex-col gap-2 mt-8 w-full max-w-[200px]">
          <Link
            href="/orders"
            className="text-[9px] tracking-widest uppercase font-bold py-2.5 bg-black text-white hover:bg-zinc-900 rounded-[1px] transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/"
            className="text-[9px] tracking-widest uppercase font-bold py-2.5 border border-zinc-200 text-black hover:border-black rounded-[1px] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
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
        {/* Cart summary */}
        <section className="mb-6">
          <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-bold block mb-2">Order summary</span>
          <div className="border border-zinc-100 rounded-[2px] p-3 flex flex-col gap-2">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-[10px] text-zinc-800">
                <span className="truncate max-w-[240px]">
                  {item.name} <span className="text-zinc-400 font-semibold">({getDisplaySize(item.size, item.sizeDisplayType)}) (x{item.quantity})</span>
                </span>
                <span className="font-semibold text-black">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="border-t border-zinc-100 pt-2 mt-1 flex justify-between items-center text-xs font-bold text-black">
              <span>Total amount</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </section>

        {/* Shipping Form */}
        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-3">
          <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-bold block mb-1">Shipping Details</span>
          
          <div className="flex flex-col gap-0.5">
            <label className="text-[8px] uppercase tracking-wider text-zinc-400">Full Name</label>
            <input
              type="text"
              name="fullName"
              required
              value={form.fullName}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="border border-zinc-200 text-xs px-2.5 py-2 outline-none focus:border-black rounded-[1px] text-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase tracking-wider text-zinc-400">Phone</label>
              <input
                type="tel"
                name="phone"
                required
                maxLength={10}
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile"
                className="border border-zinc-200 text-xs px-2.5 py-2 outline-none focus:border-black rounded-[1px] text-black"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase tracking-wider text-zinc-400">Email</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="border border-zinc-200 text-xs px-2.5 py-2 outline-none focus:border-black rounded-[1px] text-black"
              />
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <label className="text-[8px] uppercase tracking-wider text-zinc-400">Shipping Address</label>
            <input
              type="text"
              name="address"
              required
              value={form.address}
              onChange={handleChange}
              placeholder="Flat/House No, Building, Street Address"
              className="border border-zinc-200 text-xs px-2.5 py-2 outline-none focus:border-black rounded-[1px] text-black"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-0.5 col-span-1">
              <label className="text-[8px] uppercase tracking-wider text-zinc-400">City</label>
              <input
                type="text"
                name="city"
                required
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Mumbai"
                className="border border-zinc-200 text-xs px-2.5 py-2 outline-none focus:border-black rounded-[1px] text-black"
              />
            </div>
            <div className="flex flex-col gap-0.5 col-span-1">
              <label className="text-[8px] uppercase tracking-wider text-zinc-400">State</label>
              <input
                type="text"
                name="state"
                required
                value={form.state}
                onChange={handleChange}
                placeholder="e.g. MH"
                className="border border-zinc-200 text-xs px-2.5 py-2 outline-none focus:border-black rounded-[1px] text-black"
              />
            </div>
            <div className="flex flex-col gap-0.5 col-span-1">
              <label className="text-[8px] uppercase tracking-wider text-zinc-400">PIN Code</label>
              <input
                type="text"
                name="pincode"
                required
                maxLength={6}
                value={form.pincode}
                onChange={handleChange}
                placeholder="6-digit"
                className="border border-zinc-200 text-xs px-2.5 py-2 outline-none focus:border-black rounded-[1px] text-black"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-4 border-t border-zinc-100 pt-3">
            <span className="text-[8px] tracking-wider uppercase text-zinc-400 font-bold block mb-2">Payment Option</span>
            <div className="flex flex-col gap-2">
              <label className={`flex items-center justify-between p-3 border rounded-[1px] cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-black bg-zinc-50' : 'border-zinc-200'}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-black"
                  />
                  <span className="text-[10px] font-bold uppercase text-black">Cash on Delivery (COD)</span>
                </div>
                <span className="text-[9px] text-zinc-400">Pay on arrival</span>
              </label>

              <label className={`flex items-center justify-between p-3 border rounded-[1px] cursor-pointer transition-colors ${paymentMethod === 'CARD' ? 'border-black bg-zinc-50' : 'border-zinc-200'}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="accent-black"
                  />
                  <span className="text-[10px] font-bold uppercase text-black">Simulated Card / UPI</span>
                </div>
                <span className="text-[9px] text-zinc-400">Instant validation</span>
              </label>
            </div>
          </div>

          {/* Place Order Sticky Button */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-100 px-4 py-3 max-w-[450px] mx-auto shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
            <button
              type="submit"
              disabled={placingOrder}
              className="w-full flex items-center justify-center text-[9px] tracking-[0.2em] uppercase font-bold py-3.5 bg-black text-white hover:bg-zinc-900 rounded-[1px] disabled:bg-zinc-400 transition-colors"
            >
              {placingOrder ? 'Processing...' : `Place Order (₹${subtotal.toLocaleString('en-IN')})`}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
