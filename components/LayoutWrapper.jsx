"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import getConvexClient from "../convexClient"; // Removed import
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Toaster } from "react-hot-toast";
import HelpChatWidget from "./HelpChatWidget";

export default function LayoutWrapper({ children }) {
  const [token, setToken] = useState(null);
  // const { client, ConvexProvider } = getConvexClient(); // Removed destructuring

  // Fetch session token on client side
  useEffect(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
      setToken(match ? decodeURIComponent(match[1]) : null);
    }
  }, []);

  // Fetch user data using Convex query
  const user = useQuery(api.users.meByToken, token ? { token } : "skip");

  // Determine if still loading
  // isLoading is true only if a token exists AND user data is actively being fetched (user === undefined).
  // If token is null, it means no logged-in user, so isLoading is immediately false.
  const isLoading = token !== null && user === undefined;

  // If not loading and no user is found, directly render children without animation
  if (!isLoading && user === null) {
    return <>{children}</>;
  }

  return (
    // <ConvexProvider client={client}> // Removed ConvexProvider wrapper
      <>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-gray-900"
            >
              <motion.img
                src="/logo.png"
                alt="Loading Logo"
                className="w-32 h-32 mb-4 object-contain opacity-80"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
             
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full w-full"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
        <Toaster />
        <HelpChatWidget />
      </>
    // </ConvexProvider> // Removed ConvexProvider wrapper
  );
} 