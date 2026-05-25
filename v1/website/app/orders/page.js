'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, ClipboardList, CheckCircle2 } from 'lucide-react';

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

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load orders from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedOrders = JSON.parse(localStorage.getItem('aw_orders') || '[]');
      setOrders(storedOrders);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col bg-white justify-center items-center py-32">
        <span className="text-[10px] tracking-widest uppercase text-zinc-400 animate-pulse">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white relative pb-20">
      {/* Sleek Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push('/')} className="text-zinc-950 hover:text-black">
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
        <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-400">Order History</span>
        <div className="w-4 h-4"></div>
      </header>

      {/* Orders List */}
      <main className="flex-1 px-4 py-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList className="w-8 h-8 text-zinc-200 stroke-[1.5] mb-3" />
            <span className="text-[10px] tracking-widest uppercase text-zinc-400 font-bold">No orders found</span>
            <p className="text-[9px] text-zinc-400 mt-1 max-w-[200px]">You haven&apos;t placed any orders yet.</p>
            <Link 
              href="/" 
              className="mt-6 text-[9px] tracking-widest uppercase font-bold bg-black text-white px-5 py-2.5 rounded-[1px] hover:bg-zinc-900 transition-colors"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order, idx) => (
              <div 
                key={`${order.orderNumber}-${idx}`}
                className="border border-zinc-100 rounded-[2px] p-3 flex flex-col gap-2 bg-zinc-50"
              >
                {/* Order Header */}
                <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-black uppercase">{order.orderNumber}</span>
                    <span className="text-[8px] text-zinc-400">
                      {new Date(order.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className="text-[7.5px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded-[1px] bg-black text-white">
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-2 py-1">
                  {order.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex gap-2.5 items-center">
                      <div className="w-8 h-10 bg-white border border-zinc-200 rounded-[1px] overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9.5px] font-bold text-black uppercase block truncate">
                          {item.name}
                        </span>
                        <span className="text-[8px] text-zinc-400 block mt-0.5">
                          Size: {getDisplaySize(item.size, item.sizeDisplayType)} &bull; Qty: {item.quantity}
                        </span>
                      </div>
                      <span className="text-[9.5px] font-bold text-black">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex justify-between items-center border-t border-zinc-100 pt-2 mt-1 text-[10px]">
                  <span className="text-zinc-400 uppercase font-semibold">Total Price</span>
                  <span className="font-bold text-black">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Sticky Bottom Nav Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-100 max-w-[450px] mx-auto">
        <div className="flex items-center justify-around py-3">
          <Link href="/" className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-black">
            <span className="text-[9px] tracking-widest uppercase font-bold">Shop</span>
            <span className="w-1 h-1 bg-transparent rounded-full"></span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-black">
            <span className="text-[9px] tracking-widest uppercase font-bold">Bag</span>
            <span className="w-1 h-1 bg-transparent rounded-full"></span>
          </Link>
          <Link href="/orders" className="flex flex-col items-center gap-0.5 text-black">
            <span className="text-[9px] tracking-widest uppercase font-bold">Orders</span>
            <span className="w-1 h-1 bg-black rounded-full"></span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
