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
// import { ArrowLeftIcon } from "lucide-react";

// ---------- Desktop Navbar (unchanged / same as before) ----------
export default function Navbar() {
  const navLinks = ["MEN", "WOMEN", "SNEAKERS"];
  const [hovered, setHovered] = useState(null);
  const [active, setActive] = useState("MEN");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
            <Image
              src="/icons/hamburger.png"
              alt="Menu"
              width={24}
              height={24}
            />
          </button>

          <div className="flex items-center gap-6 font-semibold">
            {["MEN", "WOMEN", "SNEAKERS"].map((link) => (
              <div
                key={link}
                className="flex flex-col p-3 font-bold items-center cursor-pointer group rounded-lg transition-colors hover:bg-black/10"
                onMouseEnter={() => setHovered(link)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="tracking-wide text-black group-hover:text-black/70">
                  {link}
                </span>
                <span
                  className={`h-[2px] mt-1 rounded transition-all duration-300 ${hovered === link || (!hovered && active === link) ? "w-[40px] bg-black" : "w-0 bg-transparent"}`}
                ></span>
              </div>
            ))}
          </div>
        </div>

        {/* Center logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Image
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
              className="flex items-center border border-white/20 rounded-full px-3 py-1 w-72 bg-white/10 backdrop-blur-sm"
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
                className="ml-2 hover:opacity-70 transition-opacity"
              >
                <Image
                  src="/icons/search.png"
                  alt="Search"
                  width={24}
                  height={24}
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
            <button className="relative hover:bg-white/10 rounded-full p-2 transition-colors">
              <Image
                src="/icons/wishlist.png"
                alt="Wishlist"
                width={24}
                height={24}
              />
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
              <Image src="/icons/cart.png" alt="Cart" width={24} height={24} />
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

// ---------- Robust Mobile Navbar (slide-down overlay search) ----------
export function NavbarMobile() {
  const navLinks = ["MEN", "WOMEN", "SNEAKERS"];
  const [activeIdx, setActiveIdx] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Search
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const inputRef = useRef(null);

  // token & user
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
    const q = searchTerm.trim();
    if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
  };

  // when overlay opens, lock body scroll and focus input (reliable on phones)
  useEffect(() => {
    if (showSearch) {
      document.body.style.overflow = "hidden";
      // small timeout to ensure paint & keyboard triggers reliably on mobile
      const t = setTimeout(() => {
        inputRef.current?.focus();
        if (searchTerm.trim().length >= 2) setSearchDropdownOpen(true);
      }, 60);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
    // cleanup on close
    return () => {
      document.body.style.overflow = "";
      setSearchDropdownOpen(false);
    };
  }, [showSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // also update dropdown as user types
  useEffect(() => {
    setSearchDropdownOpen(searchTerm.trim().length >= 2);
  }, [searchTerm]);

  // bottom tab sizing (same as before)
  const barRef = useRef(null);
  const [tabWidth, setTabWidth] = useState(0);
  useEffect(() => {
    const calc = () => {
      if (barRef.current)
        setTabWidth(barRef.current.offsetWidth / navLinks.length);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [navLinks.length]);

  return (
    <>
      {/* top mobile navbar */}
      <nav className="fixed top-1 left-[2px] z-50 w-[99%] flex items-center justify-between pl-4 pr- py-1 shadow-lg border border-white/20 bg-white/10 backdrop-blur-md rounded-3xl md:hidden">
        <button
          aria-label="Open Menu"
          className="p-2 z-10 rounded-full hover:bg-white/10 transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <Image src="/icons/hamburger.png" alt="Menu" width={24} height={24} />
        </button>

        {/* search icon only on navbar */}
        <div className="flex-1 flex relative justify-center">
          {!showSearch && (
            <button
              aria-label="Open Search"
              className="p-2 absolute top-1/2 -translate-y-1/2 right-0 rounded-full hover:bg-white/10 transition-colors"
              onClick={() => setShowSearch(true)}
            >
              <Image
                src="/icons/search.png"
                alt="Search"
                width={24}
                height={24}
              />
            </button>
          )}
        </div>

        <div className="flex items-center gap-0 z-10">
          <Link href="/cart">
            <button
              aria-label="Cart"
              className="relative p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <Image src="/icons/cart.png" alt="Cart" width={24} height={24} />
              {isLoggedIn && cartSummary?.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartSummary.totalItems > 99 ? "99+" : cartSummary.totalItems}
                </span>
              )}
            </button>
          </Link>
          <UserNavigation />
        </div>
      </nav>

      <SidebarDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        width={"w-[85%]"}
      />

      {/* Slide-down overlay for search (this is the robust part for phones) */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[70] flex items-start justify-center pt-16 px-4"
          >
            {/* transparent background click area (close on tap) */}
            <div
              className="absolute inset-0"
              onClick={() => {
                setShowSearch(false);
                setSearchDropdownOpen(false);
              }}
            />

            <div className="relative w-full max-w-xl">
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center bg-white/70 backdrop-blur-md rounded-full px-3 py-2 shadow-md z-[71]"
              >
                <button
                  type="button"
                  aria-label="Close search"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchDropdownOpen(false);
                  }}
                  className="mr-2 flex justify-center items-center text-xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-arrow-left-icon lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                </button>

                <input
                  ref={inputRef}
                  type="search"
                  inputMode="search"
                  placeholder="Search products..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />

                <button
                  type="submit"
                  aria-label="Submit search"
                  className="ml-2 p-1"
                >
                  <Image
                    src="/icons/search.png"
                    alt="Search"
                    width={20}
                    height={20}
                  />
                </button>
              </form>

              {/* dropdown directly under the input (high z) */}
              <div className="mt-2 z-[72] relative">
                <SearchDropdown
                  searchTerm={searchTerm}
                  isOpen={searchDropdownOpen}
                  onClose={() => setSearchDropdownOpen(false)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* bottom tab bar */}
      <div
        ref={barRef}
        className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] flex md:hidden items-center justify-between border border-black/5 rounded-full bg-gradient-to-tr from-white/80 to-white/60 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] px-2 z-50"
        style={{ height: 60 }}
      >
        {navLinks.map((link, idx) => (
          <button
            key={link}
            className={`flex-1 py-2 text-sm relative rounded-full transition-all duration-300 flex items-center justify-center font-medium ${activeIdx === idx ? "text-black font-bold bg-white shadow-md scale-105" : "text-black/70 hover:bg-black/5 hover:scale-[1.02]"}`}
            onClick={() => setActiveIdx(idx)}
          >
            {link}
          </button>
        ))}

        {activeIdx !== null && (
          <span
            className="absolute bottom-1 rounded-full bg-black/30 transition-all duration-300"
            style={{
              width: `${tabWidth * 0.6}px`,
              left: `${activeIdx * tabWidth + tabWidth * 0.2}px`,
              height: "3px",
            }}
          />
        )}
      </div>
    </>
  );
}
