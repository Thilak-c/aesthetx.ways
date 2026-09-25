'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { usePathname } from 'next/navigation';

// Odometer Number Component with fluid, scalable dimensions that adapt to any font size
export function OdometerNumber({ value, className = "" }) {
  const digits = value.toString().split('');

  return (
    <span className={`inline-flex items-center relative h-[1.25em] leading-[1.25em] overflow-hidden select-none bg-transparent align-middle ${className}`}>
      {digits.map((digit, idx) => {
        const isDigit = !isNaN(parseInt(digit)) && digit !== ' ';
        if (!isDigit) {
          return (
            <span key={idx} className="h-[1.25em] leading-[1.25em] text-center inline-flex items-center justify-center select-none">
              {digit}
            </span>
          );
        }
        return (
          <span key={idx} className="relative h-[1.25em] w-[1.1ch] overflow-hidden inline-block shrink-0">
            <span
              className="flex flex-col transition-transform duration-500 ease-out will-change-transform"
              style={{
                transform: `translateY(-${parseInt(digit) * 10}%)`
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <span key={num} className="h-[1.25em] leading-[1.25em] text-center block select-none">
                  {num}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function SplashWrapper({ children }) {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  const pathname = usePathname();
  const isCartOrProduct = pathname ? (pathname.includes('/cart') || pathname.includes('/product')) : false;

  const totalDuration = isCartOrProduct ? 1500 : 3000;
  const fadeOutTime = isCartOrProduct ? 1100 : 2600;

  useEffect(() => {
    setMounted(true);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min(100, (elapsed / fadeOutTime) * 100);
      setProgress(nextProgress);
      
      if (elapsed >= fadeOutTime) {
        setFadeOut(true);
      }
      
      if (elapsed >= totalDuration) {
        clearInterval(interval);
        setShowSplash(false);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [totalDuration, fadeOutTime]);

  return (
    <>
      {showSplash && (
        <div 
          className={`fixed inset-0 z-100 max-w-[450px] mx-auto overflow-hidden ${
            fadeOut ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
        >
          {/* Left Curtain Panel */}
          <div 
            className={`absolute left-0 top-0 bottom-0 w-1/2 bg-white transition-transform duration-700 ease-in-out ${
              fadeOut ? '-translate-x-full' : 'translate-x-0'
            }`}
          />
          
          {/* Right Curtain Panel */}
          <div 
            className={`absolute right-0 top-0 bottom-0 w-1/2 bg-white transition-transform duration-700 ease-in-out ${
              fadeOut ? 'translate-x-full' : 'translate-x-0'
            }`}
          />

          {/* Center Content */}
          <div 
            className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
              fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              {/* Logo & Text Row */}
              <div className="flex items-center gap-3">
                {/* Logo Image */}
                <img 
                  src="/logo_t.svg" 
                  alt="Aesthetx Ways Logo" 
                  className="w-15 h-15 object-contain"
                />
              </div>
              
              {/* Minimalist Progress Track */}
              <div className="w-24 h-px bg-zinc-100 relative overflow-hidden">
                {/* Animated Progress Bar */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-black transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {/* Micro-text */}
              <span className="text-[7px] tracking-widest uppercase text-zinc-400 mt-2 font-medium">
                Loading refinement...
              </span>
            </div>

            {/* Odometer counter at the bottom-right corner */}
            <div className="absolute bottom-6 right-6 flex items-center gap-1">
              <OdometerNumber 
                value={Math.round(progress)} 
                className="bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)] text-[10px] text-zinc-800 rounded-[3px] px-1"
              />
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
