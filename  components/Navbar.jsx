"use client";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const navLinks = ["MEN", "WOMEN", "SNEAKERS"];
  const [hovered, setHovered] = useState(null);
  const [active, setActive] = useState("MEN"); // Set this as needed

  return (
    <>
      {/* Main Navbar */}
      <nav className="relative w-full flex items-center justify-between px-6 py-2 border-b">
        {/* Left: Hamburger + Nav Links */}
        <div className="flex items-center gap-6">
          {/* Hamburger */}
          <button className="p-2">
            <Image src="/icons/hamburger.png" alt="Menu" width={24} height={24} />
          </button>
          {/* Nav Links */}
          <div className="flex items-center gap-6 font-semibold text-gray-900">
            {navLinks.map(link => (
              <div
                key={link}
                className="flex flex-col items-center cursor-pointer group"
                onMouseEnter={() => setHovered(link)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="tracking-wide transition-colors group-hover:text-gray-900">
                  {link}
                </span>
                <span
                  className={`
                    h-1 mt-1 rounded transition-all duration-300
                    ${hovered === link || (!hovered && active === link) ? "w-8 bg-gray-800" : "w-0 bg-transparent"}
                  `}
                ></span>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Image
            src="/logo.png" // Place your logo in public/logo.png
            alt="The Souled Store"
            width={200}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Right: Search + Icons */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="flex items-center border rounded-full px-3 py-1 w-72 bg-white">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="outline-none flex-1 bg-transparent text-sm"
            />
            {/* Mic Icon */}
        
            {/* Search Icon */}
            <button className="ml-2">
              <Image src="/icons/search.png" alt="Search" width={24} height={24} />
            </button>
          </div>
          {/* Icons */}
          <button className="hover:bg-gray-100 rounded-full p-2 transition-colors">
            {/* Location Icon */}
            <Image src="/icons/track.png" alt="Search" width={24} height={24} />
          </button>
          <button className="hover:bg-gray-100 rounded-full p-2 transition-colors">
            {/* User Icon */}
            <Image src="/icons/user.png" alt="Search" width={24} height={24} />
          </button>
          <button className="hover:bg-gray-100 rounded-full p-2 transition-colors">
            {/* Heart Icon */}
            <Image src="/icons/wishlist.png" alt="Wishlist" width={24} height={24} />
          </button>
          <button className="hover:bg-gray-100 rounded-full p-2 transition-colors">
            {/* Cart Icon */}
            <Image src="/icons/cart.png" alt="Cart" width={24} height={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Nav Links Bar */}
      <div className="flex md:hidden items-center justify-between border-b">
        {navLinks.map((link, idx) => (
          <div key={link} className="flex-1 flex flex-col items-center">
            <button
              className={`w-full py-2 font-semibold text-sm ${
                active === link ? "text-black font-bold" : "text-gray-700"
              }`}
              onClick={() => setActive(link)}
            >
              {link}
            </button>
            {/* Underline for active link */}
            <span
              className={`h-1 w-full transition-all duration-300 ${
                active === link ? "bg-teal-800" : "bg-transparent"
              }`}
            ></span>
            {/* Vertical divider except after last link */}
            {idx < navLinks.length - 1 && (
              <span className="absolute right-0 top-2 h-6 w-px bg-gray-300"></span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export function NavbarMobile() {
  const navLinks = ["MEN", "WOMEN", "SNEAKERS"];
  const [active, setActive] = useState("MEN"); // or manage this in parent

  return (
    <>
      {/* Main Mobile Navbar */}
      <nav className="relative w-full flex items-center justify-between px-2 py-2 border-b bg-white md:hidden">
        {/* Hamburger */}
        <button className="p-2 z-10">
          <Image src="/icons/hamburger.png" alt="Menu" width={24} height={24} />
        </button>

        {/* Logo (absolutely centered) */}
     

        {/* Icons */}
        <div className="flex items-center gap- z-10">
          <button className="p-1">
            <Image src="/icons/search.png" alt="Search" width={24} height={24} />
          </button>
          <button className="p-1">
            <Image src="/icons/wishlist.png" alt="Wishlist" width={24} height={24} />
          </button>
          <button className="p-1">
            <Image src="/icons/cart.png" alt="Cart" width={24} height={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Nav Links Bar */}
      <div className="flex md:hidden items-center justify-between border-b relative">
        {navLinks.map((link, idx) => (
          <div key={link} className="flex-1 flex flex-col items-center relative">
            <button
              className={`w-full py-2 font-semibold text-sm ${
                active === link ? "text-black font-bold" : "text-gray-700"
              }`}
              onClick={() => setActive(link)}
            >
              {link}
            </button>
            {/* Underline for active link */}
            <span
              className={`h-1 w-full transition-all duration-300 ${
                active === link ? "bg-teal-800" : "bg-transparent"
              }`}
            ></span>
            {/* Vertical divider except after last link */}
            {idx < navLinks.length - 1 && (
              <span className="absolute right-0 top-2 h-6 w-px bg-gray-300"></span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}