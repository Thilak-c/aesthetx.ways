"use client"
/* eslint-disable jsx-a11y/media-has-caption */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  FaInstagram, FaYoutube, FaFacebook, FaTwitter,
  FaRocket, FaSun, FaMoon, FaLightbulb, FaPaperPlane,
} from 'react-icons/fa';
import Galaxy from './Galaxy/Galaxy';
import addSubscriber from '../utils/addSubscriber';
import useKonami from '../hooks/useKonami';

export default function Footer() {
  const { resolvedTheme, setTheme } = useTheme();
  const [status, setStatus] = useState('idle');        // idle | loading | success
  const [showScrl, setShowScrl] = useState(false);
  const [meteorArr] = useState(() =>
    Array.from({ length: 8 }).map(() => ({ left: Math.random() * 100, delay: Math.random() * 6 }))
  );

  /* ----------  NEW: quick-suggestion mini-form  ---------- */
  const [sugg, setSugg] = useState('');
  const [suggStatus, setSuggStatus] = useState('idle'); // idle | loading | ty
  async function sendSuggestion(e) {
    e.preventDefault();
    if (!sugg.trim()) return;
    setSuggStatus('loading');
    /* fire-and-forget endpoint (swap with your own) */
    await fetch('/api/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sugg }),
    }).catch(() => {});
    setSuggStatus('ty');
    setSugg('');
    setTimeout(() => setSuggStatus('idle'), 3000);
  }
  /* -------------------------------------------------------- */

  useKonami(() => {
    alert('Easter-egg unlocked! 15% off coupon: STAR15');
    navigator.clipboard.writeText('STAR15');
  });

  useEffect(() => {
    const t = () => setShowScrl(window.scrollY > 600);
    window.addEventListener('scroll', t, { passive: true });
    return () => window.removeEventListener('scroll', t);
  }, []);

  async function handleSub(e) {
    e.preventDefault();
    setStatus('loading');
    const res = await addSubscriber(e.target.email.value);
    setStatus(res.ok ? 'success' : 'idle');
  }

  const playPop = () => new Audio('/pop.mp3').play().catch(() => {});

  return (
    <>
    <div
  className="relative w-full py-6 px-4 flex justify-center bg-black/80 bg-cover bg-center"
  style={{ backgroundImage: "url('/logo.png')" }}
>
  {/* Optional dark overlay for better contrast */}
  <div className="absolute inset-0 bg-black/70"></div>

  <div className="relative w-full max-w-md z-10">
    <p className="text-xs text-white mb-3 text-center">
      Got an idea to make us better? We’re all ears (and grateful).
    </p>

    <form onSubmit={sendSuggestion} className="flex gap-2">
      <input
        value={sugg}
        onChange={(e) => setSugg(e.target.value)}
        maxLength={140}
        required
        placeholder="Suggest anything…"
        className="flex-1 px-4 py-2 border border-transparent roued-lg bg-white dark:bg-black/30 backdrop-blur text-sm placeholder-black/50 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 dark:focus:ring-white/40"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-black text-white border px-4 py-2 round-lg text-sm grid place-items-center"
        aria-label="Send suggestion"
      >
       { 
  suggStatus === "loading" 
    ? (
        <img 
          src="/favicon.png" 
          className="w-[15px] h-[15px] animate-spin-slow mx-auto" 
          alt="Loading" 
        />
      ) 
    : <FaPaperPlane /> 
}

      </motion.button>
    </form>

    {suggStatus === "ty" && (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-emerald-500 dark:text-emerald-400 mt-2 text-center"
      >
        Thanks for the sparkle — smile delivered!
      </motion.p>
    )}
  </div>
</div>

      <div className="h-[700px] w-full absolute z-40 bg-gradient-to-b from-white/60 via-white/10 to-transparent pointer-events-none" />

      <div className="absolute z-30 top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {meteorArr.map((m, i) => (
          <span key={i} className="meteor" style={{ left: `${m.left}%`, animationDelay: `${m.delay}s` }} />
        ))}
      </div>

      <div className="absolute z-50 w-full h-[700px] flex items-end">
        <footer className="w-full text-black dark:text-white relative">

          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col justify-between h-full">
            {/* top grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* logo + about */}

              <div className='fflex'>
                <div className='flex self-center'>

                <img src="/logo.png" alt="AesthetX" width={200} height={55} className="mb-4" />
               <img src="/fav.png" className="w-[45px] h-[45px] animate-spin-slow mx-auto " alt="" />
                </div>
                <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed max-w-xs">
                  Helping you grow your social presence with style, reach, and authenticity.
                </p>
              </div>

              {/* newsletter + socials */}
              <div className="md:col-span-1">
                <h3 className="font-semibold text-base mb-3">Subscribe</h3>
                <p className="text-xs text-black/70 dark:text-white/70 mb-3">Get the latest updates and offers.</p>

                <form onSubmit={handleSub} className="flex">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Your email"
                    className="flex-1 px-4 py-2 rounded-l-lg border border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/30 backdrop-blur text-sm placeholder-black/50 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/30"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-r-lg text-sm"
                  >
                    {status === 'loading' ? '…' : status === 'success' ? '✓' : 'Go'}
                  </motion.button>
                </form>

                <div className="flex items-center gap-4 mt-6">
                  <a
                    href="https://www.instagram.com/aesthetx.ways_/"
                    onMouseEnter={playPop}
                    className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* --------------  NEW: Plan & Smile -------------- */}
          
              {/* -------------------------------------------------- */}
            </div>

            {/* copyright */}
            <div className="border-t border-black/10 dark:border-white/10 mt-10 pt-5 text-center text-xs text-black/60 dark:text-white/60">
              © {new Date().getFullYear()} AesthetX WAYS — v{('0.1.0' || 'local').slice(0, 7)} — All Rights Reserved.
            </div>
          </div>
        </footer>
      </div>

      {/* scroll-to-top */}
      <AnimatePresence>
        {showScrl && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-6 w-10 h-10 rounded-full bg-white dark:bg-white/80 text-white dark:text-black grid place-items-center backdrop-blur shadow-lg z-50"
            aria-label="Back to top"
          >
            <FaRocket className="text-black w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
{/* iiii */}
      <div className="w-full h-[700px]">
        <Galaxy />
      </div>

      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
        .meteor {
          position: absolute;
          top: -20%;
          widt
          0% { transform: translateY(0) translateX(0); opacity: 1; }
          100% { transform: translateY(110vh) translateX(20vw); opacity: 0; }
        }
      `}</style>
    </>
  );
}