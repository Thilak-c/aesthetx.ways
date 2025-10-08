"use client";
import React, { useState, useMemo } from "react";
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

  const [activeSubcategory, setActiveSubcategory] = useState("All");
  const [activeType, setActiveType] = useState("All");

  const categoryMap = {
    men: "Men",
    women: "Women",
    sneakers: "Sneakers",
  };

  const ctParam = searchParams.get("ct")?.toLowerCase() || "men";
  const activeCategory = categoryMap[ctParam] || "Men";

  const products = useQuery(api.category.getProductsByCategory, {
    category: activeCategory,
  }) ?? [];

  const { subcategories, subcategoryCards, types } = useMemo(() => {
    const subs = new Set(products.map((p) => p.subcategories).filter(Boolean));
    const subcats = ["All", ...Array.from(subs)];
    
    const cards = subcats.map((subcat) => {
      const subcatProducts = subcat === "All" 
        ? products 
        : products.filter(p => p.subcategories === subcat);
      
      return {
        name: subcat,
        image: subcatProducts[0]?.mainImage || "",
        count: subcatProducts.length
      };
    }).filter(card => card.count > 0);

    const allTypes = products.flatMap((p) => p.type ?? []);
    const uniqueTypes = ["All", ...Array.from(new Set(allTypes))];

    return { 
      subcategories: subcats, 
      subcategoryCards: cards, 
      types: uniqueTypes 
    };
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
    <div className="min-h-screen relative bg-gray-50 p-6 md:p-12">
      <div className="md:hidden top-0 h-[60px] "></div>
      <div className="absolute top-0 left-0 md:hidden">
        <NavbarMobile />
      </div>
      <div className="hidden absolute md:block">
        <Navbar />
      </div>

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

      {/* Subcategory Cards Section */}
      <section className="max-w-7xl mx-auto mb-8">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {subcategoryCards.map((card, idx) => (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setActiveSubcategory(card.name)}
              className={`relative h-48 rounded-lg overflow-hidden cursor-pointer group ${
                activeSubcategory === card.name ? "ring-4 ring-black" : ""
              }`}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundImage: `url(${card.image})` }}
              />
              
              {/* Overlay */}
              <div className={`absolute inset-0 transition-all duration-300 ${
                activeSubcategory === card.name
                  ? "bg-black/50"
                  : "bg-black/30 group-hover:bg-black/40"
              }`} />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <h3 className="text-xl font-bold mb-1 text-center">{card.name}</h3>
                <p className="text-sm opacity-90">{card.count} items</p>
              </div>

              {/* Active Indicator */}
              {activeSubcategory === card.name && (
                <motion.div
                  layoutId="activeSubcategory"
                  className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                >
                  <div className="w-3 h-3 bg-black rounded-full" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

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