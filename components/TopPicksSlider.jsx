import Image from "next/image";
import { useRef } from "react";
import ProductCard from "./ProductCard";
const products = [
  {
    img: "/products/kurukshetra.jpg",
    name: "TSS Originals: Kurukshetra",
    category: "Oversized T-Shirts",
    price: 1799,
  },
  {
    img: "/products/nautical.jpg",
    name: "Cotton Linen Stripes: Nautical",
    category: "Shirts",
    price: 1499,
  },
  {
    img: "/products/steel-shorts.jpg",
    name: "Colourblock: Steel",
    category: "Shorts",
    price: 999,
  },
  {
    img: "/products/ironman-polo.jpg",
    name: "Iron Man: Stark Industries",
    category: "Polos",
    price: 1299,
  },
  {
    img: "/products/ben10.jpg",
    name: "Ben 10: Alien Force",
    category: "Oversized T-Shirts",
    price: 1399,
  },
  {
    img: "/products/safari.jpg",
    name: "Utility Shirt: Safari",
    category: "Men Utility Shirts",
    price: 1699,
  },
  {
    img: "/products/hooded-black.jpg",
    name: "Hooded T-Shirt: Black",
    category: "Hooded T-Shirts",
    price: 1499,
  },
  {
    img: "/products/spiderman.jpg",
    name: "Spiderman Web Slinger",
    category: "Oversized T-Shirts",
    price: 1299,
  },
  {
    img: "/products/batman.jpg",
    name: "Batman Ottoman: Caped Crusader",
    category: "Oversized T-Shirts",
    price: 1199,
  },
  {
    img: "/products/ironman.jpg",
    name: "Ironman Stark Tech",
    category: "Oversized T-Shirts",
    price: 1399,
  },
];

export default function TopPicksSlider() {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector(".top-pick-card");
    if (!card) return;
    const scrollAmount = card.offsetWidth * 2; // scroll by 2 cards
    el.scrollBy({ left: dir === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  return (
    <section className="w-full flex flex-col items-center py-12 bg-white">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10 tracking-tight text-gray-900">
        TOP 10 PICKS OF THE WEEK
      </h2>
      <div className="relative w-full max-w-7xl mx-auto flex items-center">
        {/* Left Arrow - hide on mobile */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 z-10 hover:text-black text-3xl rounded-full p-2 transition disabled:opacity-30 disabled:pointer-events-none hidden md:block"
          style={{ top: "40%" }}
          aria-label="Previous"
        >
          <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        {/* Product Cards - horizontally scrollable */}
        <div ref={scrollRef} className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex flex-nowrap gap-8 px-2">
            {products.map((p, i) => (
                <>
            
                <ProductCard
                key={p.name}
                img={p.img}
                name={p.name}
                category={p.category}
                price={p.price}
              />
                </>
        
            ))}
          </div>
        </div>
        {/* Right Arrow - hide on mobile */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 z-10 hover:text-black text-3xl rounded-full p-2 transition disabled:opacity-30 disabled:pointer-events-none hidden md:block"
          style={{ top: "40%" }}
          aria-label="Next"
        >
          <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </section>
  );
} 