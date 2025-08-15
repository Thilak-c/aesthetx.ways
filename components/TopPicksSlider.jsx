"use client"
import Image from "next/image";
import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
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

  const [start, setStart] = useState(0);
  const [visible, setVisible] = useState(4);
    const [currentPage, setCurrentPage] = useState(0);
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      const handleScroll = () => {
        const cardWidth = el.scrollWidth / products.length;
        const page = Math.round(el.scrollLeft / (cardWidth * visible));
        setCurrentPage(page);
      };
      el.addEventListener('scroll', handleScroll);
      // Set initial page
      handleScroll();
      return () => el.removeEventListener('scroll', handleScroll);
    }, [visible]);
  
    const scrollToPage = (idx) => {
      const el = scrollRef.current;
      if (!el) return;
      const cardWidth = el.scrollWidth / products.length;
      el.scrollTo({ left: idx * cardWidth * visible, behavior: 'smooth' });
      setStart(idx * visible);
    };
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
       
        {/* Product Cards - horizontally scrollable */}
        <div ref={scrollRef} className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex flex-nowrap gap-8 px-2">
            {products.map((p, i) => (
               
            
                <ProductCard
                key={p.name}
                img={p.img}
                name={p.name}
                category={p.category}
                price={p.price}
              />
               
        
            ))}
          </div>
        </div>
        {/* Right Arrow - hide on mobile */}
       
        
      </div>
      <div className="flex justify-center gap-2 m4">
        {Array.from({ length: Math.ceil(products.length / visible) }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToPage(idx)}
            className={`w-1 h-1 rounded-full transition-colors duration-200 ${currentPage === idx ? 'bg-gray-800' : 'bg-gray-300'}`}
            aria-label={`Go to slide ${idx + 1}`}
            disabled={currentPage === idx}
          />
        ))}
      </div>
    </section>
  );
} 