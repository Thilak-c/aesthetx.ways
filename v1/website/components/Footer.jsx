'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, Check } from 'lucide-react';

const Ferrofluid = dynamic(() => import('./Ferrofluid'), { ssr: false });

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailTrimmed = email.trim();
    if (!emailTrimmed) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailTrimmed }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        if (data.alreadySubscribed) {
          setMessage('ALREADY SUBSCRIBED. THANK YOU.');
        } else {
          setMessage('YOU ARE IN. WELCOME.');
        }
        setEmail('');
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      } else {
        setStatus('error');
        setMessage(data.message || 'FAILED. TRY AGAIN.');
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('CONNECTION ERROR. TRY AGAIN.');
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  return (
    <footer className="w-full bg-white text-zinc-400 pt-2 pb-28 px-6 mt-0 border-t border-zinc-100 rounded-b-[2px] relative overflow-hidden">
      {/* Ferrofluid Background */}
      <div
        className="absolute inset-0 w-full h-full z-0"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent), linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent), linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
      >
        <Ferrofluid
          colors={['#ffffff', '#c8c8c8c8', '#c8c8c8c8']}
          speed={0.3}
          scale={1.2}
          turbulence={0.8}
          fluidity={0.1}
          rimWidth={0.2}
          sharpness={3}
          shimmer={1}
          glow={1.5}
          flowDirection="down"
          opacity={0.6}
          mouseInteraction={false}
          mouseStrength={0.8}
          mouseRadius={0.3}
        />
      </div>

      {/* Background Watermark/Logo text */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center w-max z-10">
        <span className="text-[32px] tracking-[0.18em] uppercase font-lovelo-black text-zinc-950/[0.04] leading-none select-none pointer-events-none">
          AesthetXways
        </span>
        <img src="/logo_t.svg" alt="Aesthetx Ways" className="w-5 h-5 object-contain pointer-events-none mt-2.5 mb-1.5 opacity-25" />
      </div>

      {/* Background Watermark Logo - Centered horizontally */}
      {/* <div 
        className="absolute bottom-11 left-1/2 -translate-x-1/2 w-40 h-40 opacity-[0.10] select-none pointer-events-none"
      >
        <img src="/logo_t.svg" alt="" className="w-full h-full object-contain" />
      </div> */}

      <div className="relative z-10 flex flex-col gap-8">
        {/* Brand Section */}
        <div className="flex flex-col gap-2">
          <div className="flex  gap-2">
            <img src="/logo_t.svg" alt="Aesthetx Ways Logo" className="w-6 h-6 object-contain  opacity-100" />
            <span className="font-lovelo-black mt-[6px] text-sm tracking-widest text-black">AESTHETX WAYS</span>
          </div>
          <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-medium max-w-[280px] leading-relaxed">
            THE ART OF MINIMALISM IN STREETWEAR AND UTILITY.
          </p>
        </div>

        {/* Newsletter Signup */}
        <div className="flex flex-col gap-2 border-t border-zinc-100 pt-6">
          <span className="text-[8px] tracking-[0.25em] uppercase text-zinc-400 font-bold">Join the Syndicate</span>
          {status === 'success' ? (
            <div className="flex items-center gap-2 text-emerald-400 py-1.5 animate-scale-in">
              <Check className="w-3.5 h-3.5" />
              <span className="text-[9px] uppercase tracking-[0.15em] font-bold">{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 border-b border-zinc-200 focus-within:border-zinc-950 transition-colors py-1">
              <input
                type="email"
                required
                disabled={status === 'loading'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={status === 'loading' ? 'SUBSCRIBING...' : 'ENTER EMAIL ADDRESS'}
                className="flex-1 bg-transparent text-[9px] tracking-[0.15em] uppercase outline-none text-zinc-950 placeholder-zinc-400 font-medium py-1 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="text-[9px] tracking-widest uppercase font-bold text-zinc-400 hover:text-zinc-950 transition-colors py-1 px-2 flex items-center justify-center shrink-0 disabled:opacity-50"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </form>
          )}
          {status === 'error' ? (
            <span className="text-[7.5px] text-red-400 font-medium uppercase tracking-wider">{message}</span>
          ) : (
            status !== 'success' && (
              <span className="text-[7.5px] text-zinc-500 tracking-wider">SUBSCRIBE TO GET EARLY ACCESS AND LAUNCH ALERTS.</span>
            )
          )}
        </div>

        {/* Navigation Columns */}
        <div className="grid grid-cols-2 gap-8 border-t border-zinc-100 pt-6">
          <div className="flex flex-col gap-3">
            <span className="text-[8px] tracking-[0.25em] uppercase text-zinc-400 font-bold">Index</span>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-[9px] uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition-colors w-fit">
                Shop Collection
              </Link>
              <Link href="/stores" className="text-[9px] uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition-colors w-fit">
                Store Locator
              </Link>
              <Link href="/cart" className="text-[9px] uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition-colors w-fit">
                Shopping Bag
              </Link>
              <Link href="/orders" className="text-[9px] uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition-colors w-fit">
                Order History
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[8px] tracking-[0.25em] uppercase text-zinc-400 font-bold">Syndicate</span>
            <div className="flex flex-col gap-2">
              <a href="https://www.instagram.com/aesthetxways__" target="_blank" rel="noopener noreferrer" className="text-[9px] uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition-colors w-fit">
                Instagram
              </a>
             
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="flex flex-col gap-2  pt-6 pb-2 text-[8px] uppercase tracking-widest text-zinc-500">
          <div className="flex justify-between items-center w-full">
            <span>© 2026 AESTHETX WAYS</span>
            <span>EST. IN INDIA</span>
          </div>
          <span className="text-[7.5px] tracking-normal normal-case font-mono text-zinc-600">
            designed for the forward path.
          </span>
        </div>
      </div>
    </footer>
  );
}
