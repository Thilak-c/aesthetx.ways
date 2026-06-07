"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Sidebar from "@/components/Sidebar";
import {
  ArrowLeft,
  Upload,
  Globe,
  Link as LinkIcon,
  Image as ImageIcon,
  Save,
  CheckCircle,
  RefreshCw,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function BannersPage() {
  const banners = useQuery(api.banners.getBanners);
  const products = useQuery(api.products.getAllProducts);
  const updateBanner = useMutation(api.banners.updateBanner);

  const [saving, setSaving] = useState(false);
  const [uploadingState, setUploadingState] = useState({
    left: false,
    right_top: false,
    right_bottom: false
  });

  // Local state for forms
  const [bannerConfig, setBannerConfig] = useState({
    left: { imageUrl: "", productLink: "" },
    right_top: { imageUrl: "", productLink: "" },
    right_bottom: { imageUrl: "", productLink: "" }
  });

  // Sync loaded banners to local state
  useEffect(() => {
    if (banners) {
      const config = {
        left: { imageUrl: "", productLink: "" },
        right_top: { imageUrl: "", productLink: "" },
        right_bottom: { imageUrl: "", productLink: "" }
      };
      banners.forEach((b) => {
        if (config[b.position]) {
          config[b.position] = {
            imageUrl: b.imageUrl,
            productLink: b.productLink
          };
        }
      });
      setBannerConfig(config);
    }
  }, [banners]);

  const handleLinkChange = (position, val) => {
    setBannerConfig((prev) => ({
      ...prev,
      [position]: { ...prev[position], productLink: val }
    }));
  };

  const uploadImage = async (file, position) => {
    setUploadingState((prev) => ({ ...prev, [position]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);

      toast.loading("Uploading banner photo...", { id: "upload" });
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      
      if (data.success && data.url) {
        setBannerConfig((prev) => ({
          ...prev,
          [position]: { ...prev[position], imageUrl: data.url }
        }));
        toast.success("Banner photo uploaded successfully!", { id: "upload" });
      } else {
        toast.error(data.error || "Upload process failed.", { id: "upload" });
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed. Verify server is active.", { id: "upload" });
    } finally {
      setUploadingState((prev) => ({ ...prev, [position]: false }));
    }
  };

  const handleSave = async (position) => {
    const config = bannerConfig[position];
    if (!config.imageUrl) {
      return toast.error("Please upload an image for this banner.");
    }
    if (!config.productLink.trim()) {
      return toast.error("Please enter or select a product link.");
    }

    setSaving(true);
    try {
      await updateBanner({
        position,
        imageUrl: config.imageUrl,
        productLink: config.productLink
      });
      toast.success(`${position.replace("_", " ").toUpperCase()} banner saved successfully!`);
    } catch (err) {
      toast.error(err.message || "Failed to update banner.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateBanner({
          position: "left",
          imageUrl: bannerConfig.left.imageUrl,
          productLink: bannerConfig.left.productLink
        }),
        updateBanner({
          position: "right_top",
          imageUrl: bannerConfig.right_top.imageUrl,
          productLink: bannerConfig.right_top.productLink
        }),
        updateBanner({
          position: "right_bottom",
          imageUrl: bannerConfig.right_bottom.imageUrl,
          productLink: bannerConfig.right_bottom.productLink
        })
      ]);
      toast.success("All banners saved successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to save banners.");
    } finally {
      setSaving(false);
    }
  };

  // Pre-seed helper to configure defaults (using copied local files)
  const preSeedBanners = () => {
    const baseUrl = window.location.origin;
    setBannerConfig({
      left: {
        imageUrl: `${baseUrl}/api/uploads/banner_left.webp`,
        productLink: "/product/dusty-fade-baggy-jeans"
      },
      right_top: {
        imageUrl: `${baseUrl}/api/uploads/banner_right_top.webp`,
        productLink: "/product/black-fade-baggy-jeans"
      },
      right_bottom: {
        imageUrl: `${baseUrl}/api/uploads/banner_right_bottom.webp`,
        productLink: "/product/glacier-wash-baggy-jeans"
      }
    });
    toast.success("Banners pre-seeded with original webp pictures! Click Save All to apply.");
  };

  const positions = [
    {
      id: "left",
      label: "Left Tall Banner",
      description: "Large vertical banner taking up the left side of the home grid (~60% width). Recommended size: ~800x1000px."
    },
    {
      id: "right_top",
      label: "Right Top Banner",
      description: "Smaller horizontal banner on the top right. Recommended size: ~800x500px."
    },
    {
      id: "right_bottom",
      label: "Right Bottom Banner",
      description: "Smaller horizontal banner on the bottom right. Recommended size: ~800x500px."
    }
  ];

  const isLoading = banners === undefined || products === undefined;

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 pt-12 lg:pt-0">
            <Link
              href="/website"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-wider mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> <span>Back to Website Store</span>
            </Link>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Globe size={14} className="text-blue-500 animate-pulse" />
                  <p className="text-blue-500 text-[10px] font-extrabold uppercase tracking-widest">
                    Website Store
                  </p>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-poppins">
                  Manage Hero Banners
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Upload custom .webp promotional graphics and link them directly to products on the storefront.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={preSeedBanners}
                  className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Seed Original webp Banners
                </button>
                <button
                  onClick={handleSaveAll}
                  disabled={saving || isLoading}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save All Banners</span>
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mb-3 text-slate-400" />
              <p className="text-sm font-bold">Loading banner configuration...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {positions.map((pos) => {
                const config = bannerConfig[pos.id] || { imageUrl: "", productLink: "" };
                const isUploading = uploadingState[pos.id];

                return (
                  <div
                    key={pos.id}
                    className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Title & Description */}
                      <div className="mb-4">
                        <h3 className="font-extrabold text-slate-800 text-sm">{pos.label}</h3>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {pos.description}
                        </p>
                      </div>

                      {/* Image Preview / Upload Area */}
                      <div className="mb-5">
                        {config.imageUrl ? (
                          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden group border shadow-sm bg-slate-50">
                            <img src={config.imageUrl} className="w-full h-full object-cover" alt={pos.label} />
                            <button
                              type="button"
                              onClick={() =>
                                setBannerConfig((prev) => ({
                                  ...prev,
                                  [pos.id]: { ...prev[pos.id], imageUrl: "" }
                                }))
                              }
                              className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white text-xs font-bold gap-1.5"
                            >
                              <X className="w-5 h-5" /> Remove Image
                            </button>
                          </div>
                        ) : (
                          <label className="w-full aspect-[4/3] border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all">
                            {isUploading ? (
                              <>
                                <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                                <span className="text-[10px] text-slate-400 mt-2">Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-slate-300" />
                                <span className="text-[10px] text-slate-500 font-bold mt-2">Upload WebP Graphic</span>
                                <span className="text-[8px] text-slate-400 mt-1">Accepts PNG, JPG, WebP</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploading}
                              onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], pos.id)}
                            />
                          </label>
                        )}
                      </div>

                      {/* Product Link Input */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                            Link Destination
                          </label>
                          <div className="relative">
                            <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                            <input
                              type="text"
                              value={config.productLink}
                              onChange={(e) => handleLinkChange(pos.id, e.target.value)}
                              placeholder="/product/glacier-wash-baggy-jeans"
                              className="w-full pl-9 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:border-slate-800 rounded-xl text-xs font-medium focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Searchable Dropdown or select to auto populate link */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                            Select Product Link Shortcut
                          </label>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleLinkChange(pos.id, `/product/${e.target.value}`);
                              }
                            }}
                            className="w-full px-3 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:border-slate-800 rounded-xl text-xs focus:outline-none font-bold"
                          >
                            <option value="">-- Choose Product to Link --</option>
                            {products?.map((p) => (
                              <option key={p.itemId} value={p.itemId}>
                                [{p.itemId}] {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-5 pt-3 border-t border-slate-50">
                      <button
                        onClick={() => handleSave(pos.id)}
                        disabled={saving}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Save size={13} />
                        <span>Save this Banner</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
