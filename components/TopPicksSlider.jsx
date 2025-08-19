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
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updatePages = () => {
      setPageCount(Math.ceil(el.scrollWidth / el.clientWidth));
    };

    const handleScroll = () => {
      const page = Math.round(el.scrollLeft / el.clientWidth);
      setCurrentPage(page);
    };

    updatePages();
    handleScroll();

    window.addEventListener("resize", updatePages);
    el.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", updatePages);
      el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToPage = (idx) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  };
  return (
    <section className="w-full flex flex-col items-center py-12 bg-white">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide text-gray-800">
         
        TOP 10 PICKS OF THE WEEK
        </h2>
        <span className="block w-28 sm:w-36 h-[2px] mx-auto mt-1 opacity-50 rounded-full bg-gradient-to-r from-white via-black to-white"></span>
      </div>
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
        {Array.from({ length: Math.ceil(scrollRef.current?.scrollWidth / scrollRef.current?.clientWidth || 0) })
.map((_, idx) => (
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