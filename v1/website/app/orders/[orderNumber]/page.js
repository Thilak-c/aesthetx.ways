'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock, Truck, ShieldCheck, CreditCard } from 'lucide-react';
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

export default function OrderDetailsPage({ params }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const orderNumber = unwrappedParams.orderNumber;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedOrders = JSON.parse(localStorage.getItem('aw_orders') || '[]');
      const foundOrder = storedOrders.find(o => o.orderNumber === orderNumber);
      if (foundOrder) {
        setOrder(foundOrder);
      }
      setLoading(false);
    }
  }, [orderNumber]);

  // Set dynamic browser tab title
  useEffect(() => {
    if (typeof window !== 'undefined' && orderNumber) {
      document.title = `Order Details #${orderNumber} | Aesthetx Ways`;
    }
  }, [orderNumber]);

  const getEstimatedDeliveryDate = (orderDateStr) => {
    if (!orderDateStr) return '';
    const d = new Date(orderDateStr);
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col bg-white justify-center items-center py-32 min-h-[90vh]">
        <span className="text-[10px] tracking-widest uppercase text-zinc-400 animate-pulse">Loading order details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col flex-1 bg-white justify-center items-center py-32 min-h-[90vh] px-4 text-center">
        <span className="text-[10px] tracking-widest uppercase text-red-500 font-bold">Order Not Found</span>
        <p className="text-[9px] text-zinc-400 mt-2 max-w-[240px]">
          We couldn't locate order #{orderNumber}. It may have been cleared or placed on a different browser.
        </p>
        <button
          onClick={() => router.push('/orders')}
          className="mt-6 text-[9px] tracking-widest uppercase font-bold bg-black text-white px-5 py-2.5 rounded-[1px] hover:bg-zinc-900 transition-colors"
        >
          View All Orders
        </button>
      </div>
    );
  }

  // Calculate items subtotal
  const itemsSubtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="flex flex-col flex-1 bg-white relative pb-20 min-h-[90vh] animate-slide-up-fade">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push('/orders')} className="text-zinc-950 hover:text-black flex items-center gap-1">
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span className="text-[8px] uppercase tracking-wider font-bold">Back</span>
        </button>
        <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-400">Order Details</span>
        <div className="w-8" />
      </header>

      <main className="flex-1 px-4 py-5 flex flex-col gap-5 max-w-[430px] mx-auto w-full">
        {/* Order Header Summary Card */}
        <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-[2px] flex flex-col gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-center">
            <span className="text-[8px] text-zinc-400 uppercase tracking-wider font-bold">Order Number</span>
            <span className="text-[7.5px] tracking-wider uppercase font-black px-2 py-0.5 rounded-[1px] bg-black text-white">
              {order.status}
            </span>
          </div>
          <h2 className="text-xs font-bold text-black uppercase tracking-wider mt-0.5 font-mono">{order.orderNumber}</h2>
          
          <div className="flex justify-between items-center mt-3 border-t border-zinc-100 pt-2.5 text-[8.5px] text-zinc-400 uppercase font-medium">
            <span>Placed On</span>
            <span className="text-black font-bold">
              {new Date(order.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between items-center text-[8.5px] text-zinc-400 uppercase font-medium">
            <span>Estimated Delivery</span>
            <span className="text-black font-bold">
              {getEstimatedDeliveryDate(order.date)}
            </span>
          </div>
        </div>

        {/* Live Delivery Status Stepper */}
        <div className="flex flex-col gap-2">
          <span className="text-[8.5px] tracking-wider uppercase text-zinc-400 font-bold block mb-1">Where it is coming / Delivery Status</span>
          <div className="border border-zinc-100 rounded-[2px] p-4 bg-zinc-50/50 flex flex-col gap-4">
            
            {/* Step 1: Placed */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white shrink-0">
                  <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                </div>
                <div className="w-0.5 h-8 bg-black"></div>
              </div>
              <div className="flex flex-col pt-0.5">
                <span className="text-[9px] uppercase font-bold text-black">Order Placed</span>
                <span className="text-[8px] text-zinc-400 uppercase mt-0.5">
                  {new Date(order.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Step 2: Confirmed */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white shrink-0">
                  <Clock className="w-3 h-3 stroke-[2.5]" />
                </div>
                <div className="w-0.5 h-8 bg-zinc-200"></div>
              </div>
              <div className="flex flex-col pt-0.5">
                <span className="text-[9px] uppercase font-bold text-black">Order Confirmed & Processing</span>
                <span className="text-[8px] text-zinc-400 uppercase mt-0.5">Pending seller review</span>
              </div>
            </div>

            {/* Step 3: Shipped */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                  <Truck className="w-3 h-3" />
                </div>
                <div className="w-0.5 h-8 bg-zinc-200"></div>
              </div>
              <div className="flex flex-col pt-0.5">
                <span className="text-[9px] uppercase font-bold text-zinc-400">Shipped</span>
                <span className="text-[8px] text-zinc-400 uppercase mt-0.5">Awaiting logistics partner dispatch</span>
              </div>
            </div>

            {/* Step 4: Delivered */}
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                <ShieldCheck className="w-3 h-3" />
              </div>
              <div className="flex flex-col pt-0.5">
                <span className="text-[9px] uppercase font-bold text-zinc-400">Delivered</span>
                <span className="text-[8px] text-zinc-400 uppercase mt-0.5">Estimated by {getEstimatedDeliveryDate(order.date)}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Items List */}
        <div className="flex flex-col gap-2">
          <span className="text-[8.5px] tracking-wider uppercase text-zinc-400 font-bold block mb-1">What you ordered</span>
          <div className="border border-zinc-100 rounded-[2px] p-3 flex flex-col gap-3 bg-zinc-50/50">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-center py-1.5 last:border-b-0 border-b border-zinc-100">
                <div className="w-10 h-13 bg-zinc-50 border border-zinc-100 rounded-[1px] overflow-hidden shrink-0 relative">
                  <FallbackImage 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                    hideText={true}
                    logoSize="w-4 h-4"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9.5px] font-bold text-black uppercase block truncate">
                    {item.name}
                  </span>
                  <span className="text-[8px] text-zinc-400 block mt-0.5 uppercase tracking-wide font-medium">
                    Size: {getDisplaySize(item.size, item.sizeDisplayType)} &bull; Qty: {item.quantity}
                  </span>
                </div>
                <span className="text-[9.5px] font-bold text-black font-mono shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping / Delivery address */}
        <div className="flex flex-col gap-2">
          <span className="text-[8.5px] tracking-wider uppercase text-zinc-400 font-bold block mb-1">Delivery details</span>
          <div className="border border-zinc-100 rounded-[2px] p-3 flex flex-col gap-2.5 text-[9px] bg-zinc-50/50">
            <div className="flex justify-between items-center border-b border-zinc-100/50 pb-2">
              <span className="text-zinc-400 uppercase">Customer Name</span>
              <span className="font-semibold text-black uppercase">{order.customerDetails?.fullName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-100/50 pb-2">
              <span className="text-zinc-400 uppercase">Phone Number</span>
              <span className="font-semibold text-black">{order.customerDetails?.phone}</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-100/50 pb-2">
              <span className="text-zinc-400 uppercase">Email</span>
              <span className="font-semibold text-black lowercase">{order.customerDetails?.email}</span>
            </div>
            <div className="flex flex-col gap-1 pt-1">
              <span className="text-zinc-400 uppercase">Delivery Address</span>
              <p className="text-black font-semibold leading-relaxed uppercase mt-0.5 text-[8.5px]">
                {order.customerDetails?.houseNo && `${order.customerDetails.houseNo}, `}
                {order.customerDetails?.area && `${order.customerDetails.area}, `}
                {order.customerDetails?.address && `${order.customerDetails.address}, `}
                {order.customerDetails?.city && `${order.customerDetails.city}, `}
                {order.customerDetails?.state && `${order.customerDetails.state} - `}
                {order.customerDetails?.pincode}
              </p>
            </div>
          </div>
        </div>

        {/* Billing summary */}
        <div className="flex flex-col gap-2">
          <span className="text-[8.5px] tracking-wider uppercase text-zinc-400 font-bold block mb-1">Payment Summary</span>
          <div className="border border-zinc-100 rounded-[2px] p-3 flex flex-col gap-2.5 text-[9px] bg-zinc-50/50">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="uppercase">Items Subtotal</span>
              <span className="font-semibold text-black font-mono">₹{itemsSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span className="uppercase">Shipping Fee</span>
              <span className="font-semibold text-emerald-600 uppercase">Free</span>
            </div>
            <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-100 pb-2.5">
              <span className="uppercase">Payment Option</span>
              <div className="flex items-center gap-1 font-semibold text-black uppercase">
                <CreditCard className="w-3.5 h-3.5 stroke-[2] text-zinc-500" />
                <span>Card / UPI (Prepaid)</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-1.5 font-bold text-[10px]">
              <span className="text-black uppercase">What you paid</span>
              <span className="font-bold text-black font-mono">₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <SuggestionBar />
        <Footer />
      </main>
    </div>
  );
}
