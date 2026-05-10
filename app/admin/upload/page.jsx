"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AddProductPage() {
  const addProduct = useMutation(api.products.insert);
  const [form, setForm] = useState({
    name: "",
    subcategories: "",
    type: [],
    category: "",
    price: "",
    description: "",
    mainImage: "",
    otherImages: [],
    color: "",
    garmentType: "upper", // "upper", "lower", or "pendant"
    availableSizes: ["S", "M", "L", "XL"],
    sizeStock: {
      S: "10",
      M: "",
      L: "",
      XL: "",
      XXL: "",
      "26": "",
      "28": "",
      "30": "",
      "32": "",
      "34": "",
    },
    availableColors: [],
    colorStock: {
      Black: "",
      White: "",
      Red: "",
      Blue: "",
      Green: "",
      Yellow: "",
      Pink: "",
      Purple: "",
      Orange: "",
      Brown: "",
      Gray: "",
      Beige: "",
      Gold: "",
      Silver: "",
    },
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      // Handle multiple select for type field
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setForm((prev) => ({ ...prev, [name]: selectedOptions }));
    } else if (name === "garmentType") {
      // When garment type changes, reset sizes
      let newSizes = [];
      if (value === "lower") {
        newSizes = ["28", "30", "32"];
      } else if (value === "upper") {
        newSizes = ["S", "M", "L", "XL"];
      }
      // For pendant, no sizes needed
      setForm((prev) => ({ 
        ...prev, 
        [name]: value,
        availableSizes: newSizes
      }));
    } else {
      // Auto-capitalize text inputs (except price, description, category, color, and garmentType dropdown)
      const capitalizedValue = (name === "price" || name === "description" || name === "category" || name === "color" || name === "garmentType")
        ? value
        : value.toUpperCase();
      setForm((prev) => ({ ...prev, [name]: capitalizedValue }));
    }
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

  const handleColorToggle = (color) => {
    setForm((prev) => {
      const newAvailableColors = prev.availableColors.includes(color)
        ? prev.availableColors.filter((c) => c !== color)
        : [...prev.availableColors, color];
      return {
        ...prev,
        availableColors: newAvailableColors,
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

  const handleColorStockChange = (color, value) => {
    setForm((prev) => ({
      ...prev,
      colorStock: {
        ...prev.colorStock,
        [color]: value,
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

    let totalStock = 0;
    let inStock = false;

    // Calculate stock based on garment type
    if (form.garmentType === "pendant") {
      // Calculate total stock from all available colors
      totalStock = Object.entries(form.colorStock)
        .filter(([color]) => form.availableColors.includes(color))
        .reduce((sum, [_, stock]) => sum + (parseInt(stock) || 0), 0);
      inStock = totalStock > 0;
    } else {
      // Calculate total stock from all available sizes
      totalStock = Object.entries(form.sizeStock)
        .filter(([size]) => form.availableSizes.includes(size))
        .reduce((sum, [_, stock]) => sum + (parseInt(stock) || 0), 0);
      inStock = totalStock > 0;
    }

    await addProduct({
      itemId: crypto.randomUUID(),
      name: form.name,
      subcategories: form.subcategories,
      type: form.type,
      category: form.category,
      price: parseFloat(form.price),
      description: form.description,
      mainImage: form.mainImage,
      createdAt: new Date().toISOString(),
      otherImages: form.otherImages,
      color: form.color,
      garmentType: form.garmentType,
      availableSizes: form.garmentType === "pendant" ? [] : form.availableSizes,
      sizeStock: form.garmentType === "pendant" ? {} : Object.fromEntries(
        Object.entries(form.sizeStock).map(([size, stock]) => [
          size,
          stock ? parseInt(stock) : 0
        ])
      ),
      availableColors: form.garmentType === "pendant" ? form.availableColors : [],
      colorStock: form.garmentType === "pendant" ? Object.fromEntries(
        Object.entries(form.colorStock).map(([color, stock]) => [
          color,
          stock ? parseInt(stock) : 0
        ])
      ) : {},
      // Add these fields
      currentStock: totalStock,
      inStock: inStock,
    });

    alert("✅ Product Added Successfully!");
    setForm({
      name: "",
      subcategories: "",
      type: [],
      category: "",
      price: "",
      description: "",
      mainImage: "",
      otherImages: [],
      color: "",
      garmentType: "upper",
      availableSizes: ["S", "M", "L", "XL", "XXL"],
      sizeStock: {
        S: "10",
        M: "",
        L: "",
        XL: "",
        XXL: "",
        "26": "",
        "28": "",
        "30": "",
        "32": "",
        "34": "",
      },
      availableColors: [],
      colorStock: {
        Black: "",
        White: "",
        Red: "",
        Blue: "",
        Green: "",
        Yellow: "",
        Pink: "",
        Purple: "",
        Orange: "",
        Brown: "",
        Gray: "",
        Beige: "",
        Gold: "",
        Silver: "",
      },
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-2">Fill in the product details below to add it to your inventory</p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-sm rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              <p className="text-sm text-gray-600 mt-1">Enter the basic product details</p>
            </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* subcategories */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategories *</label>
            <input
              type="text"
              name="subcategories"
              value={form.subcategories}
              onChange={handleChange}
              required
              placeholder="e.g., Summer Collection, Casual Wear"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Category and Price Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all"
              >
                <option value="" disabled>-- Select Category --</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Sneakers">Sneakers</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              placeholder="Enter product description..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            ></textarea>
          </div>
          </div>

          {/* Product Types Section */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-900">Product Types</h2>
              <p className="text-sm text-gray-600 mt-1">Select all applicable product types</p>
            </div>

          {/* Type */}
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                "Baggy Shirts", "Oversized T-Shirts", "Crop Tops", "High Waist Jeans", "Low Rise Pants", "Mom Jeans", "Dad Sneakers", "Chunky Sneakers", "Platform Shoes",
                "Y2K Fashion", "Vintage", "Retro", "Street Style", "Hip Hop", "Skater Style", "Grunge", "Punk", "Goth", "Emo", "Chokers", "Oversized Hoodies", "Baggy Pants",
                "Cargo Pants", "Athleisure", "Streetwear", "Trendy Dresses", "Mini Skirts", "Micro Shorts", "Tank Tops", "Tube Tops", "Bralettes", "Mesh Tops", "Fishnet",
                "Leather Jackets", "Denim Jackets", "Oversized Blazers", "Trendy Accessories", "Chain Necklaces", "Hoop Earrings", "Statement Rings", "Trendy Bags", "Crossbody Bags"
              ].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      type: prev.type.includes(type)
                        ? prev.type.filter(t => t !== type)
                        : [...prev.type, type]
                    }));
                  }}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${form.type.includes(type)
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {form.type.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-3">Selected types ({form.type.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {form.type.map((type, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-white text-blue-700 text-sm font-medium rounded-full flex items-center gap-2 border border-blue-300 shadow-sm"
                    >
                      {type}
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            type: prev.type.filter(t => t !== type)
                          }));
                        }}
                        className="text-blue-600 hover:text-blue-800 text-lg font-bold hover:bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Product Configuration Section */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-900">Product Configuration</h2>
              <p className="text-sm text-gray-600 mt-1">Configure garment type and color</p>
            </div>

          {/* Garment Type and Color Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Garment Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Garment Type *</label>
              <select
                name="garmentType"
                value={form.garmentType}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all"
              >
                <option value="upper">Upper (Shirts, T-Shirts, Tops)</option>
                <option value="lower">Lower (Pants, Jeans, Shorts)</option>
                <option value="pendant">Pendant (Jewelry, Accessories)</option>
              </select>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {form.garmentType === "upper" 
                  ? "Sizes: S, M, L, XL, XXL" 
                  : form.garmentType === "lower"
                  ? "Sizes: 26, 28, 30, 32, 34"
                  : "No sizes - Color based inventory"}
              </p>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Color *</label>
              <select
                name="color"
                value={form.color}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all"
              >
                <option value="" disabled>-- Select Color --</option>
                <option value="Black">Black</option>
                <option value="White">White</option>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
                <option value="Green">Green</option>
                <option value="Yellow">Yellow</option>
                <option value="Pink">Pink</option>
                <option value="Purple">Purple</option>
                <option value="Orange">Orange</option>
                <option value="Brown">Brown</option>
                <option value="Gray">Gray</option>
                <option value="Beige">Beige</option>
              </select>
            </div>
          </div>
          </div>

          {/* Size-Based Inventory Management - Only show for upper and lower */}
          {form.garmentType !== "pendant" && (
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
                {(form.garmentType === "upper" 
                  ? ["S", "M", "L", "XL", "XXL"] 
                  : ["26", "28", "30", "32", "34"]
                ).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`px-3 py-2 rounded-lg border-2 font-medium transition-all ${form.availableSizes.includes(size)
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
                {(form.garmentType === "upper" 
                  ? ["S", "M", "L", "XL", "XXL"] 
                  : ["26", "28", "30", "32", "34"]
                ).map((size) => (
                  <div key={size} className={`p-4 rounded-lg border-2 transition-all ${form.availableSizes.includes(size)
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
                      value={form.sizeStock[size] || ""}
                      onChange={(e) => handleSizeStockChange(size, e.target.value)}
                      min="0"
                      disabled={!form.availableSizes.includes(size)}
                      className={`w-full border rounded-lg px-3 py-2 ${form.availableSizes.includes(size)
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
          )}

          {/* Pendant Stock - Only show for pendant type */}
          {form.garmentType === "pendant" && (
          <div className="space-y-4">
            <div className="border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-r-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">Color-Based Inventory Management</h3>
                  <p className="text-sm text-purple-700">Set stock levels for each available color</p>
                </div>
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Available Colors</h4>
              <div className="flex flex-wrap gap-2">
                {["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Orange", "Brown", "Gray", "Beige", "Gold", "Silver"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorToggle(color)}
                    className={`px-3 py-2 rounded-lg border-2 font-medium transition-all ${form.availableColors.includes(color)
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                      }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Stock Inputs */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700">Stock for Each Color</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Orange", "Brown", "Gray", "Beige", "Gold", "Silver"].map((color) => (
                  <div key={color} className={`p-4 rounded-lg border-2 transition-all ${form.availableColors.includes(color)
                    ? "border-purple-200 bg-purple-50"
                    : "border-gray-200 bg-gray-50 opacity-50"
                    }`}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {color}
                      {form.availableColors.includes(color) && (
                        <span className="ml-2 text-xs text-purple-600">✓ Available</span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={form.colorStock[color] || ""}
                      onChange={(e) => handleColorStockChange(color, e.target.value)}
                      min="0"
                      disabled={!form.availableColors.includes(color)}
                      className={`w-full border rounded-lg px-3 py-2 ${form.availableColors.includes(color)
                        ? "border-purple-300 focus:border-purple-500 focus:ring-purple-200"
                        : "border-gray-200 bg-gray-100"
                        }`}
                      placeholder="0"
                    />
                    {form.availableColors.includes(color) && form.colorStock[color] && (
                      <p className="text-xs text-gray-500 mt-1">
                        {parseInt(form.colorStock[color])} units available
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Summary */}
            {form.availableColors.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-900 mb-3">Stock Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Available Colors:</span>
                    <span className="font-medium">{form.availableColors.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Stock:</span>
                    <span className="font-medium">
                      {Object.entries(form.colorStock)
                        .filter(([color]) => form.availableColors.includes(color))
                        .reduce((sum, [_, stock]) => sum + (parseInt(stock) || 0), 0)
                      } units
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Images Section */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-900">Product Images</h2>
              <p className="text-sm text-gray-600 mt-1">Upload main and additional product images</p>
            </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Main Image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleMainImageUpload}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {form.mainImage && (
              <div className="mt-4">
                <img
                  src={form.mainImage}
                  alt="Main"
                  className="w-40 h-40 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Other Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleOtherImagesUpload}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {form.otherImages.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {form.otherImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Other ${idx}`}
                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Product...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </>
            )}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
