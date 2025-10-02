"use client";

import { use, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

// Only Men, Women, and Sneakers
const slugToCategoryMap = {
  "men": "Men",
  "women": "Women",
  "sneakers": "Sneakers",
};

export default function CategoryPage({ params }) {
  const { slug } = use(params);
  const categoryName = slugToCategoryMap[slug.toLowerCase()];
  const [viewMode, setViewMode] = useState("grid");
  const [hoveredProduct, setHoveredProduct] = useState(null);
  
  // Fetch products based on category
  const products = useQuery(
    categoryName ? api.products.getProductsByCategoryOrType : undefined,
    categoryName ? { searchTerm: categoryName, searchType: "both" } : "skip"
  );

  const subcategories = products && Array.isArray(products)
    ? [...new Set(products.map(p => p.subcategories))].filter(Boolean)
    : [];

  // Loading state
  if (products === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading collection...</p>
        </div>
      </div>
    );
  }

  // Category not found or no products
  if (!categoryName || !products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-8xl mb-6 opacity-20">🛍️</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {!categoryName ? "Category Not Found" : "Coming Soon"}
          </h1>
          <p className="text-gray-500 mb-8 text-lg">
            {!categoryName 
              ? `The category "${slug}" doesn't exist. Try: Men, Women, or Sneakers`
              : "We're curating something special for this collection."
            }
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 font-medium"
          >
            <span>Back to Home</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="py-6 px-4 max-w-7xl mx-auto">
        <nav className="text-sm flex items-center gap-2 text-gray-600">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <span className="text-black font-medium">{categoryName}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-3 tracking-tight">
                {categoryName}
              </h1>
              <p className="text-xl text-gray-600">{products.length} products available</p>
            </div>
            
            {/* View Toggle */}
            <div className="hidden md:flex gap-2 bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-full transition-all ${
                  viewMode === "grid" ? "bg-white shadow-md" : "hover:bg-gray-200"
                }`}
                aria-label="Grid view"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-full transition-all ${
                  viewMode === "list" ? "bg-white shadow-md" : "hover:bg-gray-200"
                }`}
                aria-label="List view"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        }`}>
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/product/${product._id}`}
              className="group"
              onMouseEnter={() => setHoveredProduct(product._id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div className={`${viewMode === "list" ? "flex gap-6" : ""}`}>
                {/* Image Container */}
                <div className={`relative overflow-hidden rounded-2xl bg-gray-100 ${
                  viewMode === "list" ? "w-72 h-72 flex-shrink-0" : "aspect-[3/4]"
                }`}>
                  <img
                    src={product.mainImage || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.buys > 100 && (
                      <span className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                        Bestseller
                      </span>
                    )}
                    {product.currentStock < 10 && product.currentStock > 0 && (
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                        Only {product.currentStock} left
                      </span>
                    )}
                    {(!product.inStock || product.currentStock === 0) && (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className={`${viewMode === "list" ? "flex-1" : "mt-4"}`}>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.subcategories && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {product.subcategories}
                      </span>
                    )}
                    {product.type && Array.isArray(product.type) && product.type.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {product.description && viewMode === "list" && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                    {product.buys > 0 && (
                      <span className="text-xs text-gray-500">
                        {product.buys} sold
                      </span>
                    )}
                  </div>

                  {/* Sizes */}
                  {product.availableSizes && Array.isArray(product.availableSizes) && product.availableSizes.length > 0 && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {product.availableSizes.slice(0, 5).map((size, idx) => (
                        <div
                          key={idx}
                          className={`w-10 h-10 flex items-center justify-center border rounded-lg text-sm font-medium transition-all ${
                            product.sizeStock?.[size] > 0
                              ? 'border-gray-300 text-gray-700 hover:border-black'
                              : 'border-gray-200 text-gray-400 line-through'
                          }`}
                        >
                          {size}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
