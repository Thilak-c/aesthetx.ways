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
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
