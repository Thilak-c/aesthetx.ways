"use client";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import Router from "next/router";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
// Direct Convex client approach while API generation is fixed
import { convex } from "../convexClient";

export default function TopPicksSlider() {
  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
const router = useRouter();
  // Fetch products using direct Convex client
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching products from Convex...");

        const debugData = await convex.query("products:debugProducts");
        console.log("Debug data from database:", debugData);

        const result = await convex.query("products:getTopPicks");
        console.log("Products fetched successfully:", result);
        setProducts(result || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err);
        // Fallback mock data
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

  useEffect(() => {
    if (products.length > 0) {
      console.log(
        "Products data structure:",
        products.map((p) => ({
          _id: p._id,
          name: p.name,
          category: p.category,
          price: p.price,
          mainImage: p.mainImage,
          hasImage: !!p.mainImage,
        }))
      );
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
 const handleClickProduct = (productId) => {
    sessionStorage.setItem("homeScroll", window.scrollY);
    router.push(`/product/${productId}`);
  };
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
          {hasProducts ? `` : isLoading ? "..." : ""}
          {error && (
            <>
              <br />
              <span className="text-xs text-orange-600">
                ⚠️ Using fallback data - database connection issue
              </span>
            </>
          )}
        </p>
        <span className="block w-28 sm:w-36 h-[2px] mx-auto mt-1 opacity-50 rounded-full bg-gradient-to-r from-white via-black to-white"></span>
      </div>

      <div className="relative w-full md:max-w-[74%] mx-auto flex items-center">
        {/* Product Cards */}
        <div
          ref={scrollRef}
          className="w-full overflow-x-auto scrollbar-hide product-slider"
        >
          <div className="flex flex-nowrap gap-6 px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              // Skeleton loader (show 4 placeholder cards)
              Array.from({ length: 4 }).map((_, idx) => (
                <ProductCard key={`skeleton-${idx}`} loading />
              ))
            ) : error ? (
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
              products.map((p, idx) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }} // triggers when half of the card is visible
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
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
              ))
            ) : (
              <div className="flex items-center justify-center w-full py-8">
                <div className="text-gray-500">No top picks available.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {hasProducts &&
          pageCount > 1 &&
          Array.from({ length: pageCount }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToPage(idx)}
              className={`w-1 h-1 rounded-full transition-colors duration-200 ${
                currentPage === idx ? "bg-gray-800" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
              disabled={currentPage === idx}
            />
          ))}
      </div>
    </section>
  );
}
