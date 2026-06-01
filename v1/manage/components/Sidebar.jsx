"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  History,
  Settings,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Globe,
  ShoppingCart,
  Tag,
  Truck,
  Receipt
} from "lucide-react";
import toast from "react-hot-toast";

// Website Store Navigation
const navItems = [
  { href: "/website", label: "Dashboard", icon: LayoutDashboard, description: "Website overview" },
  { href: "/website/orders", label: "Orders", icon: ShoppingCart, description: "Customer orders" },
  { href: "/website/coupons", label: "Coupons", icon: Tag, description: "Discount codes" },
  { href: "/website/Bill-offline", label: "Bill Offline", icon: Receipt, description: "Walk-in offline billing" },
  { href: "/website/add-product", label: "Add Product", icon: Package, description: "Add to website" },
  { href: "/website/products", label: "All Products", icon: Package, description: "Website inventory" },
  { href: "/website/history", label: "History", icon: History, description: "Stock movements" },
  { href: "/website/shiprocket", label: "Shiprocket", icon: Truck, description: "Logistics & packaging" },
  { href: "/website/settings", label: "Settings", icon: Settings, description: "Preferences" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("insys_auth");
    toast.success("Logged out successfully.");
    router.push("/login");
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow cursor-pointer"
      >
        <Menu size={22} className="text-slate-700" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-white border-r border-slate-100
        transform transition-transform duration-300 ease-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 p-1">
                <img src="/logo.png" alt="Aesthetx Ways Logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 font-poppins">Aesthetx Ways</h1>
                <p className="text-[10px] text-slate-400 tracking-widest font-extrabold">INVENTORY</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          {/* Static Website Store Indicator */}
          <div className="mt-4">
            <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-2xl border bg-blue-50 border-blue-150 shadow-xs">
              <Globe size={16} className="text-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Website Store
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-none">
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase px-3.5 mb-2.5 mt-6">
            Website Operations
          </p>
          
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    group flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200
                    ${isActive
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                      : "text-slate-600 hover:bg-slate-50"
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-xl transition-colors
                    ${isActive ? "bg-white/20" : "bg-slate-100 group-hover:bg-slate-200"}
                  `}>
                    <Icon size={16} className={isActive ? "text-white" : "text-slate-500"} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-extrabold ${isActive ? "text-white" : "text-slate-700"}`}>
                      {item.label}
                    </p>
                    <p className={`text-[10px] font-medium leading-normal ${isActive ? "text-white/70" : "text-slate-400"}`}>
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <ChevronRight size={14} className="text-white/50" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <a
            href="https://aesthetxways.com/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3.5 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all group"
          >
            <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
              <ExternalLink size={16} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-700">Storefront Admin</p>
              <p className="text-[10px] text-slate-400">aesthetxways.com</p>
            </div>
          </a>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50/60 rounded-2xl transition-all group cursor-pointer"
          >
            <div className="p-2 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition-colors">
              <LogOut size={16} className="text-rose-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-bold">Sign Out</p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
