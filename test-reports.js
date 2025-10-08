"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  MapPin, 
  Phone, 
  Heart, 
  Mail, 
  Camera,
  Save,
  X,
  Plus,
  Sparkles,
  Settings,
  LogOut,
  Edit2,
  Check,
  Home
} from "lucide-react";

export default function ProfilePageRedesign() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [newInterest, setNewInterest] = useState("");
  const [formData, setFormData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phoneNumber: "+1 (555) 123-4567",
    secondaryPhoneNumber: "+1 (555) 987-6543",
    address: {
      state: "Bihar",
      city: "Patna",
      pinCode: "800001",
      fullAddress: "123 Fashion Street, Downtown"
    },
    interests: ["Streetwear", "Vintage", "Hip Hop", "Oversized Hoodies"],
    photoUrl: ""
  });

  const statesAndCities = {
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
  };

  const popularInterests = [
    "Baggy Shirts", "Oversized T-Shirts", "Crop Tops", "High Waist Jeans", 
    "Street Style", "Hip Hop", "Vintage", "Y2K Fashion", "Athleisure",
    "Cargo Pants", "Platform Shoes", "Chunky Sneakers", "Leather Jackets"
  ];

  const addInterest = (interest) => {
    if (!formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

  const removeInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const tabs = [
    { id: "personal", label: "Personal", icon: User },
    { id: "address", label: "Address", icon: MapPin },
    { id: "interests", label: "Interests", icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                AesthetX
              </span>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-3">
              <button className="p-2 lg:p-3 hover:bg-slate-100 rounded-xl transition-all duration-200">
                <Home className="w-5 h-5 text-slate-600" />
              </button>
              <button className="p-2 lg:p-3 hover:bg-slate-100 rounded-xl transition-all duration-200">
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
              <button className="p-2 lg:p-3 hover:bg-rose-100 rounded-xl transition-all duration-200 group">
                <LogOut className="w-5 h-5 text-slate-600 group-hover:text-rose-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Hero Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 lg:mb-12 overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
              {/* Profile Photo with Glow */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative w-32 h-32 lg:w-40 lg:h-40">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover border-4 border-white shadow-2xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border-4 border-white shadow-2xl">
                      <User className="w-16 h-16 lg:w-20 lg:h-20 text-white" />
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-3 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200">
                      <Camera className="w-5 h-5 text-slate-900" />
                      <input type="file" accept="image/*" className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center lg:text-left text-white">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">{formData.name}</h1>
                    <p className="text-slate-300 flex items-center justify-center lg:justify-start gap-2">
                      <Mail className="w-4 h-4" />
                      {formData.email}
                    </p>
                  </div>

                  {/* Edit Toggle Button */}
                  <motion.button
                    onClick={() => setIsEditing(!isEditing)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 ${
                      isEditing
                        ? "bg-white text-slate-900"
                        : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <X className="w-5 h-5" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-5 h-5" />
                        Edit Profile
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  <span className="px-4 py-2 bg-emerald-500/20 backdrop-blur-sm text-emerald-300 rounded-full text-sm font-medium border border-emerald-500/30">
                    ✓ Active
                  </span>
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/20">
                    Member since Jan 2024
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modern Tab Navigation */}
        <div className="mb-8">
          <div className="flex gap-2 p-2 bg-white rounded-2xl shadow-lg border border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 lg:p-10"
          >
            {activeTab === "personal" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      disabled={!isEditing}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        isEditing
                          ? "border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600"
                      />
                      <span className="absolute right-3 top-3 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        Verified
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Phone</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      disabled={!isEditing}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        isEditing
                          ? "border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Secondary Phone</label>
                    <input
                      type="tel"
                      value={formData.secondaryPhoneNumber}
                      disabled={!isEditing}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryPhoneNumber: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        isEditing
                          ? "border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "address" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Address Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">State</label>
                    <select
                      value={formData.address.state}
                      disabled={!isEditing}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value, city: '' }
                      }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        isEditing
                          ? "border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      <option value="">Select State</option>
                      {Object.keys(statesAndCities).map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                    <select
                      value={formData.address.city}
                      disabled={!isEditing || !formData.address.state}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        isEditing
                          ? "border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      <option value="">Select City</option>
                      {formData.address.state && statesAndCities[formData.address.state]?.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">PIN Code</label>
                    <input
                      type="text"
                      value={formData.address.pinCode}
                      disabled={!isEditing}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, pinCode: e.target.value }
                      }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        isEditing
                          ? "border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Address</label>
                  <textarea
                    value={formData.address.fullAddress}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, fullAddress: e.target.value }
                    }))}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 resize-none ${
                      isEditing
                        ? "border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  />
                </div>
              </div>
            )}

            {activeTab === "interests" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Interests</h2>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  {formData.interests.map((interest, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-full font-medium shadow-lg"
                    >
                      {interest}
                      {isEditing && (
                        <button
                          onClick={() => removeInterest(interest)}
                          className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </motion.span>
                  ))}
                </div>

                {isEditing && (
                  <>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add custom interest..."
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newInterest.trim()) {
                            addInterest(newInterest.trim());
                            setNewInterest('');
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (newInterest.trim()) {
                            addInterest(newInterest.trim());
                            setNewInterest('');
                          }
                        }}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-3">Popular Interests:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {popularInterests.map((interest) => (
                          <button
                            key={interest}
                            onClick={() => addInterest(interest)}
                            disabled={formData.interests.includes(interest)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              formData.interests.includes(interest)
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-slate-50 text-slate-700 hover:bg-slate-900 hover:text-white border-2 border-slate-200 hover:border-slate-900"
                            }`}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Floating Save Button */}
        <AnimatePresence>
          {isEditing && (
            <motion.button
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="fixed bottom-8 right-8 p-5 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-full shadow-2xl hover:shadow-slate-500/50 transition-all duration-300 z-50 group"
            >
              <Check className="w-7 h-7 group-hover:rotate-12 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}