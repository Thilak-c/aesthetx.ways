"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function NotFound() {
  // Lock scrolling on body and mobile-frame when on the NotFound page
  useEffect(() => {
    const frame = document.getElementById('mobile-frame');
    if (frame) {
      frame.style.overflow = 'hidden';
      frame.style.height = '100%';
    }
    document.body.style.overflow = 'hidden';

    return () => {
      if (frame) {
        frame.style.overflow = '';
        frame.style.height = '';
      }
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="h-[calc(100vh-120px)] bg-white text-black flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">

      {/* Brand Header: Logo and Name */}
      <div className="flex items-center gap-2.5 mb-8 z-10 select-none">
        <img
          src="/logo_t.svg"
          alt="Aesthetx Ways Logo"
          className="w-8 h-8 mb-4 object-contain"
        />
        <h1 className="text-[20px] tracking-wider leading-none uppercase font-lovelo-black text-black">
          Aesthetx Ways
        </h1>
      </div>

      {/* Glitch 404 Visual Canvas Container wrapped in Home Link */}
      <Link
        href="#"
        className="relative w-full max-w-[900px] aspect-[1248/620] rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] z-10 block hover:opacity-95 transition-opacity"
        aria-label="Return to Homepage"
      >
        {/* Style Tag injection for custom glitch animations */}
        <style dangerouslySetInnerHTML={{
          __html: `
          .glitch-canvas {
            position: relative;
            background-image: url(https://imgur.com/eHVyWTM.jpg);
            background-size: cover;
            background-position: center;
            width: 100%;
            height: 100%;
            overflow: hidden;
            cursor: pointer;
          }

          .t404 {
            position: absolute;
            width: 29.16%;
            height: 23.54%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-image: url(https://imgur.com/KPZo9YX.png);
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            z-index: 10;
          }

          .obj {
            width: 16.34%;
            height: 33.7%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: animation-404 6s infinite ease-in-out;
            z-index: 5;
          }

          .obj img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          @keyframes animation-404 {
            0%, 100% {
              transform: translate(-50%, -50%) rotate(0);
            }
            50% {
              transform: translate(-53%, -42%) rotate(-5deg);
            }
          }

          .waves {
            position: absolute;
            width: 100%;
            height: 100%;
            background-image: url(https://imgur.com/eHVyWTM.jpg);
            background-size: cover;
            background-position: center;
            filter: url("#glitch");
            z-index: 1;
          }

          svg {
            position: absolute;
            width: 0;
            height: 0;
          }
        `}} />

        {/* Glitch Canvas Block */}
        <div className="glitch-canvas">
          <div className="waves"></div>
          <div className="obj">
            <img src="https://imgur.com/w0Yb4MX.png" alt="Floating object" />
          </div>
          <div className="t404"></div>

          {/* SVG Glitch Displacement Filter */}
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
            <defs>
              <filter id="glitch">
                <feTurbulence type="fractalNoise" baseFrequency="0.01 0.03" numOctaves="1" result="warp" id="turb" />
                <feColorMatrix in="warp" result="huedturb" type="hueRotate" values="90">
                  <animate attributeType="XML" attributeName="values" values="0;180;360" dur="3s" repeatCount="indefinite" />
                </feColorMatrix>
                <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="50" in="SourceGraphic" in2="huedturb" />
              </filter>
            </defs>
          </svg>
        </div>
      </Link>

      {/* Info Message */}
      <p className="text-[16px]  tracking-widest font- text-zinc-400 mt-20 z-10 select-none">
        This Page Doesn't Exist
      </p>

      {/* Back to Home Link */}
      <Link
        href="/"
        className="text-[9px] underline  tracking-[0.2em] text-zinc-400 hover:text-black transition-colors mt-8 pb-2 z-10 font-black"
      >
        Way To Home
      </Link>
    </div>
  );
}
