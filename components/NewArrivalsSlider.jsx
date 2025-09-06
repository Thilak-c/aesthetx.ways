"use client";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ProductCard from "./ProductCard";

export default function NewArrivalsSlider() {
  const [start, setStart] = useState(0);
  const [visible, setVisible] = useState(4);
  const [animDir, setAnimDir] = useState(null); // 'left' or 'right' or null
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef(null);

  // Fetch products from Convex - get all products ordered by creation date (newest first)
  const products = useQuery(api.products.getAll) || [];

  useEffect(() => {
    const handleResize = () => {
      setVisible(window.innerWidth < 768 ? 2 : 4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Track scroll position for dots
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const page = Math.round(el.scrollLeft / el.clientWidth);
      setCurrentPage(page);
    };
    el.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, [visible]);

  const scrollToPage = (idx) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  };

  const prev = () => {
    if (start === 0) return;
    setAnimDir("right");
    setTimeout(() => {
      setStart((s) => s - 1);
      setAnimDir(null);
    }, 300);
  };
  
  const next = () => {
    if (start + visible >= products.length) return;
    setAnimDir("left");
    setTimeout(() => {
      setStart((s) => s + 1);
      setAnimDir(null);
    }, 300);
  };

  // Show loading state while data is being fetched
  if (products === undefined) {
    return (
      <section className="w-full flex flex-col items-center pt-1 bg-white">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide text-gray-800">
            NEW ARRIVALS
          </h2>
          <span className="block w-28 sm:w-36 h-[2px] mx-auto mt-1 opacity-50 rounded-full bg-gradient-to-r from-white via-black to-white"></span>
        </div>
        <div className="w-full max-w-7xl mx-auto flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
        </div>
      </section>
    );
  }

  // Show empty state if no products
  if (products.length === 0) {
    return (
      <section className="w-full flex flex-col items-center pt-1 bg-white">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide text-gray-800">
            NEW ARRIVALS
          </h2>
          <span className="block w-28 sm:w-36 h-[2px] mx-auto mt-1 opacity-50 rounded-full bg-gradient-to-r from-white via-black to-white"></span>
        </div>
        <div className="w-full max-w-7xl mx-auto flex items-center justify-center py-12">
          <p className="text-gray-500">No new arrivals available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full flex flex-col items-center pt-1 bg-white">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide text-gray-800">
          NEW ARRIVALS
        </h2>
        <span className="block w-28 sm:w-36 h-[2px] mx-auto mt-1 opacity-50 rounded-full bg-gradient-to-r from-white via-black to-white"></span>
      </div>
      <div className="relative w-full max-w-7xl mx-auto flex items-center">
        {/* Product Cards - horizontally scrollable */}
        <div ref={scrollRef} className="w-full overflow-x-auto scrollbar-hide product-slider">
          <div className="flex flex-nowrap gap-6 px-4 sm:px-6 lg:px-8">
            {products.map((p) => (
              <ProductCard
                key={p._id}
                productId={p.itemId || p._id}
                img={p.mainImage || "/products/placeholder.jpg"}
                name={p.name}
                category={p.category}
                price={p.price}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 m4">
        {Array.from({ length: Math.ceil(products.length / visible) }).map(
          (_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToPage(idx)}
              className={`w-1 h-1 rounded-full transition-colors duration-200 ${currentPage === idx ? "bg-gray-800" : "bg-gray-300"}`}
              aria-label={`Go to slide ${idx + 1}`}
              disabled={currentPage === idx}
            />
          )
        )}
      </div>
    </section>
  );
}
