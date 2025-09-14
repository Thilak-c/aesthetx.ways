"use client";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ProductCard from "./ProductCard";
import { motion } from "framer-motion";

import { useRouter } from "next/navigation";

export default function NewArrivalsSlider() {
  const [visible, setVisible] = useState(4);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef(null);
const router = useRouter();
  // Fetch products from Convex - get all products ordered by creation date (newest first)
  const products = useQuery(api.products.getAll);

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
   const handleClickProduct = (productId) => {
    sessionStorage.setItem("homeScroll", window.scrollY);
    router.push(`/product/${productId}`);
  };

  return (
    <section className="w-full flex flex-col items-center pt-1 bg-white">
      {/* Heading */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide text-gray-800">
          NEW ARRIVALS
        </h2>
        <span className="block w-28 sm:w-36 h-[2px] mx-auto mt-1 opacity-50 rounded-full bg-gradient-to-r from-white via-black to-white"></span>
      </div>

      <div className="relative w-full  md:max-w-[74%]   mx-auto flex items-center">
        {/* Product Cards - horizontally scrollable */}
        <div ref={scrollRef} className="w-full overflow-x-auto scrollbar-hide product-slider">
          <div className="flex flex-nowrap gap-6 px-4 sm:px-6 lg:px-8">
            {/* 🔥 Loading Skeleton */}
            {products === undefined &&
              Array.from({ length: visible }).map((_, idx) => (
                <ProductCard key={`skeleton-${idx}`} loading />
              ))}

            {/* Empty state */}
            {products?.length === 0 && (
              <div className="flex w-full justify-center items-center py-12">
                <p className="text-gray-500">No new arrivals available at the moment.</p>
              </div>
            )}

            {/* Real products */}
            
{products?.map((p, idx) => (
  <motion.div
    key={p._id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }} // triggers when half of the card is visible
    transition={{ delay: idx * 0.05, duration: 0.4 }}

                    onClick={() => handleClickProduct(p._id)}
  >
    <ProductCard
      productId={p.itemId || p._id}
      img={p.mainImage || "/products/placeholder.jpg"}
      name={p.name}
      category={p.category}
      price={p.price}
    />
  </motion.div>
))}

          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      {products && products.length > 0 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(products.length / visible) }).map(
            (_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToPage(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                  currentPage === idx ? "bg-gray-800" : "bg-gray-300"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}
