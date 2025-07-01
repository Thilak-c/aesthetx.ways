import { useState } from "react";
import Image from "next/image";

const products = [
  {
    img: "/products/batman.jpg",
    badge: "OVERSIZED FIT",
    name: "Batman Ottoman: Caped Crusader",
    category: "Oversized T-Shirts",
    price: 1199,
  },
  {
    img: "/products/ben10.jpg",
    badge: "OVERSIZED FIT",
    name: "Ben 10 Alien Force: Cosmic Defender",
    category: "Oversized T-Shirts",
    price: 1299,
  },
  {
    img: "/products/hooded-black.jpg",
    badge: "OVERSIZED FIT",
    name: "Hooded T-Shirt: Black",
    category: "Hooded T-Shirts",
    price: 1499,
  },
  {
    img: "/products/safari.jpg",
    badge: "APPLIQUE PATCH",
    name: "Utility Shirt: Safari",
    category: "Men Utility Shirts",
    price: 1699,
  },
  {
    img: "/products/ironman.jpg",
    badge: "PREMIUM",
    name: "Ironman Stark Tech",
    category: "Oversized T-Shirts",
    price: 1399,
  },
  {
    img: "/products/spiderman.jpg",
    badge: "LIMITED",
    name: "Spiderman Web Slinger",
    category: "Oversized T-Shirts",
    price: 1299,
  },
];

export default function NewArrivalsSlider() {
  const [start, setStart] = useState(0);
  const visible = 4;
  const [animDir, setAnimDir] = useState(null); // 'left' or 'right' or null

  const prev = () => {
    if (start === 0) return;
    setAnimDir('right');
    setTimeout(() => {
      setStart((s) => s - 1);
      setAnimDir(null);
    }, 300);
  };
  const next = () => {
    if (start + visible >= products.length) return;
    setAnimDir('left');
    setTimeout(() => {
      setStart((s) => s + 1);
      setAnimDir(null);
    }, 300);
  };

  return (
    <section className="w-full flex flex-col items-center py-10 bg-white">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8 tracking-wide text-gray-800">NEW ARRIVALS</h2>
      <div className="relative w-full max-w-7xl mx-auto flex items-center">
        {/* Left Arrow */}
        <button
          onClick={prev}
          disabled={start === 0}
          className="absolute left-0 z-10 hover:text-black text-2xl rounded-full p-2  transition disabled:opacity-30 disabled:pointer-events-none"
          style={{ top: "40%" }}
          aria-label="Previous"
        >
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        {/* Product Cards */}
        <div className="w-full flex overflow-hidden">
          <div
            className={`flex w-full transition-transform duration-300 ${
              animDir === 'left' ? '-translate-x-16' : animDir === 'right' ? 'translate-x-16' : ''
            }`}
          >
            {products.slice(start, start + visible).map((p, i) => (
              <div key={p.name} className="flex-1 min-w-0 max-w-xs mx-2 bg-white rounded-lg overflow-hidden  group flex flex-col">
                <div className="relative w-full aspect-[3/4] bg-gray-100">
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    className="object-cover  object-top group-hover:scale-105 transition"
                  />
                </div>
                <div className="p-3 flex flex-col gap-1">
                  <div className="font-semibold border-b border-gray-200 pb-2 text-gray-700 text-sm leading-tight">{p.name}</div>
                  <div className="text-xs font-light text-gray-500">{p.category}</div>
                  <div className="text-sm text-gray-700 font-bold">₹ {p.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Right Arrow */}
        <button
          onClick={next}
          disabled={start + visible >= products.length}
          className="absolute right-0 z-10  hover:text-black text-2xl rounded-full p-2  transition disabled:opacity-30 disabled:pointer-events-none"
          style={{ top: "40%" }}
          aria-label="Next"
        >
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </section>
  );
} 