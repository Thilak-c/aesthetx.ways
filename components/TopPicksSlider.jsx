"use client"
import Image from "next/image";
import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
import ProductCard from "./ProductCard";

// Direct Convex client approach while API generation is fixed
import { convex } from "../convexClient";

export default function TopPicksSlider() {
  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products using direct Convex client
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching products from Convex...');
        
        // First, let's debug what's in the database
        const debugData = await convex.query("products:debugProducts");
        console.log('Debug data from database:', debugData);
        
        // Use the Convex client directly to call the function
        const result = await convex.query("products:getTopPicks");
        console.log('Products fetched successfully:', result);
        setProducts(result || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err);
        // Fallback to mock data if Convex query fails
        const fallbackProducts = [
          {
            _id: "1",
            mainImage: "/products/kurukshetra.jpg",
            name: "TSS Originals: Kurukshetra",
            category: "Oversized T-Shirts",
            price: 1799,
          },
          {
            _id: "2",
            mainImage: "/products/nautical.jpg",
            name: "Cotton Linen Stripes: Nautical",
            category: "Shirts",
            price: 1499,
          },
        ];
        setProducts(fallbackProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Debug: Log products data structure
  useEffect(() => {
    if (products.length > 0) {
      console.log('Products data structure:', products.map(p => ({
        _id: p._id,
        name: p.name,
        category: p.category,
        price: p.price,
        mainImage: p.mainImage,
        hasImage: !!p.mainImage
      })));
    }
  }, [products]);

  const hasProducts = products && products.length > 0;

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
console.log(products)
  const scrollToPage = (idx) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  };
  return (
    <section className="w-full flex flex-col items-center py-12 bg-white">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide text-gray-800">
          TOP PICKS OF THE WEEK
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          {hasProducts ? `` : "Loading top products..."}
          {error && (
            <>
              <br />
              <span className="text-xs text-orange-600">⚠️ Using fallback data - database connection issue</span>
            </>
          )}
        </p>
        <span className="block w-28 sm:w-36 h-[2px] mx-auto mt-1 opacity-50 rounded-full bg-gradient-to-r from-white via-black to-white"></span>
      </div>
      <div className="relative w-full max-w-7xl mx-auto flex items-center">
        {/* Left Arrow - hide on mobile */}
       
        {/* Product Cards - horizontally scrollable */}
        <div ref={scrollRef} className="w-full overflow-x-auto scrollbar-hide product-slider">
          <div className="flex flex-nowrap gap-6 px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              // Loading state
              <div className="flex items-center justify-center w-full py-8">
                <div className="text-gray-500">Loading top picks...</div>
              </div>
            ) : error ? (
              // Error state
              <div className="flex flex-col items-center justify-center w-full py-8 gap-3">
                <div className="text-red-500">Failed to load top picks.</div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : hasProducts ? (
              products.map((p, i) => (
                <ProductCard
                  key={p._id}
                  productId={p._id}
                  img={p.mainImage}
                  name={p.name}
                  category={p.category || "General"}
                  price={p.price}
                />
              ))
            ) : (
              // Empty state
              <div className="flex items-center justify-center w-full py-8">
                <div className="text-gray-500">No top picks available.</div>
              </div>
            )}
          </div>
        </div>
        {/* Right Arrow - hide on mobile */}
       
        
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {hasProducts && pageCount > 1 && Array.from({ length: pageCount }).map((_, idx) => (
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