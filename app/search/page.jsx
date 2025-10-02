"use client";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar, { NavbarMobile } from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid, 
  List, 
  Star,
  TrendingUp,
  Clock,
  Tag,
  X,
  Sliders,
  RefreshCw,
  ChevronDown
} from "lucide-react";

export default function EnhancedSearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const priceMin = searchParams.get("priceMin") || "";
  const priceMax = searchParams.get("priceMax") || "";
  const inStock = searchParams.get("inStock") || "";
  const sortBy = searchParams.get("sortBy") || "relevance";

  // State management
  const [searchQuery, setSearchQuery] = useState(query);
  const [filters, setFilters] = useState({
    category: category,
    priceMin: priceMin,
    priceMax: priceMax,
    inStock: inStock === "true" ? true : inStock === "false" ? false : undefined,
    sortBy: sortBy
  });
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(24);
  const [isLoading, setIsLoading] = useState(false);

  // Get search results using enhanced search function
  const searchResults = useQuery(
    api.products.searchProducts,
    searchQuery.length >= 2 ? {
      query: searchQuery,
      limit: itemsPerPage,
      category: filters.category || undefined,
      priceMin: filters.priceMin ? Number(filters.priceMin) : undefined,
      priceMax: filters.priceMax ? Number(filters.priceMax) : undefined,
      sortBy: filters.sortBy,
      inStock: filters.inStock
    } : "skip"
  );

  // Get categories for filter dropdown
  const categories = useQuery(api.products.getProductCategories);

  // Memoized calculations
  const totalResults = useMemo(() => {
    if (!searchResults) return 0;
    return searchResults.length;
  }, [searchResults]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalResults / itemsPerPage);
  }, [totalResults, itemsPerPage]);

  const paginatedResults = useMemo(() => {
    if (!searchResults) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return searchResults.slice(startIndex, startIndex + itemsPerPage);
  }, [searchResults, currentPage, itemsPerPage]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setIsLoading(true);
    setCurrentPage(1);
    
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== '') {
      newParams.set(filterType, value);
    } else {
      newParams.delete(filterType);
    }
    
    window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);
    
    setTimeout(() => setIsLoading(false), 500);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage(1);
      // Update URL
      const newParams = new URLSearchParams(searchParams);
      newParams.set('q', searchQuery);
      window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      category: "",
      priceMin: "",
      priceMax: "",
      inStock: undefined,
      sortBy: "relevance"
    });
    setCurrentPage(1);
    setShowFilters(false);
    window.history.replaceState({}, '', `${window.location.pathname}?q=${encodeURIComponent(searchQuery)}`);
  };

  // Get sort icon
  const getSortIcon = (sortBy) => {
    switch (sortBy) {
      case "price-low":
        return <SortAsc className="w-4 h-4" />;
      case "price-high":
        return <SortDesc className="w-4 h-4" />;
      case "newest":
        return <Clock className="w-4 h-4" />;
      case "popular":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  if (searchQuery.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="md:block hidden h-[100px]"></div>
        <div className="md:hidden"><NavbarMobile /></div>
        <div className="hidden md:block"><Navbar /></div>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Products</h1>
            <p className="text-gray-600 mb-4">Enter at least 2 characters to search</p>
            <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="md:block hidden h-[100px]"></div>
      <div className="md:hidden"><NavbarMobile /></div>
      <div className="hidden md:block"><Navbar /></div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          <p className="text-gray-600 text-lg">
            {searchResults === undefined ? "Searching..." : `${totalResults} results found for "${searchQuery}"`}
          </p>
        </motion.div>

        {/* Enhanced Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </motion.div>

        {/* Enhanced Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 w-full justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Sliders className="w-4 h-4" />
              <span>Filters & Sort</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories?.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <select
                value={filters.inStock === undefined ? "" : filters.inStock ? "inStock" : "outOfStock"}
                onChange={(e) => handleFilterChange('inStock', e.target.value === "" ? undefined : e.target.value === "inStock")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Products</option>
                <option value="inStock">In Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View
              </label>
              <div className="flex items-center gap-1 border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"} transition-colors`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"} transition-colors`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden space-y-4 mt-4"
              >
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories?.map(cat => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name} ({cat.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceMin}
                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceMax}
                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter Actions */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Clear All
              </button>
              <div className="text-sm text-gray-500">
                {totalResults} results found
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Updating results...</p>
            </div>
          </div>
        ) : searchResults === undefined ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Searching...</p>
            </div>
          </div>
        ) : searchResults.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
              }
            >
              {paginatedResults.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link
                    href={`/product/${product.itemId}`}
                    className={`group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                      viewMode === "list" ? "flex items-center gap-4 p-4" : ""
                    }`}
                  >
                    <div className={`${viewMode === "grid" ? "aspect-square" : "w-24 h-24"} relative flex-shrink-0 overflow-hidden`}>
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className={viewMode === "grid" ? "p-4" : "flex-1"}>
                      <h3 className={`font-semibold text-gray-900 mb-1 ${
                        viewMode === "grid" ? "text-sm line-clamp-2" : "text-base"
                      }`}>
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {product.category}
                        </span>
                        {product.buys && product.buys > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-500">{product.buys}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-gray-900">
                          ₹{product.price}
                        </p>
                        {product.inStock === false && (
                          <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex justify-center items-center gap-2 mt-12"
              >
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
