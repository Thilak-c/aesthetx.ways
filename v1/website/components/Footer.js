import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      // Reset subscription status visual state after a few seconds
      setTimeout(() => {
        setSubscribed(false);
      }, 5000);
    }
  };

  return (
    <footer className="w-full bg-zinc-950 text-zinc-400 pt-12 pb-28 px-6 mt-12 border-t border-zinc-900 rounded-b-[2px] relative overflow-hidden">
      {/* Background Watermark/Logo text */}
      <div className="absolute -bottom-6 -left-4 right-0 text-[5rem] tracking-[0.15em] uppercase font-moirai-thick text-zinc-900/40 select-none pointer-events-none whitespace-nowrap leading-none">
        AESTHETX
      </div>

      <div className="relative z-10 flex flex-col gap-8">
        {/* Brand Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <img src="/logo_t.svg" alt="Aesthetx Ways Logo" className="w-6 h-6 object-contain brightness-0 invert opacity-80" />
            <span className="font-lovelo-black text-sm tracking-widest text-white">AESTHETX WAYS</span>
          </div>
          <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-medium max-w-[280px] leading-relaxed">
            THE ART OF MINIMALISM IN STREETWEAR AND UTILITY.
          </p>
        </div>

        {/* Newsletter Signup */}
        <div className="flex flex-col gap-2 border-t border-zinc-900 pt-6">
          <span className="text-[8px] tracking-[0.25em] uppercase text-zinc-500 font-bold">Join the Syndicate</span>
          {subscribed ? (
            <div className="flex items-center gap-2 text-emerald-500 py-1.5 animate-scale-in">
              <Check className="w-3.5 h-3.5" />
              <span className="text-[9px] uppercase tracking-[0.15em] font-bold">You are in. Welcome.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 border-b border-zinc-800 focus-within:border-zinc-500 transition-colors py-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER EMAIL ADDRESS"
                className="flex-1 bg-transparent text-[9px] tracking-[0.15em] uppercase outline-none text-white placeholder-zinc-700 font-medium py-1"
              />
              <button 
                type="submit"
                className="text-[9px] tracking-widest uppercase font-bold text-zinc-400 hover:text-white transition-colors py-1 px-2 flex items-center justify-center shrink-0"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </form>
          )}
          <span className="text-[7.5px] text-zinc-600 tracking-wider">SUBSCRIBE TO GET EARLY ACCESS AND LAUNCH ALERTS.</span>
        </div>

        {/* Navigation Columns */}
        <div className="grid grid-cols-2 gap-8 border-t border-zinc-900 pt-6">
          <div className="flex flex-col gap-3">
            <span className="text-[8px] tracking-[0.25em] uppercase text-zinc-500 font-bold">Index</span>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-[9px] uppercase tracking-wider text-zinc-400 hover:text-white transition-colors w-fit">
                Shop Collection
              </Link>
              <Link href="/cart" className="text-[9px] uppercase tracking-wider text-zinc-400 hover:text-white transition-colors w-fit">
                Shopping Bag
              </Link>
              <Link href="/orders" className="text-[9px] uppercase tracking-wider text-zinc-400 hover:text-white transition-colors w-fit">
                Order History
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[8px] tracking-[0.25em] uppercase text-zinc-500 font-bold">Syndicate</span>
            <div className="flex flex-col gap-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[9px] uppercase tracking-wider text-zinc-400 hover:text-white transition-colors w-fit">
                Instagram
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[9px] uppercase tracking-wider text-zinc-400 hover:text-white transition-colors w-fit">
                Twitter / X
              </a>
              <a href="#" className="text-[9px] uppercase tracking-wider text-zinc-400 hover:text-white transition-colors w-fit">
                Terms & Privacy
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="flex flex-col gap-2 border-t border-zinc-900 pt-6 pb-2 text-[8px] uppercase tracking-widest text-zinc-600">
          <div className="flex justify-between items-center w-full">
            <span>© 2026 AESTHETX WAYS</span>
            <span>EST. IN INDIA</span>
          </div>
          <span className="text-[7.5px] tracking-normal normal-case font-mono text-zinc-700/80">
            designed for the forward path.
          </span>
        </div>
      </div>
    </footer>
  );
}
