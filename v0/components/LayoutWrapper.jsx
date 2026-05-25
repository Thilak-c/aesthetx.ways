"use client";
import { useQuery, useMutation, api } from "@/lib/convex-compat";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import HelpChatWidget from "./HelpChatWidget";
import Footer from "../components/footer";
// import PageViewTracker from "./PageViewTracker"; // TEMPORARILY DISABLED

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const [token, setToken] = useState(null);
  const [showLoading, setShowLoading] = useState(pathname === '/');
  // const { client, ConvexProvider } = getConvexClient(); // Removed destructuring

  // Check if current page is checkout or admin
  const isCheckoutOrAdmin = pathname?.startsWith('/checkout') || pathname?.startsWith('/admin');

  // Fetch session token on client side
  useEffect(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
      setToken(match ? decodeURIComponent(match[1]) : null);
    }
  }, []);

  // Show loading screen every time they land on the home page for a minimum of 3 seconds
  useEffect(() => {
    if (pathname === '/') {
      setShowLoading(true);
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [pathname]);

  // Fetch user data using Convex query (happens in background)
  const user = useQuery(api.users.meByToken, token ? { token } : "skip");

  return (
    // <ConvexProvider client={client}> // Removed ConvexProvider wrapper
    <>
      {/* Render content in background while loading */}
      <div style={{ visibility: showLoading ? 'hidden' : 'visible' }}>
        {/* <PageViewTracker userId={user?._id} /> */} {/* TEMPORARILY DISABLED */}
        {children}
        <Toaster />
        {!isCheckoutOrAdmin && <HelpChatWidget />}
        {!isCheckoutOrAdmin && <Footer />}
      </div>

      {/* Loading screen overlay */}
      <AnimatePresence>
        {showLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ 
              y: "-100%", 
              transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
            }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#C3110C]"
          >
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="font-oi text-transparent text-center select-none leading-none tracking-normal flex flex-wrap justify-center gap-x-2 md:gap-x-4 px-4 text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[4.5rem] 2xl:text-[5.5rem]"
              style={{ WebkitTextStroke: "0.8px #F8F8FF" }}
            >
              AesthetX WAYS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              className="font-inter text-[#F8F8FF] text-[9px] sm:text-[10px] tracking-[0.25em] uppercase mt-3 sm:mt-4 text-center px-4 font-light select-none"
            >
              buying clothes is cheaper then therapy
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
    // </ConvexProvider> // Removed ConvexProvider wrapper
  );
} 