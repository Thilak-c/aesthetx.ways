"use client"
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
import { 
  Heart, 
  History, 
  Zap,
  Star,
  Sparkles,
  TrendingUp,
  Eye
} from "lucide-react";

// Font classes for consistency
const fontClasses = {
  poppins: "font-poppins",
  inter: "font-inter"
};

export default function Home() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    category: "Men"
  });

  const recentlyViewed = useQuery(
    api.products.getRecentlyViewed,
    me ? { userId: me._id, limit: 8 } : "skip"
  );

  const personalizedProducts = useQuery(api.products.getPersonalizedProducts, { 
    limit: 8,
    userId: me?._id
  });

  // Get products for "You Might Also Like" section
  const allProducts = useQuery(api.products.getAllProducts, { limit: 10 });

  // Animation variants for consistency
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 ${fontClasses.poppins}`}>
      <div className="md:block hidden h-[100px]"></div>
      <div className="md:hidden"><NavbarMobile /></div>
      <div className="hidden md:block"><Navbar /></div>
      
      <ProductSlider />
      <TopPicksSlider />
      <NewArrivalsSlider />
      <CategoriesGrid />
      
      {/* You Might Also Like Section */}
      {allProducts && allProducts.length > 0 && (
        <motion.section 
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 lg:mt-20"
        >
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <motion.div 
                variants={itemVariants}
                // className="inline-flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full px-4 py-2 mb-4"
              >
                {/* <Sparkles className="w-4 h-4 text-gray-600" /> */}
                {/* <span className="text-sm font-medium text-gray-700">Curated Selection</span> */}
              </motion.div>
              <motion.h2 
                variants={itemVariants}
                className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
              >
                You Might Also Like
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
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
              <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
                {allProducts.slice(0, 8).map((product, index) => (
                  <motion.div
                    key={product.itemId}
                    variants={itemVariants}
                    className="flex-shrink-0 w-64 lg:w-72"
                  >
                    <ProductCard
                      img={product.mainImage}
                      name={product.name}
                      category={product.category}
                      price={product.price}
                      productId={product.itemId}
                      className="transition-all duration-300  "
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Trending in Men Section */}
      {trendingProducts && trendingProducts.length > 0 && (
        <motion.section 
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 lg:mt-20 bg-gradient-to-r py-16"
        >
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <motion.div 
                variants={itemVariants}
                // className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full px-4 py-2 mb-4"
              >
                {/* <TrendingUp className="w-4 h-4 text-orange-600" /> */}
                {/* <span className="text-sm font-medium text-orange-700">Trending Now</span> */}
              </motion.div>
              <motion.h2 
                variants={itemVariants}
                className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3"
              >
                <Zap className="w-8 h-8 text-gray-500" />
                <span>Trending in Men</span>
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
              >
                Most viewed and loved products in this category
              </motion.p>
            </motion.div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative"
            >
              <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
                {trendingProducts.map((trendingItem, index) => (
                  <motion.div
                    key={trendingItem.itemId}
                    variants={itemVariants}
                    className="flex-shrink-0 w-64 lg:w-72 relative group"
                  >
                    {/* Trending Badge */}
                 
                    
                    <ProductCard
                      img={trendingItem.mainImage}
                      name={trendingItem.name}
                      category={trendingItem.category}
                      price={trendingItem.price}
                      productId={trendingItem.itemId}
                      className="transition-all duration-300  "
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Recently Viewed Section */}
      {recentlyViewed && recentlyViewed.length > 0 && isLoggedIn && (
        <motion.section 
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 lg:mt-20"
        >
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <motion.div 
                variants={itemVariants}
                // className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full px-4 py-2 mb-4"
              >
                {/* <History className="w-4 h-4 text-blue-600" /> */}
                {/* <span className="text-sm font-medium text-blue-700">Your History</span> */}
              </motion.div>
              <motion.h2 
                variants={itemVariants}
                className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3"
              >
                <History className="w-8 h-8 text-gray-500" />
                <span>Recently Viewed</span>
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
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
              <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
                {recentlyViewed.map((item, index) => (
                  <motion.div
                    key={item._id}
                    variants={itemVariants}
                    className="flex-shrink-0 w-64 lg:w-72 relative group"
                  >
                    {/* Recently Viewed Badge */}
                   
                    
                    <ProductCard
                      img={item.productImage}
                      name={item.productName}
                      category={item.productCategory}
                      price={item.productPrice}
                      productId={item.productId}
                      className="transition-all duration-300  "
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Personalized "For [user name]" Section */}
      {personalizedProducts && personalizedProducts.length > 0 && me && isLoggedIn && (
        <motion.section 
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 lg:mt-20 bg-gradient-to-r py-16"
        >
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <motion.div 
                variants={itemVariants}
                // className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full px-4 py-2 mb-4"
              >
                {/* <Heart className="w-4 h-4 text-pink-600" /> */}
                {/* <span className="text-sm font-medium text-pink-700">Personald</span> */}
              </motion.div>
              <motion.h2 
                variants={itemVariants}
                className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3"
              >
                <Heart className="w-8 h-8 text-g-500" />
                <span>For {me.name}</span>
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
              >
                Curated based on your interests: <span className="font-semibold text-gray-600">{me.interests?.join(', ')}</span>
              </motion.p>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative"
            >
              <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
                {personalizedProducts.map((personalizedProduct, index) => (
                  <motion.div
                    key={personalizedProduct._id}
                    variants={itemVariants}
                    className="flex-shrink-0 w-64 lg:w-72 relative group"
                  >
                    {/* Personalized Badge */}
                    
                    
                    <ProductCard
                      img={personalizedProduct.mainImage}
                      name={personalizedProduct.name}
                      category={personalizedProduct.category}
                      price={personalizedProduct.price}
                      productId={personalizedProduct.itemId}
                      className="transition-all duration-300  "
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}
     
      <Footer/>
    </div>
  );
}