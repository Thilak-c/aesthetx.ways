'use client';

import React, { useState, useEffect, forwardRef } from 'react';

const FallbackImage = forwardRef(function FallbackImage({ 
  src, 
  alt, 
  className = '', 
  style, 
  hideText = false, 
  logoSize = 'w-6 h-6',
  fallbackSrc = null,
  onError: externalOnError,
  ...props 
}, ref) {
  const [hasError, setHasError] = useState(!src);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(!src);
  }, [src]);

  const handleError = () => {
    setHasError(true);
    // Clear any broken cached image from localStorage
    if (typeof window !== 'undefined' && src) {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('aw_img_cache_') && localStorage.getItem(key) === src) {
          localStorage.removeItem(key);
          break;
        }
      }
    }
    if (externalOnError) externalOnError();
  };

  if (hasError) {
    if (fallbackSrc) {
      return (
        <img
          ref={ref}
          src={fallbackSrc}
          alt={alt}
          className={className}
          style={style}
          {...props}
        />
      );
    }
    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center gap-1 bg-zinc-50 select-none"
      >
        <img 
          src="/logo_t.svg" 
          alt="Image not available" 
          className={`${logoSize} object-contain opacity-20`}
          style={{ filter: 'grayscale(1)' }}
        />
        {!hideText && (
          <span className="text-[6.5px] tracking-wider uppercase font-semibold text-zinc-300 text-center leading-tight px-1">
            Image not available
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      key={src}
      {...props}
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
    />
  );
});

export default FallbackImage;
