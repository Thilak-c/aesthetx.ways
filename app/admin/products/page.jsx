"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { FiEdit, FiTrash2, FiEye, FiEyeOff, FiTrendingUp, FiClock, FiSearch, FiPackage, FiAlertTriangle } from "react-icons/fi";

// Animated Number Component
function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const duration = 600;
    const stepTime = Math.max(1, Math.floor(duration / (value || 1)));
    const timer = setInterval(() => {
      start += Math.ceil((value || 0) / (duration / stepTime));
      if (start >= value) {
        start = value;
        clearInterval(timer);
      }
      setDisplayValue(start);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);
  return displayValue.toLocaleString();
}

// Premium Toast
function Toast({ message, type = "success", onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(true);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  if (!visible) return null;
  const bgColor =
    type === "success" ? "bg-green-600" :
    type === "error" ? "bg-red-600" : "bg-gray-800";

  return (
    <div className={`fixed top-5 right-5 px-5 py-3 ${bgColor} text-white rounded-xl shadow-xl flex items-center gap-4 animate-toast z-50`}>
      <span>{message}</span>
      <button onClick={onClose} className="font-bold text-xl leading-none hover:scale-110 transition-transform">
        ×
      </button>
      <style jsx>{`
        @keyframes toast-slide {
          0% { opacity: 0; transform: translateY(-20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-toast { animation: toast-slide 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}

// Main Dashboard
export default function ProductDashboard() {
  const products = useQuery(api.products.getAll) || [];
  const toggleHidden = useMutation(api.products.toggleHidden);
  const deleteProduct = useMutation(api.products.deleteProduct);
  const updateProduct = useMutation(api.products.update);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState("All"); // All, In Stock, Out of Stock

  const handleSort = (key) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  const handleToggleHidden = async (product) => {
    await toggleHidden({ itemId: product.itemId, isHidden: !product.isHidden });
    setToast(`${product.name} is now ${product.isHidden ? "visible" : "hidden"}`);
  };

  const handleDelete = async (product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      await deleteProduct({ productId: product._id });
      setToast(`Product "${product.name}" deleted successfully!`);
    }
  };

  // Category stats
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach(p => {
      const cat = p.category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => 
    products
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter(p => selectedCategory === "All" || (p.category || "Uncategorized") === selectedCategory)
      .filter(p => {
        if (stockFilter === "All") return true;
        if (stockFilter === "In Stock") return p.inStock !== false;
        if (stockFilter === "Out of Stock") return p.inStock === false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name" || sortBy === "category") {
          return sortAsc
            ? (a[sortBy] || "").localeCompare(b[sortBy] || "")
            : (b[sortBy] || "").localeCompare(a[sortBy] || "");
        } else {
          return sortAsc
            ? (a[sortBy] || 0) - (b[sortBy] || 0)
            : (b[sortBy] || 0) - (a[sortBy] || 0);
        }
      }), [products, search, sortBy, sortAsc, selectedCategory, stockFilter]);

  // Stats
  const todaySales = useMemo(() => {
    const today = new Date().toDateString();
    return products.reduce((sum, p) => {
      const created = new Date(p.createdAt).toDateString();
      return created === today ? sum + (p.buys || 0) * (p.price || 0) : sum;
    }, 0);
  }, [products]);
  const lifetimeSales = useMemo(() => products.reduce((sum, p) => sum + (p.buys || 0) * (p.price || 0), 0), [products]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Product Dashboard</h1>
        <Link href="/admin/upload/" className="px-4 py-2 bg-black text-white rounded-lg shadow hover:shadow-md transition">
          + Add Product
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Today's Sales" value={`₹${todaySales}`} color="green" />
        <StatCard title="Lifetime Sales" value={`₹${lifetimeSales}`} color="blue" />
        <StatCard title="Total Products" value={products.length} color="purple" />
        <StatCard title="In Stock" value={products.filter(p => p.inStock !== false).length} color="green" />
        <StatCard title="Out of Stock" value={products.filter(p => p.inStock === false).length} color="red" />
      </div>

      {/* Category Overview */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Category Overview</h2>
        <div className="flex flex-wrap gap-3">
          {["All", ...Object.keys(categoryCounts)].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium shadow transition ${
                selectedCategory === cat
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-100 text-gray-800"
              }`}
            >
              {cat} ({cat === "All" ? products.length : categoryCounts[cat]})
            </button>
          ))}
        </div>
      </div>

      {/* Stock Status Filter */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Stock Status</h2>
        <div className="flex flex-wrap gap-3">
          {["All", "In Stock", "Out of Stock"].map(status => (
            <button
              key={status}
              onClick={() => setStockFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium shadow transition ${
                stockFilter === status
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-100 text-gray-800"
              }`}
            >
              {status} ({
                status === "All" ? products.length :
                status === "In Stock" ? products.filter(p => p.inStock !== false).length :
                products.filter(p => p.inStock === false).length
              })
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <FiSearch className="absolute top-3 left-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-1/3 pl-10 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black shadow"
        />
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {[
                { label: "Name", key: "name" },
                { label: "Category", key: "category" },
                { label: "Price", key: "price" },
                { label: "Stock Status", key: "inStock" },
                { label: "Current Stock", key: "currentStock" },
                { label: "Total Available", key: "totalAvailable" },
                { label: "Buys", key: "buys" },
                { label: "Total Sales", key: "totalSales" },
                { label: "Created At", key: "createdAt" },
                { label: "Actions", key: "actions" }
              ].map(col => (
                <th
                  key={col.key}
                  className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => col.key !== "actions" && handleSort(col.key)}
                >
                  {col.label} {sortBy === col.key ? (sortAsc ? "▲" : "▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map(p => (
              <tr key={p.itemId} className="hover:bg-gray-50 transition">
                <td className="px-2 py-3 cursor-pointer text-blue-600 hover:underline">
                  <Link href={`/admin/product/${p.itemId}`}>{p.name}</Link>
                </td>
                <td className="px-2 py-3">{p.category || "Uncategorized"}</td>
                <td className="px-2 py-3 font-bold">₹{p.price.toLocaleString()}</td>
                <td className="px-2 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    p.inStock !== false 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <span className={`w-2 h-2 mr-1.5 rounded-full ${
                      p.inStock !== false ? 'bg-green-400' : 'bg-red-400'
                    }`}></span>
                    {p.inStock !== false ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <span className={`font-medium ${
                    p.currentStock !== undefined && p.currentStock < 10 && p.currentStock > 0
                      ? 'text-orange-600' 
                      : p.currentStock === 0 
                        ? 'text-red-600' 
                        : 'text-gray-900'
                  }`}>
                    {p.currentStock !== undefined ? `${p.currentStock} units` : '∞'}
                  </span>
                </td>
                <td className="px-2 py-3 text-gray-900">
                  {p.totalAvailable !== undefined ? `${p.totalAvailable} units` : '∞'}
                </td>
                <td className="px-2 py-3"><AnimatedNumber value={p.buys || 0} /></td>
                <td className="px-2 py-3 font-bold">₹<AnimatedNumber value={(p.buys || 0) * (p.price || 0)} /></td>
                <td className="px-2 py-3">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}</td>
                <td className="px-2 py-3 flex gap-1">
                  <Link
                    href={`/admin/edit/${p.itemId}`}
                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center gap-1"
                  >
                    <FiEdit size={12} /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p)}
                    className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-900 text-xs flex items-center gap-1"
                  >
                    <FiTrash2 size={12} /> Delete
                  </button>
                  <button
                    onClick={() => handleToggleHidden(p)}
                    className={`px-2 py-1 rounded text-xs flex items-center gap-1 text-white ${
                      p.isHidden ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {p.isHidden ? <><FiEye size={12} /> Unhide</> : <><FiEyeOff size={12} /> Hide</>}
                  </button>
                  <button
                    title={p.inStock !== false ? "In Stock" : "Out of Stock"}
                    className={`px-2 py-1 rounded text-xs flex items-center gap-1 text-white cursor-default ${
                      p.inStock !== false ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {p.inStock !== false ? <><FiPackage size={12} /> Stock</> : <><FiAlertTriangle size={12} /> No Stock</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Stat Card
function StatCard({ title, value, color = "gray" }) {
  const colors = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
    gray: "bg-gray-100 text-gray-600"
  };
  return (
    <div className={`p-4 rounded-xl shadow flex flex-col items-center ${colors[color]}`}>
      <span className="text-gray-700 font-medium">{title}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}
