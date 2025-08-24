"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AddProductPage() {
  const addProduct = useMutation(api.products.insert);
  const [form, setForm] = useState({
    name: "",
    subcategories: "",
    category: "",
    price: "",
    description: "",
    mainImage: "",
    otherImages: [],
    availableSizes: ["S", "M", "L", "XL"],
    sizeStock: {
      S: "10",
      M: "",
      L: "",
      XL: "",
      XXL: "",
    },
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeToggle = (size) => {
    setForm((prev) => {
      const newAvailableSizes = prev.availableSizes.includes(size)
        ? prev.availableSizes.filter((s) => s !== size)
        : [...prev.availableSizes, size];
      return {
        ...prev,
        availableSizes: newAvailableSizes,
      };
    });
  };

  const handleSizeStockChange = (size, value) => {
    setForm((prev) => ({
      ...prev,
      sizeStock: {
        ...prev.sizeStock,
        [size]: value,
      },
    }));
  };

  // Upload single main image
  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();

    if (data.url) {
      setForm((prev) => ({ ...prev, mainImage: data.url }));
    }
  };

  // Upload multiple other images and append instead of replacing
  const handleOtherImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    const urls = [];

    for (const file of files) {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }

    // Append new images to existing ones
    setForm((prev) => ({
      ...prev,
      otherImages: [...prev.otherImages, ...urls],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await addProduct({
      itemId: crypto.randomUUID(),
      name: form.name,
      subcategories: form.subcategories,
      category: form.category,
      price: parseFloat(form.price),
      description: form.description,
      mainImage: form.mainImage,
      createdAt: new Date().toISOString(),
      otherImages: form.otherImages,
      availableSizes: form.availableSizes,
      sizeStock: Object.fromEntries(
        Object.entries(form.sizeStock).map(([size, stock]) => [
          size, 
          stock ? parseInt(stock) : 0
        ])
      ),
    });

    alert("✅ Product Added Successfully!");
    setForm({
      name: "",
      subcategories: "",
      category: "",
      price: "",
      description: "",
      mainImage: "",
      otherImages: [],
      availableSizes: ["S", "M", "L", "XL","XXL"],
      sizeStock: {
        S: "10",
        M: "",
        L: "",
        XL: "",
        XXL: "",
      },
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* subcategories */}
          <div>
            <label className="block text-sm font-medium mb-1">subcategories</label>
            <input
              type="text"
              name="subcategories"
              value={form.subcategories}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="w-full border rounded-lg px-3 py-2"
            ></textarea>
          </div>

          {/* Size-Based Inventory Management */}
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-r-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Size-Based Inventory Management</h3>
                  <p className="text-sm text-blue-700">Set stock levels for each available size</p>
                </div>
              </div>
            </div>
            
            {/* Size Selection */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Available Sizes</h4>
              <div className="flex flex-wrap gap-2">
                {["S", "M", "L", "XL", "XXL"].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`px-3 py-2 rounded-lg border-2 font-medium transition-all ${
                      form.availableSizes.includes(size)
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Size Stock Inputs */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700">Stock for Each Size</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {["S", "M", "L", "XL", "XXL"].map((size) => (
                  <div key={size} className={`p-4 rounded-lg border-2 transition-all ${
                    form.availableSizes.includes(size)
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-gray-50 opacity-50"
                  }`}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size {size}
                      {form.availableSizes.includes(size) && (
                        <span className="ml-2 text-xs text-blue-600">✓ Available</span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={form.sizeStock[size]}
                      onChange={(e) => handleSizeStockChange(size, e.target.value)}
                      min="0"
                      disabled={!form.availableSizes.includes(size)}
                      className={`w-full border rounded-lg px-3 py-2 ${
                        form.availableSizes.includes(size)
                          ? "border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                          : "border-gray-200 bg-gray-100"
                      }`}
                      placeholder="0"
                    />
                    {form.availableSizes.includes(size) && form.sizeStock[size] && (
                      <p className="text-xs text-gray-500 mt-1">
                        {parseInt(form.sizeStock[size])} units available
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Stock Summary */}
            {form.availableSizes.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Stock Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Available Sizes:</span>
                    <span className="font-medium">{form.availableSizes.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Stock:</span>
                    <span className="font-medium">
                      {Object.entries(form.sizeStock)
                        .filter(([size]) => form.availableSizes.includes(size))
                        .reduce((sum, [_, stock]) => sum + (parseInt(stock) || 0), 0)
                      } units
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-medium mb-1">Main Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleMainImageUpload}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
            {form.mainImage && (
              <img
                src={form.mainImage}
                alt="Main"
                className="mt-2 w-32 h-32 object-cover rounded"
              />
            )}
          </div>

          {/* Other Images */}
          <div>
            <label className="block text-sm font-medium mb-1">Other Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleOtherImagesUpload}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {form.otherImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {form.otherImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Other ${idx}`}
                  className="w-full h-20 object-cover rounded"
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
