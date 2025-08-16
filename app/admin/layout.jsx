"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiHome, FiPackage, FiUpload, FiUsers, FiFileText, FiBarChart2, FiLogOut } from "react-icons/fi";
import { getServerSession } from "next-auth";




export default async function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navLinks = [
    { label: "Dashboard", href: "/admin", icon: <FiHome /> },
    { label: "Products", href: "/admin/products", icon: <FiPackage /> },
    { label: "Upload Product", href: "/admin/upload", icon: <FiUpload /> },
    { label: "Orders", href: "/admin/orders", icon: <FiFileText /> },
    { label: "Users", href: "/admin/users", icon: <FiUsers /> },
    { label: "Reports", href: "/admin/reports", icon: <FiBarChart2 /> },
  ];

  return (
    <div className="flex min-h-screen font-sans text-gray-900 bg-gray-50">

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-6 transform md:translate-x-0 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 z-50`}>
        
        {/* Mobile header */}
        <div className="flex justify-between items-center mb-8 md:hidden">
          <span className="font-bold text-2xl">Admin</span>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-900">
            <FiX size={28} />
          </button>
        </div>

        {/* Nav links */}
        <ul className="space-y-4">
          {navLinks.map(link => (
            <li key={link.href}>
              <Link 
                href={link.href} 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-800"
              >
                <span className="text-xl">{link.icon}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout */}
        <div className="mt-auto pt-6">
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col  transition-all duration-300">
        
        {/* Top Navbar */}
        <nav className="flex items-center justify-between bg-white shadow-md px-6 py-4 sticky top-0 z-40">
          <button className="md:hidden text-gray-900" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={28} />
          </button>
          <span className="font-bold text-2xl text-gray-900">Admin Panel</span>
          <div className="hidden md:flex items-center gap-4">
            <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-shadow shadow-sm">Profile</button>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-shadow shadow-sm">Logout</button>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
