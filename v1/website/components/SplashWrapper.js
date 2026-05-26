'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Odometer Number Component with faded top/bottom overlays to blend the digits
function OdometerNumber({ value, className = "" }) {
  const digits = value.toString().split('');

  return (
    <div className={`inline-flex relative h-5 overflow-hidden px-1 rounded-[3px] bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)] ${className}`}>
      {/* Subtle fade overlays at the top and bottom of the digit scroll to blend them into the page */}
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-linear-to-b from-white to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-linear-to-t from-white to-transparent pointer-events-none z-10" />
      
      {digits.map((digit, idx) => (
        <div key={idx} className="relative h-5 w-2.5 overflow-hidden select-none">
          <div
            className="flex flex-col transition-transform duration-500 ease-out"
            style={{
              transform: `translateY(-${parseInt(digit) * 20}px)`
            }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <span key={num} className="h-5 leading-5 text-center block text-[10px] font-bold text-zinc-800">
                {num}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SplashWrapper({ children }) {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min(100, (elapsed / 2600) * 100);
      setProgress(nextProgress);
      
      if (elapsed >= 2600) {
        setFadeOut(true);
      }
      
      if (elapsed >= 3000) {
        clearInterval(interval);
        setShowSplash(false);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

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
              <OdometerNumber value={Math.round(progress)} />
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
