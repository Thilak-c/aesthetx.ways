"use client"
/* eslint-disable jsx-a11y/media-has-caption */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  FaInstagram, FaYoutube, FaFacebook, FaTwitter,
  FaRocket, FaSun, FaMoon, FaLightbulb, FaPaperPlane,
} from 'react-icons/fa';

// import Galaxy from './Galaxy/Galaxy';


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
    }).catch(() => { });
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

  const playPop = () => new Audio('/pop.mp3').play().catch(() => { });

  return (
    <>
      <div
        className="relative w-full py-6 px-4 flex justify-center bg-black/80 bg-cover bg-center"
      // style={{ backgroundImage: "url('/logo.png')" }}
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
                      className="w-[13px] h-[13px] animate-spin-slow mx-auto"
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

      </div>

      <div className="absolute z-50 w-full h-[700px] flex items-end">
        <footer className="w-full text-black dark:text-white relative">

          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col justify-between h-full">
            {/* top grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* logo + about */}

              <div className='gflex'>
                <div className='flex items-center self-center mb-4'>
                  <img src="/logo.png" className="h-8 mr-2" alt="AesthetX Ways" />
                  <img src="/fav.png" className="w-[30px] h-[30px] self-center mb-[9px] animate-spin-slow mxb-3 " alt="" />
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
            <div className="border-t border-black/10 dark:border-white/10 mt-10 pt-8 text-center">
              <p className="text-xs text-black/60 dark:text-white/60 mb-4">
                © {new Date().getFullYear()} AesthetX WAYS — v{('0.1.0' || 'local').slice(0, 7)} — All Rights Reserved.
              </p>
              <p className="text-xs text-black/60 dark:text-white/60 flex items-center justify-center gap-1.5">
                Made with{" "}
                <span className="inline-block animate-pulse">
                  <svg
                    className="w-3.5 h-3.5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </span>
                {" "}by{" "}
                <a
                  href="https://wa.me/918008439762"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Thilak</span>
                  <svg
                    className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* scroll-to-top */}
      {/* <AnimatePresence>
        {showScrl && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-7 right-6 w-10 h-10 rounded-full bg-white dark:bg-white/80 text-white dark:text-black grid place-items-center backdrop-blur shadow-lg z-50"
            aria-label="Back to top"
          >
            <FaRocket className="text-black w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence> */}
      {/* iiii */}

      <div className="w-full h-[700px]">
        {/* <Galaxy /> */}
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