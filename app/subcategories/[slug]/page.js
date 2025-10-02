"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import Link from "next/link";

// Mapping slugs to exact database subcategory names
const slugToSubcategoryMap = {
  "oversized-tshirts": "Oversized T-Shirts",
  "oversized-t-shirts": "Oversized T-Shirts",
  "t-shirts": "T-Shirts",
  "tshirts": "T-Shirts",
  "all-bottoms": "All Bottoms",
  "bottoms": "All Bottoms",
  "shirts": "Shirts",
  "polos": "Polos",
  "polo": "Polos",
  "sneakers": "Sneakers",
  "shoes": "Sneakers",
  "backpacks": "Backpacks",
  "bags": "Backpacks",
  "perfumes": "Perfumes",
  "fragrance": "Perfumes",
  "caps": "Caps",
  "hats": "Caps",
};
//giigg
export default function SubcategoryPage({ params }) {
  // Unwrap the params Promise using React.use()
  const { slug } = use(params);
  
  // Get the exact subcategory name from mapping
  const subcategoryName = slugToSubcategoryMap[slug.toLowerCase()];
  
  // Fetch products for this subcategory from Convex
  const products = useQuery(
    subcategoryName 
      ? api.products.getProductsBySubcategory 
      : undefined,
    subcategoryName ? { subcategory: subcategoryName } : "skip"
  );

  // Loading state
  if (products === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600 text-xl">
          Loading products...
        </div>
      </div>
    );
  }

  // Subcategory not found or no products
  if (!subcategoryName || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {!subcategoryName ? "Subcategory Not Found" : "No Products Found"}
          </h1>
          <p className="text-gray-600 mb-6">
            {!subcategoryName 
              ? `The subcategory "${slug}" doesn't exist.`
              : `No products available in ${subcategoryName} yet.`
            }
          </p>
          <div className="space-x-4">
            <Link 
              href="/" 
              className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Go Home
            </Link>
            <button 
              onClick={() => console.log("Debug info:", { slug, subcategoryName, products })}
              className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Debug Info
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          {products[0]?.category && (
            <>
              <Link 
                href={`/categories/${products[0].category.toLowerCase().replace(/\s+/g, '-')}`} 
                className="hover:text-gray-900"
              >
                {products[0].category}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-gray-900 font-semibold">{subcategoryName}</span>
        </div>

        {/* Subcategory Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide text-gray-800">
            {subcategoryName}
          </h1>
          <span className="block w-36 h-[2px] mx-auto mt-2 opacity-50 rounded-full bg-gradient-to-r from-white via-black to-white"></span>
          <p className="text-gray-600 mt-4">
            {products.length} {products.length === 1 ? 'product' : 'products'} available
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/product/${product._id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition"
            >
              <div className="relative h-64 bg-gray-100">
                <img
                  src={product.mainImage || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                
                {/* Stock Badge */}
                {product.currentStock < 10 && product.currentStock > 0 && (
                  <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                    Only {product.currentStock} left
                  </span>
                )}
                
                {/* Out of Stock Badge */}
                {!product.inStock || product.currentStock === 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Out of Stock
                  </span>
                )}

                {/* Popular Badge */}
                {product.buys > 100 && (
                  <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                    Popular
                  </span>
                )}
              </div>

              <div className="p-4">
                {/* Product Type Tags */}
                {product.type && product.type.length > 0 && (
                  <div className="flex gap-1 mb-2 flex-wrap">
                    {product.type.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                  {product.name}
                </h3>
                
                {product.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Available Sizes */}
                {product.availableSizes && product.availableSizes.length > 0 && (
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {product.availableSizes.map((size, idx) => (
                      <span 
                        key={idx}
                        className={`text-xs border px-2 py-1 rounded ${
                          product.sizeStock?.[size] > 0 
                            ? 'border-gray-300 text-gray-700' 
                            : 'border-gray-200 text-gray-400 line-through'
                        }`}
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="mb-3">
                  <p className="text-xl font-bold text-gray-900">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Buys Counter */}
                {product.buys > 0 && (
                  <p className="text-xs text-gray-500 mb-3">
                    {product.buys} {product.buys === 1 ? 'person has' : 'people have'} bought this
                  </p>
                )}

                <button 
                  className={`w-full py-2 rounded-lg transition ${
                    product.inStock && product.currentStock > 0
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (product.inStock && product.currentStock > 0) {
                      console.log("Add to cart:", product._id);
                    }
                  }}
                  disabled={!product.inStock || product.currentStock === 0}
                >
                  {product.inStock && product.currentStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
