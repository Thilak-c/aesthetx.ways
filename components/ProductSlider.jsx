import { useState, useEffect } from "react";
import Image from "next/image";

const slides = [
  {
    img: "/poster-img-hero-home/6d77f1ef7a8e26964e0fd22f055b660a.jpg",
    title: "BEN 10 ALIEN FORCE",
    subtitle: "FIRST TIME EVER IN INDIA",
    cta: "TAP TO UNLOCK",
    description: "THE ULTIMATE ALIEN FORCE TEE",
    limited: "LIMITED EDITION DROP",
    pieces: 600,
  },
  {
    img: "/poster-img-hero-home/39dc8c77f0460ea45ad55ef3293e0858.jpg",
    title: "ALIEN FORCE DROP",
    subtitle: "COLLECTOR'S ITEM",
    cta: "SHOP NOW",
    description: "EXCLUSIVE MERCH RELEASE",
    limited: "ONLY THIS WEEK",
    pieces: 400,
  },
  {
    img: "/poster-img-hero-home/546dc46eb0510b4adb65bbcedd64dd21.jpg",
    title: "LIMITED TEE",
    subtitle: "DON'T MISS OUT",
    cta: "BUY NOW",
    description: "PREMIUM QUALITY",
    limited: "LIMITED STOCK",
    pieces: 300,
  },
  {
    img: "/poster-img-hero-home/cb9baa797e7b724f079f4c10ea5b8e19.jpg",
    title: "EXCLUSIVE DROP",
    subtitle: "NEW ARRIVAL",
    cta: "EXPLORE",
    description: "FRESH DESIGNS",
    limited: "JUST LAUNCHED",
    pieces: 200,
  },
];

export default function ProductSlider() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  // Automatic slide change every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [current]);

  // Fade effect handler
  const triggerFade = (nextIdx) => {
    setFade(false);
    setTimeout(() => {
      setCurrent(nextIdx);
      setFade(true);
    }, 300); // 300ms fade duration
  };

  const handlePrev = () => {
    const prevIdx = current === 0 ? slides.length - 1 : current - 1;
    triggerFade(prevIdx);
  };
  const handleNext = () => {
    const nextIdx = current === slides.length - 1 ? 0 : current + 1;
    triggerFade(nextIdx);
  };
  const handleDot = (idx) => {
    if (idx !== current) triggerFade(idx);
  };

  return (
    <div className="relative w-full max-w-[1600px] mx-auto h-[70vh] overflow-hidden shadow-xl bg-black ">
      {/* Slide */}
      <div className="w-full h-full relative">
        <div className={`absolute inset-0 transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
          <Image
            src={slides[current].img}
            alt={slides[current].title}
            fill
            className="object-cover object-center opacity-90"
            priority
          />
        </div>
        {/* Overlay */}
      
        {/* Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2  hover:bg-lime-500 hover:text-black text-white rounded-full p-3 z-20 transition"
          aria-label="Previous Slide"
        >
          <svg width="25" height="25" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2  hover:bg-lime-500 hover:text-black text-white rounded-full p-3 z-20 transition"
          aria-label="Next Slide"
        >
          <svg width="25" height="25" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </button>
        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDot(idx)}
              className={`w-1 h-1 rounded-full  border-white transition ${current === idx ? "bg-lime-400 border-lime-400" : "bg-white/40"}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 