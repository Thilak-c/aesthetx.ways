"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiUsers, FiBox, FiUpload, FiFileText, FiLogOut } from "react-icons/fi";
import { useState } from "react";

export default function AdminNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: <FiHome /> },
    { label: "Products", href: "/admin/all-products", icon: <FiBox /> },
    { label: "Upload Product", href: "/admin/upload", icon: <FiUpload /> },
    { label: "Orders", href: "/admin/orders", icon: <FiFileText /> },
    { label: "Users", href: "/admin/users", icon: <FiUsers /> },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo / Brand */}
          <div className="flex-shrink-0">
            <Link href="/admin" className="text-xl font-bold text-black">
              Admin Panel
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:space-x-4 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition hover:bg-gray-100 ${
                  pathname === item.href ? "bg-gray-200 font-bold" : "text-gray-700"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}

            {/* Logout Button */}
            <button className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 font-medium rounded-md hover:bg-red-100 transition">
              <FiLogOut /> Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition"
            >
              <svg
                className="h-6 w-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
          <div className="flex flex-col p-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition hover:bg-gray-100 ${
                  pathname === item.href ? "bg-gray-200 font-bold" : "text-gray-700"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.icon} {item.label}
              </Link>
            ))}
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 font-medium rounded-md hover:bg-red-100 transition">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
