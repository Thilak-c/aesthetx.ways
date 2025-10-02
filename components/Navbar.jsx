"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import SidebarDrawer from "./SidebarDrawer";
import UserNavigation from "@/components/UserNavigation";
import SearchDropdown from "./SearchDropdown";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeftIcon, ShoppingBag , Heart, Search, Menu } from "lucide-react";

import { useSearchParams, useRouter } from "next/navigation";
// ---------- Desktop Navbar (unchanged / same as before) ----------
export default function Navbar() {
  const navLinks = ["MEN", "WOMEN", "SNEAKERS"];
  const [hovered, setHovered] = useState(null);
    const searchParams = useSearchParams();
  const router = useRouter();
  // const [active, setActive] = useState("MEN");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const param = searchParams.get("ct")?.toLowerCase();
  const active = navLinks.indexOf(param) >= null ? navLinks.indexOf(param) : null;
  // Search state (desktop)
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const match =
      typeof document !== "undefined" &&
      document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
    setToken(match ? decodeURIComponent(match[1]) : null);
  }, []);

  const me = useQuery(api.users.meByToken, token ? { token } : "skip");
  useEffect(() => setIsLoggedIn(!!me), [me]);

  const cartSummary = useQuery(
    api.cart.getCartSummary,
    me ? { userId: me._id } : "skip"
  );
  const wishlistSummary = useQuery(
    api.wishlist.getWishlistSummary,
    me ? { userId: me._id } : "skip"
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchDropdownOpen(value.trim().length >= 2);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  return (
    <>
      <SidebarDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        width={"w-1/3"}
      />

      <nav className="z-50 fixed top-1 w-[99%] left-2 rounded-3xl flex items-center justify-between px-6 py-2 border border-white/20 bg-white/10 backdrop-blur-md shadow-lg hidden md:flex">
        {/* Left */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-4 hover:bg-white/10 rounded-xl transition"
          >
            <Menu/>
          </button>

          <div className="flex items-center gap-6 font-semibold">
            {[{lib:"Men",link:"men"}, {lib:"Women",link:"women"}, {lib:"Sneakers",link:"sneakers"}].map((link) => (
              <div
                key={link.lib}
                className="flex flex-col p-3 font-bold items-center cursor-pointer group rounded-full w-[100px]  transition-all delay-200 hover:border-t-2 hover:border-r-2 border-black/5   hover:shadow-[10px_-10px_15px_rgba(0,0,0,0.15)] px-2"
                onMouseEnter={() => setHovered(link)}
                onMouseLeave={() => setHovered(null)}
                  onClick={() => {
              const params = ("ct", link.link)
              // params.set("ct", navKeys[idx]);
              router.replace(
                `/shop?ct=${params.toString()}`
              );
            }}
              >
                <span className="tracking-wide text-black group-hover:text-black/70">
                  {link.lib}
                </span>
                
              </div>
            ))}
          </div>
        </div>

        {/* Center logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <img
            src="/logo.png"
            alt="aesthetx.ways"
            width={200}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="relative" ref={searchRef}>
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center border border-white/20 rounded-full px-3 py-1 w-72 bg-white/10 backdrop-blur-sm"
            >
              <input
                type="text"
                placeholder="What are you looking for?"
                className="outline-none flex-1 bg-transparent text-sm placeholder-black/60 text-black"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button
                type="submit"
                className="absolute ml-2 right-2 hover:opacity-70 transition-opacity"
              >
                <Search
                />
              </button>
            </form>
            <SearchDropdown
              searchTerm={searchTerm}
              isOpen={searchDropdownOpen}
              onClose={() => setSearchDropdownOpen(false)}
            />
          </div>

          <UserNavigation />

          <Link href="/wishlist">
            <button className="relative hover:bg-white/10 rounded-full p-2  ">
            <Heart/>
              {wishlistSummary?.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {wishlistSummary.itemCount > 99
                    ? "99+"
                    : wishlistSummary.itemCount}
                </span>
              )}
            </button>
          </Link>

          <Link href="/cart">
            <button className="relative hover:bg-white/10 rounded-full p-2 transition-colors">
             <ShoppingBag/>
              {me && cartSummary?.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartSummary.totalItems > 99 ? "99+" : cartSummary.totalItems}
                </span>
              )}
            </button>
          </Link>
        </div>
      </nav>

      {/* Mobile component included below */}
      <NavbarMobile />
    </>
  );
}

export function NavbarMobile() {
  const navLinks = ["MEN", "WOMEN", "SNEAKERS"];
  const navKeys = ["men", "women", "sneakers"];
  const barRef = useRef(null);
  const [tabWidth, setTabWidth] = useState();

  const searchParams = useSearchParams();
  const router = useRouter();

  const param = searchParams.get("ct")?.toLowerCase();
  const activeIdx = navKeys.indexOf(param) >= null ? navKeys.indexOf(param) : null;

  // const [activeIdx, setActiveIdx] = useState(defaultIdx);
  // Update URL when active tab changes
  // useEffect(() => {
  //   const params = new URLSearchParams(searchParams.toString());
  //   params.set("ct", navKeys[activeIdx]);
  //   router.replace(`${window.location.pathname}?${params.toString()}`);
  // }, [activeIdx, router, searchParams]);

  // Bottom tab sizing
  useEffect(() => {
    const calc = () => {
      if (barRef.current)
        setTabWidth(barRef.current.offsetWidth / navLinks.length);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [navLinks.length]);

  // Your other states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const inputRef = useRef(null);

  // token & user
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const match =
      typeof document !== "undefined" &&
      document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
    setToken(match ? decodeURIComponent(match[1]) : null);
  }, []);

  const me = useQuery(api.users.meByToken, token ? { token } : "skip");
  useEffect(() => setIsLoggedIn(!!me), [me]);

  // Search handlers
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchDropdownOpen(value.trim().length >= 2);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
  };

  // Lock scroll on search overlay
  useEffect(() => {
    if (showSearch) {
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => {
        inputRef.current?.focus();
        if (searchTerm.trim().length >= 2) setSearchDropdownOpen(true);
      }, 60);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
    return () => {
      document.body.style.overflow = "";
      setSearchDropdownOpen(false);
    };
  }, [showSearch]);

  // Adjust search dropdown as typing
  useEffect(() => {
    setSearchDropdownOpen(searchTerm.trim().length >= 2);
  }, [searchTerm]);

  return (
    <>
      {/* top mobile navbar */}
      <nav className="fixed top-1 left-[2px] z-[50] w-[99%] flex items-center justify-between pl-4 pr- py-1 shadow-lg border border-white/20 bg-white/10 backdrop-blur-md rounded-3xl md:hidden">
        <button
          aria-label="Open Menu"
          className="p-2 z-10 rounded-full hover:bg-white/10 transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu />
        </button>

        {/* search icon */}
        <div className="flex-1 flex relative justify-center">
          {!showSearch && (
            <button
              aria-label="Open Search"
              className="p-2 absolute top-1/2 -translate-y-1/2 right-0 rounded-full hover:bg-white/10 transition-colors"
              onClick={() => setShowSearch(true)}
            >
             <Search/>
            </button>
          )}
        </div>

        <div className="flex items-center gap-0 z-10">
          <Link href="/cart">
            <button
              aria-label="Cart"
              className="relative p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <ShoppingBag/>
            </button>
          </Link>
          <UserNavigation />
        </div>
      </nav>

      <SidebarDrawer open={sidebarOpen} onClose={() => setSidebarOpen(false)} width={"w-[85%]"} />

      {/* bottom tab bar */}
      <div
        ref={barRef}
        className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2 w-[92%] flex md:hidden items-center justify-between border border-black/5 rounded-full bg-gradient-to-tr from-white/80 to-white/60 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] px-2"
        style={{ height: 60 }}
      >
        {navLinks.map((link, idx) => (
          <button
            key={link}
            className={`flex-1 py-2 text-sm relative rounded-full ${
              activeIdx === idx
                ? "text-black font-bold bg-white shadow-md scale-105"
                : "text-black/70 hover:bg-black/5 hover:scale-[1.02]"
            }`}
            onClick={() => {
              const params = ("ct", navKeys[idx])
              // params.set("ct", navKeys[idx]);
              router.replace(
                `/shop?ct=${params.toString()}`
              );
            }}
          >
            {link}
          </button>
        ))}

        {/* {activeIdx !== null && (
          <span
            className="absolute bottom-1 rounded-full bg-black/30 transition-all duration-300"
            style={{
              width: `${tabWidth * 0.6}px`,
              left: `${activeIdx * tabWidth + tabWidth * 0.2}px`,
              height: "3px",
            }}
          />
        )} */}
      </div>
    </>
  );
}
