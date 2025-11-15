"use client";
import Navbar, { NavbarMobile } from "@/components/Navbar";
import Footer from "@/ components/footer";
import { useState, useEffect } from "react";
import Image from "next/image";
import ProductSlider from "@/components/ProductSlider";
import CategoriesGrid from "@/components/CategoriesGrid";
import NewArrivalsSlider from "@/components/NewArrivalsSlider";
import TopPicksSlider from "@/components/TopPicksSlider";
import ProductCard from "@/components/ProductCard";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  Heart,
  History,
  Zap,
  Star,
  Sparkles,
  TrendingUp,
  Eye,
} from "lucide-react";
import { Poppins, Inter } from "next/font/google";
import { useProductView } from "@/hooks/useProductView";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
});
// Font classes for consistency
const fontClasses = {
  poppins: "font-poppins",
  inter: "font-inter",
};

export default function Home() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // In your page component, e.g., HomePage.jsx
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("homeScroll", window.scrollY);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
  useEffect(() => {
    const scrollY = sessionStorage.getItem("homeScroll");
    if (scrollY) {
      window.scrollTo({ top: parseInt(scrollY), behavior: "auto" });
      sessionStorage.removeItem("homeScroll"); // optional: clear after restoring
    }
  }, []);
  const handleClickProduct = (productId) => {
    sessionStorage.setItem("homeScroll", window.scrollY);
    router.push(`/product/${productId}`);
  };
  // Get token from cookies
  useEffect(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
      setToken(match ? decodeURIComponent(match[1]) : null);
    }
  }, []);

  // Get user data
  const me = useQuery(api.users.meByToken, token ? { token } : "skip");

  useEffect(() => {
    if (me) {
      setIsLoggedIn(true);
    } else if (token && !me) {
      setIsLoggedIn(false);
    }
  }, [me, token]);

  // Queries for the new sections
  const trendingProducts = useQuery(api.views.getMostViewedProducts, {
    limit: 8,
    category: "Men",
  });

  const recentlyViewed = useQuery(
    api.products.getRecentlyViewed,
    me ? { userId: me._id, limit: 8 } : "skip"
  );

  const personalizedProducts = useQuery(api.products.getPersonalizedProducts, {
    limit: 8,
    userId: me?._id,
  });

  // Get products for "You Might Also Like" section
  const allProducts = useQuery(api.products.getAllProducts, { limit: 10 });

  // Animation variants for consistency
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br bg-[#fff] ${fontClasses.poppins}`}
    >
      <div className="xl:block hidden h-[80px] xl:h-[100px]"></div>
      <div className="xl:hidden">
        <NavbarMobile />
      </div>
      <div className="hidden  xl:block">
        <Navbar />
      </div>
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className=""
      >
        <ProductSlider />
      </motion.section>
      <div className="p-2">

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className=""
      >
        <TopPicksSlider />
      </motion.section>

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className=""
      >
        <NewArrivalsSlider />
      </motion.section>
            </div>

      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className=" "
      >
        <CategoriesGrid />
      </motion.section>

      {allProducts && allProducts.length > 0 ? (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className=""
        >
          <div className="md:max-w-[74%] mx-auto px-2 lg:px-8">
            {/* Heading */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <motion.h2
                variants={itemVariants}
                className="text-base lg:text-lg font-light text-gray-900 mb-4"
              >
                You Might Also Like
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-xs font-light text-gray-600 max-w-2xl mx-auto"
              >
                Discover more products that match your style and preferences
              </motion.p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative"
            >
              {/* Desktop: Horizontal scroll */}
              <div className="hidden md:flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
                {/* Skeleton loading if allProducts is undefined */}
                {!allProducts &&
                  Array.from({ length: 8 }).map((_, idx) => (
                    <div key={`also-like-skeleton-${idx}`}>
                      <ProductCard loading />
                    </div>
                  ))}

                {/* Real products */}
                {allProducts?.slice(0, 8).map((product, index) => (
                  <motion.div
                    key={product._id}
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    onClick={() => handleClickProduct(product.itemId)}
                  >
                    <ProductCard
                      img={product.mainImage}
                      name={product.name}
                      category={product.category}
                      price={product.price}
                      productId={product.itemId}
                      className="transition-all duration-300"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Mobile: 2 column grid */}
              <div className="md:hidden grid grid-cols-2 gap-4">
                {/* Skeleton loading */}
                {!allProducts &&
                  Array.from({ length: 6 }).map((_, idx) => (
                    <ProductCard key={`also-like-skeleton-mobile-${idx}`} loading />
                  ))}

                {/* Real products */}
                {allProducts?.slice(0, 8).map((product, index) => (
                  <motion.div
                    key={product._id}
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    onClick={() => handleClickProduct(product.itemId)}
                  >
                    <ProductCard
                      img={product.mainImage}
                      name={product.name}
                      category={product.category}
                      price={product.price}
                      productId={product.itemId}
                      className="transition-all duration-300"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>
      ) : (
        // Optional: fallback skeleton if allProducts is undefined
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className=""
        >
          <div className="md:max-w-[74%] mx-auto px-4 lg:px-8">
            {/* Heading Skeleton */}
            <div className="text-center mb-12">
              <div className="h-6 w-48 bg-gray-200 mx-auto rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-72 bg-gray-200 mx-auto rounded animate-pulse"></div>
            </div>

            {/* Horizontal Skeleton Cards */}
            <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={`also-like-skeleton-${idx}`}
                  className=""
                >
                  <ProductCard loading />
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Trending in Men Section */}
      {!trendingProducts || trendingProducts.length === 0 ? (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className=""
        >
          <div className="md:max-w-[74%] mx-auto px-4 lg:px-8">
            {/* Heading Skeleton */}
            <div className="text-center mb-12">
              <div className="h-6 w-48 bg-gray-200 mx-auto rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-72 bg-gray-200 mx-auto rounded animate-pulse"></div>
            </div>

            {/* Horizontal Skeleton Cards */}
            <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`trending-skeleton-${idx}`}
                  className=""
                >
                  <ProductCard loading />
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className=""
        >
          <div className="md:max-w-[74%] mx-auto px-4 lg:px-8">
            {/* Heading */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <motion.h2
                variants={itemVariants}
                className="text-base lg:text-lg font-light text-gray-900 mb-4 flex items-center justify-center space-x-3"
              >
                {/* <Zap className="w-8 h-8 text-gray-500" /> */}
                <span>Trending in Men</span>
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-xs font-light text-gray-600 max-w-2xl mx-auto"
              >
                Most viewed and loved products in this category
              </motion.p>
            </motion.div>

            {/* Horizontal Scrollable Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              {/* Desktop: Horizontal scroll */}
              <div className="hidden md:flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
                {trendingProducts.map((trendingItem, index) => (
                  <motion.div
                    key={trendingItem.itemId}
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    onClick={() => handleClickProduct(trendingItem.itemId)}
                  >
                    <ProductCard
                      img={trendingItem.mainImage}
                      name={trendingItem.name}
                      category={trendingItem.category}
                      price={trendingItem.price}
                      productId={trendingItem.itemId}
                      className="transition-all duration-300"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Mobile: 2 column grid */}
              <div className="md:hidden grid grid-cols-2 gap-4">
                {trendingProducts.map((trendingItem, index) => (
                  <motion.div
                    key={trendingItem.itemId}
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    onClick={() => handleClickProduct(trendingItem.itemId)}
                  >
                    <ProductCard
                      img={trendingItem.mainImage}
                      name={trendingItem.name}
                      category={trendingItem.category}
                      price={trendingItem.price}
                      productId={trendingItem.itemId}
                      className="transition-all duration-300"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Recently Viewed Section */}
      {isLoggedIn && (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className=""
        >
          <div className="md:max-w-[74%] font-poppins mx-auto px-4 lg:px-8">
            {/* Heading */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <motion.h2
                variants={itemVariants}
                className="text-base lg:text-lg font-light text-gray-900 mb-4 flex items-center justify-center space-x-3"
              >
                {/* <History className="w-8 h-8 text-gray-500" /> */}
                <span>Recently Viewed</span>
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-xs font-light text-gray-600 max-w-2xl mx-auto"
              >
                Continue browsing products you've recently explored
              </motion.p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative"
            >
              {/* Desktop: Horizontal scroll */}
              <div className="hidden md:flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
                {/* Skeleton loading when recentlyViewed is undefined */}
                {!recentlyViewed &&
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={`recent-skeleton-${idx}`}>
                      <ProductCard loading />
                    </div>
                  ))}

                {/* Real products */}
                {recentlyViewed?.map((item, index) => (
                  <motion.div
                    key={item._id}
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    onClick={() => handleClickProduct(item.productId)}
                  >
                    <ProductCard
                      img={item.productImage}
                      name={item.productName}
                      category={item.productCategory}
                      price={item.productPrice}
                      productId={item.productId}
                      className="transition-all duration-300"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Mobile: 2 column grid */}
              <div className="md:hidden grid grid-cols-2 gap-4">
                {/* Skeleton loading */}
                {!recentlyViewed &&
                  Array.from({ length: 4 }).map((_, idx) => (
                    <ProductCard key={`recent-skeleton-mobile-${idx}`} loading />
                  ))}

                {/* Real products */}
                {recentlyViewed?.map((item, index) => (
                  <motion.div
                    key={`mobile-${item._id}`}
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    onClick={() => handleClickProduct(item.productId)}
                  >
                    <ProductCard
                      img={item.productImage}
                      name={item.productName}
                      category={item.productCategory}
                      price={item.productPrice}
                      productId={item.productId}
                      className="transition-all duration-300"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Personalized "For [user name]" Section */}
      {isLoggedIn && me && (
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className=""
        >
          <div className="md:max-w-[74%] mx-auto px-4 lg:px-8">
            {/* Heading */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <motion.h2
                variants={itemVariants}
                className="text-base lg:text-lg font-light text-gray-900 mb-4 flex items-center justify-center space-x-3"
              >
                {/* <Heart className="w-8 h-8 text-gray-500" />/ */}
                <span>For {me.name}</span>
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-xs font-light text-gray-600 max-w-2xl mx-auto"
              >
                Curated based on your interests:{" "}
                <span className="font-light text-gray-600">
                  {me.interests?.join(", ")}
                </span>
              </motion.p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative"
            >
              {/* Desktop: Horizontal scroll */}
              <div className="hidden md:flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
                {/* Skeleton loading when personalizedProducts is undefined */}
                {!personalizedProducts &&
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={`personal-skeleton-${idx}`}>
                      <ProductCard loading />
                    </div>
                  ))}

                {/* Real products */}
                {personalizedProducts?.map((personalizedProduct, index) => (
                  <motion.div
                    key={personalizedProduct._id}
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    onClick={() => handleClickProduct(personalizedProduct.itemId)}
                  >
                    <ProductCard
                      img={personalizedProduct.mainImage}
                      name={personalizedProduct.name}
                      category={personalizedProduct.category}
                      price={personalizedProduct.price}
                      productId={personalizedProduct.itemId}
                      className="transition-all duration-300"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Mobile: 2 column grid */}
              <div className="md:hidden grid grid-cols-2 gap-4">
                {/* Skeleton loading */}
                {!personalizedProducts &&
                  Array.from({ length: 4 }).map((_, idx) => (
                    <ProductCard key={`personal-skeleton-mobile-${idx}`} loading />
                  ))}

                {/* Real products */}
                {personalizedProducts?.map((personalizedProduct, index) => (
                  <motion.div
                    key={`mobile-${personalizedProduct._id}`}
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    onClick={() => handleClickProduct(personalizedProduct.itemId)}
                  >
                    <ProductCard
                      img={personalizedProduct.mainImage}
                      name={personalizedProduct.name}
                      category={personalizedProduct.category}
                      price={personalizedProduct.price}
                      productId={personalizedProduct.itemId}
                      className="transition-all duration-300"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

    </div>
  );
}
