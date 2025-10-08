"use client";
import React, { useState, useMemo, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import Navbar, { NavbarMobile } from "@/components/Navbar";
import CustomDropdown from "@/components/CustomDropdown";
import { useSearchParams, useRouter } from "next/navigation";

export default function SubcategoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeType, setActiveType] = useState("All");
  const [localSubcategory, setLocalSubcategory] = useState(null);

  // Normalize subcategory string for better matching
  const normalizeSubcategory = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
      .toLowerCase()
      .replace(/[-_\s]+/g, "") // Remove hyphens, underscores, spaces
      .trim();
  };

  // Map URL query to subcategory with multiple variations
  const subcategoryMap = {
    "men-low-top-sneakers": "Men Low Top Sneakers",
    "menlowropsneakers": "Men Low Top Sneakers",
    "t-shirt": "T-shirt",
    "tshirt": "T-shirt",
    "sweatshirt": "Sweatshirt",
    "pants": "Pants",
    "women-sneakers": "Women Sneakers",
    "womensneakers": "Women Sneakers",
    "hoodies": "Hoodies",
  };

  // Get active subcategory from URL or local state
  const subParam = searchParams.get("sub");
  const normalizedParam = subParam ? normalizeSubcategory(subParam) : "menlowropsneakers";
  const urlSubcategory = subcategoryMap[normalizedParam] || null;
  
  // Use local state if set, otherwise use URL
  const activeSubcategory = localSubcategory || urlSubcategory;

  // Update local state when URL changes
  useEffect(() => {
    if (urlSubcategory) {
      setLocalSubcategory(urlSubcategory);
    }
  }, [urlSubcategory]);

  // Query all products
  const allProducts = useQuery(api.category.getAllProducts) ?? [];
  const isLoading = allProducts === undefined;

  // Filter products by subcategory with better matching
  const products = useMemo(() => {
    if (!activeSubcategory || !allProducts.length) return [];
    
    return allProducts.filter((p) => {
      if (!p.subcategories) return false;
      
      // Normalize both for comparison
      const productSubNormalized = normalizeSubcategory(p.subcategories);
      const activeSubNormalized = normalizeSubcategory(activeSubcategory);
      
      return productSubNormalized === activeSubNormalized;
    });
  }, [allProducts, activeSubcategory]);

  // Get unique types from filtered products
  const types = useMemo(() => {
    const allTypes = products.flatMap((p) => p.type ?? []);
    return ["All", ...Array.from(new Set(allTypes))];
  }, [products]);

  const handleClickProduct = (productId) => {
    sessionStorage.setItem("subcategoryScroll", window.scrollY);
    router.push(`/product/${productId}`);
  };

  // Restore scroll position on mount
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("subcategoryScroll");
    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll));
      sessionStorage.removeItem("subcategoryScroll");
    }
  }, []);

  // Filter by type
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchType =
        activeType === "All" || (p.type?.includes(activeType) ?? false);
      return matchType;
    });
  }, [products, activeType]);

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="md:block h-[80px] md:h-[100px]"></div>
      <div className="md:hidden">
        <NavbarMobile />
      </div>
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Error State - Invalid Subcategory */}
      {!activeSubcategory && !isLoading && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              Subcategory Not Found
            </h2>
            <p className="text-red-600 mb-4">
              The subcategory "{subParam}" doesn't exist.
            </p>
            <button
              onClick={() => router.push("/subcategory?sub=t-shirt")}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Browse T-Shirts
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {activeSubcategory && (
        <>
          {/* Hero Section */}
          <div className="max-w-7xl mx-auto mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              {activeSubcategory}
            </h1>
            <p className="text-gray-600">
              {isLoading 
                ? "Loading products..." 
                : `${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"} found`
              }
            </p>
          </div>

          {/* Subcategory Tabs */}
          <nav className="flex gap-6 mb-6 relative max-w-7xl mx-auto border-b border-gray-200 overflow-x-auto">
            {Object.entries(subcategoryMap)
              .filter(([key, value], index, arr) => 
                // Remove duplicate values, keep first occurrence
                arr.findIndex(([k, v]) => v === value) === index
              )
              .map(([key, value]) => {
                const isActive = activeSubcategory === value;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      // Update local state without page reload
                      setLocalSubcategory(value);
                      setActiveType("All");
                      // Update URL without reload
                      window.history.pushState({}, '', `/shop/subcategory?sub=${key}`);
                    }}
                    className={`relative text-sm md:text-lg font-semibold pb-2 whitespace-nowrap ${
                      isActive
                        ? "text-black"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    {value.toUpperCase()}
                    {isActive && (
                      <motion.span
                        layoutId="underline"
                        className="absolute bottom-0 left-0 w-full h-1 bg-black rounded-full"
                      />
                    )}
                  </button>
                );
              })}
          </nav>

          {/* Filters */}
          {types.length > 1 && (
            <div className="flex gap-4 my-4 max-w-7xl mx-auto">
              <CustomDropdown
                label="Type"
                options={types}
                selected={activeType}
                onSelect={setActiveType}
              />
            </div>
          )}

          <div className="w-full h-[1px] bg-black max-w-7xl flex justify-center self-center-safe mx-auto blur-[2px] mb-4"></div>

          {/* Products Grid */}
          <section className="max-w-7xl mx-auto">
            {/* Empty State */}
            {!isLoading && filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your filters or check back later.
                </p>
                <button
                  onClick={() => setActiveType("All")}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
              {isLoading
                ? Array.from({ length: 8 }).map((_, idx) => (
                    <ProductCard key={`skeleton-${idx}`} loading />
                  ))
                : filteredProducts.map((product, idx) => (
                    <motion.div
                      key={product.itemId}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: idx * 0.05, duration: 0.4 }}
                      onClick={() => handleClickProduct(product.itemId)}
                    >
                      <ProductCard
                        img={product.mainImage}
                        hoverImg={product.otherImages?.[0]}
                        name={product.name}
                        category={product.category}
                        price={product.price}
                        productId={product.itemId}
                      />
                    </motion.div>
                  ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}