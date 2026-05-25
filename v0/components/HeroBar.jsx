"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function HeroBar() {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Motion values for background parallax typography and subtle image shift
  const bgX = useMotionValue(0);
  const bgY = useMotionValue(0);

  // Configure high-performance springs
  const springConfig = { damping: 30, stiffness: 120, mass: 0.8 };
  const textX = useSpring(bgX, springConfig);
  const textY = useSpring(bgY, springConfig);

  // Detect mobile device
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Handle cursor tracking inside hero container for parallax depth
  const handleMouseMove = (e) => {
    if (isMobile || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Center is (0, 0), normalized range is [-0.5, 0.5]
    const x = (e.clientX - rect.left - width / 2) / width;
    const y = (e.clientY - rect.top - height / 2) / height;

    // Apply translation for background parallax text (displacement up to 25px)
    bgX.set(-x * 50);
    bgY.set(-y * 50);
  };

  // Reset positions when mouse leaves
  const handleMouseLeave = () => {
    setIsHovered(false);
    bgX.set(0);
    bgY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-dvh overflow-hidden bg-neutral-950 flex items-center justify-center select-none"
    >
      {/* Background Image Canvas with strictly contained overflow */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none flex items-center justify-center">
        {/* Background Image Layer: Default Raw Photo */}
        <motion.img
          src="/home/hero/d_s_raw.png"
          alt="Default view"
          className="absolute left-1/2 -translate-x-1/2 h-full w-auto object-contain object-center pointer-events-none select-none"
          initial={{ scale: 1.02 }}
          animate={{
            scale: isHovered ? 1.05 : 1.02,
            opacity: isHovered ? 0 : 1,
          }}
          transition={{
            scale: { duration: 0.8, ease: "easeOut" },
            opacity: { duration: 0.6, ease: "easeInOut" }
          }}
        />

        {/* Background Image Layer: Hover Red Photo */}
        <motion.img
          src="/home/hero/d_s_red.png"
          alt="Hovered view"
          className="absolute left-1/2 -translate-x-1/2 h-full w-auto object-contain object-center pointer-events-none select-none"
          initial={{ scale: 1.02, opacity: 0 }}
          animate={{
            scale: isHovered ? 1.05 : 1.02,
            opacity: isHovered ? 1 : 0,
          }}
          transition={{
            scale: { duration: 0.8, ease: "easeOut" },
            opacity: { duration: 0.6, ease: "easeInOut" }
          }}
        />
      </div>

      {/* Dark Ambient Vignette Overlay for High-End Cinematic Contrast */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-all duration-1000 bg-black/45"
      />

      {/* Glowing Red Vignette Accent (activates on hover) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-out z-10 pointer-events-none filter blur-sm ${isHovered ? "opacity-25 bg-linear-to-t from-[#C3110C] via-transparent to-transparent" : "opacity-0"
          }`}
      />






      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 cursor-pointer pointer-events-none"
      >
        <span className="text-[9px] tracking-[0.3em] font-medium text-white/50 uppercase">
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown size={14} className="text-white/60" />
        </motion.div>
      </motion.div>
    </div>
  );
}
