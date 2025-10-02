"use client";
import React, { useState, useEffect, useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import Navbar, { NavbarMobile } from "@/components/Navbar";
import CustomDropdown from "./CustomDropdown";
import { useSearchParams, useRouter } from "next/navigation";

export default function MenWomenSneakersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // const [activeCategory, setActiveCategory] = useState("");
  const [activeSubcategory, setActiveSubcategory] = useState("All");
  const [activeType, setActiveType] = useState("All");

  // Map URL query to category
  const categoryMap = {
    men: "Men",
    women: "Women",
    sneakers: "Sneakers",
  };

  // Update URL when active changes
  const ctParam = searchParams.get("ct")?.toLowerCase() || "men";
  const activeCategory = categoryMap[ctParam] || "Men";

  // 2️⃣ Update URL whenever user clicks a tab

  // query products
const products = useQuery(api.category.getProductsByCategory, {
  category: activeCategory, // ✅ Use the already-mapped value
}) ?? [];


  const subcategories = useMemo(() => {
    const subs = new Set(products.map((p) => p.subcategories).filter(Boolean));
    return ["All", ...Array.from(subs)];
  }, [products]);

  const types = useMemo(() => {
    const allTypes = products.flatMap((p) => p.type ?? []);
    return ["All", ...Array.from(new Set(allTypes))];
  }, [products]);
  const handleClickProduct = (productId) => {
    sessionStorage.setItem("homeScroll", window.scrollY);
    router.push(`/product/${productId}`);
  };
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSub =
        activeSubcategory === "All" || p.subcategories === activeSubcategory;
      const matchType =
        activeType === "All" || (p.type?.includes(activeType) ?? false);
      return matchSub && matchType;
    });
  }, [products, activeSubcategory, activeType]);

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen  bg-gray-50 p-6 md:p-12">
      <div className="md:block h-[80px] md:h-[100px]"></div>
           <div className="md:hidden">
             <NavbarMobile />
           </div>
           <div className="hidden md:block">
             <Navbar />
           </div>
      {/* Hero */}

      {/* Category Tabs */}
      <nav className="flex gap-6 mb-6 relative max-w-7xl mx-auto border-b border-gray-200">
        {Object.keys(categoryMap).map((key) => (
          <button
            key={key}
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set("ct", key);
              router.replace(
                `${window.location.pathname}?${params.toString()}`
              );
            }}
            className={`relative text-lg font-semibold pb-2 ${
              ctParam === key
                ? "text-black"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            {categoryMap[key].toUpperCase()}
            {ctParam === key && (
              <motion.span
                layoutId="underline"
                className="absolute bottom-0 left-0 w-full h-1 bg-black rounded-full"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Filters */}
      <div className="flex gap-4 my-4 max-w-7xl mx-auto">
        <CustomDropdown
          label="Subcategory"
          options={subcategories}
          selected={activeSubcategory}
          onSelect={setActiveSubcategory}
        />

        <CustomDropdown
          label="Type"
          options={types}
          selected={activeType}
          onSelect={setActiveType}
        />
      </div>
      <div className="w-full h-[1px] bg-black max-w-7xl flex justify-center self-center-safe mx-auto blur-[2px] mb-4"></div>
      {/* Products Grid */}
      <section className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
          {filteredProducts.length === 0
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
    </div>
  );
}
