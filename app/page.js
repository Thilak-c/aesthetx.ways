"use client"
import Navbar, { NavbarMobile } from "@/ components/Navbar";
import { useState } from "react";
import Image from "next/image";

const navTabs = ["MEN", "WOMEN", "SNEAKERS"];
const categories = [
  "Topwear",
  "Bottomwear",
  "Official Merch",
  "Bestsellers",
  "All Accessories",
  "Juniors",
  "Markdowns",
];

const accessories = [
  { name: "Backpacks", img: "/path/to/backpack.jpg" },
  { name: "Perfumes", img: "/path/to/perfume.jpg" },
  { name: "Socks", img: "/path/to/socks.jpg" },
  { name: "Rugs", img: "/path/to/rugs.jpg" },
];

const menCards = [
  { name: "New Arrivals", img: "/sidebar-img/Daredevil-No-Fear.jpg" },
  { name: "Korean Edit", img: "/sidebar-img/Korean-Pants-Mocha.jpg" },
  { name: "Cotton Linen", img: "/sidebar-img/Cotton-Linen-Soft-Pink.jpg" },
  { name: "Hot Merch", img: "/sidebar-img/logo.png" },
];

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="md:hidden"><NavbarMobile /></div>
      <div className="hidden md:block"><Navbar /></div>
      {/* ...rest of your page... */}
      <SidebarDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function SidebarDrawer({ open, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (cat) => {
    setOpenSections((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-4/5 max-w-xs z-50 transition-transform duration-300 overflow-y-auto rounded-r-3xl border-r border-gray-200 shadow-2xl ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center justify-center p-6 border-b border-gray-200 bg-white/80 rounded-tr-3xl shadow-md sticky top-0 z-20">
          <Image src="/logo.png" alt="Logo" width={120} height={40} className="drop-shadow-lg" />
          <div className="mt-3 flex items-center gap-2">
            <span className="px-4 py-1 rounded-full bg-gradient-to-r from-teal-100 to-blue-100 text-teal-800 font-semibold text-xs shadow">
              India <span className="ml-1">▼</span>
            </span>
            <button
              onClick={onClose}
              className="ml-2 text-gray-400 hover:text-teal-600 text-xl font-bold transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-200 shadow"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6 pb-3">
          <button className="w-full bg-gradient-to-r from-teal-400 to-blue-400 border-0 rounded-2xl py-2 font-semibold text-white shadow-xl hover:scale-105 transition-transform duration-200 mb-3">
            Log In/Register
          </button>
          <div className="relative">
            <div className="absolute inset-0 blur-lg rounded-xl bg-gradient-to-r from-teal-300/40 to-blue-300/40 opacity-60 animate-pulse" />
            <div className="relative bg-gradient-to-r from-teal-100 to-blue-100 text-teal-900 text-center rounded-xl py-2 text-xs font-medium shadow-lg">
              Earn 10% Cashback on Every App Order
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white/80 px-4 pb-1 relative">
          {navTabs.map((tab, idx) => (
            <button
              key={tab}
              className={`flex-1 py-2 font-bold text-base relative transition-colors duration-200 ${
                activeTab === idx
                  ? "text-teal-700 bg-white/80 rounded-full shadow"
                  : "text-gray-400 hover:text-teal-600"
              }`}
              onClick={() => setActiveTab(idx)}
              style={{ zIndex: 2 }}
            >
              {tab}
            </button>
          ))}
          {/* Animated pill underline */}
          <span
            className="absolute left-0 bottom-0 h-2 transition-all duration-300"
            style={{
              width: `calc(33.333% - 0.5rem)`,
              transform: `translateX(calc(${activeTab} * 100% + ${activeTab} * 0.5rem))`,
              background:
                "linear-gradient(90deg, rgba(20,184,166,1) 0%, rgba(59,130,246,1) 100%)",
              borderRadius: "9999px",
              boxShadow: "0 2px 8px 0 rgba(20,184,166,0.15)",
              zIndex: 1,
            }}
          />
        </div>

        {/* Horizontal Cards (example for MEN) */}
        {activeTab === 0 && (
          <div className="flex overflow-x-auto gap-6 p-6 pb-3">
            {menCards.map((card) => (
              <div
                key={card.name}
                className="flex-shrink-0 w-28 bg-white/80 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-200 cursor-pointer group border border-transparent hover:border-teal-200"
                style={{
                  backdropFilter: "blur(6px)",
                  background: "rgba(255,255,255,0.85)",
                }}
              >
                <Image
                  src={card.img}
                  alt={card.name}
                  width={112}
                  height={112}
                  className="rounded-t-2xl object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="text-xs text-center font-semibold mt-2 pb-3 text-gray-800 group-hover:text-teal-700 transition-colors duration-200">
                  {card.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Accordions */}
        <div className="divide-y divide-gray-200 px-4 pb-8">
          {categories.map((cat) => (
            <div
              key={cat}
              className={`my-3 bg-white/80 rounded-2xl shadow-md transition-all duration-200 ${
                openSections[cat] ? "border-l-4 border-teal-400" : ""
              }`}
            >
              <button
                className="w-full flex justify-between items-center py-4 px-4 font-bold text-gray-700 hover:text-teal-700 transition-colors rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-200"
                onClick={() => toggleSection(cat)}
              >
                {cat}
                <span
                  className={`text-xs transition-transform duration-300 ${
                    openSections[cat] ? "rotate-180 text-teal-500" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
              {/* Example: Show accessories cards for All Accessories */}
              {cat === "All Accessories" && openSections[cat] && (
                <div className="flex overflow-x-auto gap-6 pb-4 px-1">
                  {accessories.map((item) => (
                    <div
                      key={item.name}
                      className="flex-shrink-0 w-28 bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 cursor-pointer group border border-transparent hover:border-teal-200"
                      style={{
                        backdropFilter: "blur(6px)",
                        background: "rgba(255,255,255,0.85)",
                      }}
                    >
                      <Image
                        src={item.img}
                        alt={item.name}
                        width={112}
                        height={112}
                        className="rounded-t-2xl object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="text-xs text-center font-semibold mt-2 pb-3 text-gray-800 group-hover:text-teal-700 transition-colors duration-200">
                        {item.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* For other categories, you can add content here */}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}