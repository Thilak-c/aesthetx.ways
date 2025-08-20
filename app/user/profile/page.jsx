"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Camera, Edit3, Save, X, User, MapPin, Phone, Heart, Mail, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  
  const [token, setToken] = useState(null);
  const [isClient, setIsClient] = useState(false);
  
  const me = useQuery(api.users.meByToken, { token: token || "" });
  const updateProfile = useMutation(api.users.updateUserProfile);
  
  const [isEditing, setIsEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    address: {
      state: "",
      city: "",
      pinCode: "",
      fullAddress: ""
    },
    interests: [],
    photoUrl: ""
  });

  // States and cities data
  const statesAndCities = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tezu", "Ziro"],
    "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    "Haryana": ["Gurgaon", "Faridabad", "Chandigarh", "Panipat", "Hisar"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Kullu", "Solan"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
    "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Ukhrul"],
    "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongstoin", "Williamnagar"],
    "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Serchhip"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur"],
    "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer"],
    "Sikkim": ["Gangtok", "Namchi", "Mangan", "Gyalshing", "Lachung"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Vellore"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
    "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar", "Belonia"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Roorkee"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"]
  };

  // Get session token from cookies (client-side only)
  useEffect(() => {
    setIsClient(true);
    const getSessionToken = () => {
      const match = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
      return match ? match[1] : null;
    };
    
    const sessionToken = getSessionToken();
    setToken(sessionToken);
  }, []);

  useEffect(() => {
    if (me) {
      setFormData({
        name: me.name || "",
        phoneNumber: me.phoneNumber || "",
        secondaryPhoneNumber: me.secondaryPhoneNumber || "",
        address: me.address && typeof me.address === 'object' ? me.address : {
          state: "",
          city: "",
          pinCode: "",
          fullAddress: me.address || "" // Handle old string format
        },
        interests: me.interests || [],
        photoUrl: me.photoUrl || ""
      });
      setPreviewUrl(me.photoUrl || "");
    }
  }, [me]);

  // Redirect to login if no session token
  useEffect(() => {
    if (isClient && !token) {
      router.push('/login');
    }
  }, [token, router, isClient]);

  // Show loading while client is initializing
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!me) {
    // Check if we have a token but no user (invalid/expired session)
    if (token) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading your profile...</p>
            <p className="text-white/60 text-sm mt-2">Please wait while we fetch your information</p>
          </div>
        </div>
      );
    } else {
      // No token, redirect to login
      router.push('/login');
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Redirecting to login...</p>
          </div>
        </div>
      );
    }
  }

  // Check if user is deleted or inactive
  if (me.isDeleted || me.isActive === false) {
    router.push('/login');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirecting to login...</p>
          <p className="text-white/60 text-sm mt-2">Your account is not active</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
    setSelectedFile(null);
    setPreviewUrl(formData.photoUrl || "");
    // Reset form data to original values
    if (me) {
      setFormData({
        name: me.name || "",
        phoneNumber: me.phoneNumber || "",
        secondaryPhoneNumber: me.secondaryPhoneNumber || "",
        address: me.address && typeof me.address === 'object' ? me.address : {
          state: "",
          city: "",
          pinCode: "",
          fullAddress: me.address || ""
        },
        interests: me.interests || [],
        photoUrl: me.photoUrl || ""
      });
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;

    try {
      setBusy(true);
      
      // For now, we'll use a simple approach with base64
      // In production, you'd want to upload to a service like Cloudinary, AWS S3, etc.
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target.result;
        
        // Update the form data with the new photo
        setFormData(prev => ({
          ...prev,
          photoUrl: base64String
        }));
        
        toast.success('Photo updated successfully!');
        setSelectedFile(null);
      };
      reader.readAsDataURL(selectedFile);
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setBusy(true);
      setError("");

      await updateProfile({
        userId: me._id,
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber || undefined,
        secondaryPhoneNumber: formData.secondaryPhoneNumber || undefined,
        address: formData.address.state ? formData.address : undefined,
        interests: formData.interests,
        photoUrl: formData.photoUrl || undefined,
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
      toast.error("Failed to update profile");
    } finally {
      setBusy(false);
    }
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        state: newState,
        city: '', // Reset city when state changes
        pinCode: prev.address?.pinCode || '',
        fullAddress: prev.address?.fullAddress || ''
      }
    }));
  };

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        city: newCity
      }
    }));
  };

  const handlePinCodeChange = (e) => {
    const newPinCode = e.target.value;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        pinCode: newPinCode
      }
    }));
  };

  const handleFullAddressChange = (e) => {
    const newFullAddress = e.target.value;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        fullAddress: newFullAddress
      }
    }));
  };

  const addInterest = () => {
    const interest = newInterest.trim();
    if (interest && !formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
      setNewInterest("");
      toast.success(`Added "${interest}" to your interests!`);
    }
  };

  const removeInterest = (interestToRemove) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
    toast.success(`Removed "${interestToRemove}" from your interests!`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setBusy(true);
      setError("");

      await updateProfile({
        userId: me._id,
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber || undefined,
        secondaryPhoneNumber: formData.secondaryPhoneNumber || undefined,
        address: formData.address.state ? formData.address : undefined,
        interests: formData.interests,
        photoUrl: formData.photoUrl || undefined,
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
      toast.error("Failed to update profile");
    } finally {
      setBusy(false);
    }
  };

  const addInterestFromList = (interest) => {
    if (!formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
      toast.success(`Added "${interest}" to your interests!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-2xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo/Brand */}
            <Link href="/">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo.png" 
                alt="AesthetX Logo" 
                className="h-12 object-contain drop-shadow-sm"
                />
             
            </div>
                </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-2">
              <Link
                href="/user/profile"
                className="px-6 py-3 rounded-xl text-gray-900 bg-gradient-to-r from-gray-100 to-gray-200 font-semibold transition-all duration-300 hover:from-gray-200 hover:to-gray-300 hover:scale-105 shadow-sm border border-gray-200/50"
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </div>
              </Link>
              <Link
                href="/user/settings"
                className="px-6 py-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 font-semibold transition-all duration-300 hover:scale-105 border border-transparent hover:border-gray-200/50"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </div>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
                <div className="flex items-center space-x-2">
                  {me.photoUrl ? (
                    <img 
                      src={me.photoUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {me.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 leading-tight">
                      {me.email}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Mobile User Menu */}
              <div className="md:hidden">
                {me.photoUrl ? (
                  <img 
                    src={me.photoUrl} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center border-2 border-gray-200 shadow-sm">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Profile Settings</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your personal information, preferences, and account details
          </p>
        </div>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Photo & Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Photo Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Profile Photo</h3>
                
                {/* Current Photo Display */}
                <div className="relative mb-6">
                  {me.photoUrl ? (
                    <img
                      src={me.photoUrl}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-200 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full mx-auto border-4 border-gray-200 shadow-lg flex items-center justify-center">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                  
                  {/* Upload Status Indicator */}
                  {previewUrl && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-medium rounded-xl cursor-pointer hover:from-gray-800 hover:to-gray-900 transition-all duration-200 hover:scale-105 shadow-md"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Upload Photo
                  </label>
                  
                  {selectedFile && (
                    <button
                      onClick={handlePhotoUpload}
                      className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 hover:scale-105 shadow-md"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Photo
                    </button>
                  )}
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-20 h-20 rounded-lg object-cover mx-auto border border-gray-300"
                    />
                  </div>
                )}

                {/* Instructions */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    Supported formats: JPG, PNG, GIF<br />
                    Max size: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {me.createdAt ? new Date(me.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">
                    {me.updatedAt ? new Date(me.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    isEditing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 hover:scale-105'
                  } shadow-sm`}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {/* Name Field */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                        isEditing
                          ? 'border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                      } focus:outline-none`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={me.email || ''}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Phone
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                        isEditing
                          ? 'border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                      } focus:outline-none`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Phone
                    </label>
                    <input
                      type="tel"
                      name="secondaryPhoneNumber"
                      value={formData.secondaryPhoneNumber || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryPhoneNumber: e.target.value }))}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                        isEditing
                          ? 'border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                      } focus:outline-none`}
                      placeholder="+1 (555) 987-6543"
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Address Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <select
                        name="state"
                        value={formData.address?.state || ''}
                        onChange={handleStateChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          isEditing
                            ? 'border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200'
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        } focus:outline-none`}
                      >
                        <option value="">Select State</option>
                        {Object.keys(statesAndCities).map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <select
                        name="city"
                        value={formData.address?.city || ''}
                        onChange={handleCityChange}
                        disabled={!isEditing || !formData.address?.state}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          isEditing
                            ? 'border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200'
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <option value="">{formData.address?.state ? "Select City" : "Select State First"}</option>
                        {formData.address?.state && statesAndCities[formData.address.state]?.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        name="pinCode"
                        value={formData.address?.pinCode || ''}
                        onChange={handlePinCodeChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          isEditing
                            ? 'border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200'
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        } focus:outline-none`}
                        placeholder="123456"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Address
                    </label>
                    <textarea
                      name="fullAddress"
                      value={formData.address?.fullAddress || ''}
                      onChange={handleFullAddressChange}
                      disabled={!isEditing}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                        isEditing
                          ? 'border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                      } focus:outline-none resize-none`}
                      placeholder="Enter your complete address"
                    />
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-medium rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-200 hover:scale-105 shadow-md"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Interests & Preferences Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Interests & Preferences</h3>
              
              <div className="space-y-6">
                {/* Current Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Your Interests
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.interests && formData.interests.length > 0 ? (
                      formData.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded-lg border border-gray-200"
                        >
                          {interest}
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeInterest(interest)}
                              className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No interests selected yet</p>
                    )}
                  </div>
                </div>

                {/* Add New Interest */}
                {isEditing && (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add a new interest"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={addInterest}
                        disabled={!newInterest.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-medium rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-200 hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>

                    {/* Quick Add Options */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Quick Add Options:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          "Baggy Shirts", "Oversized T-Shirts", "Crop Tops", "High Waist Jeans", "Low Rise Pants", "Mom Jeans", "Dad Sneakers", "Chunky Sneakers", "Platform Shoes",
                          "Y2K Fashion", "Vintage", "Retro", "Street Style", "Hip Hop", "Skater Style", "Grunge", "Punk", "Goth", "Emo", "Chokers", "Oversized Hoodies", "Baggy Pants",
                          "Cargo Pants", "Athleisure", "Streetwear", "Trendy Dresses", "Mini Skirts", "Micro Shorts", "Tank Tops", "Tube Tops", "Bralettes", "Mesh Tops", "Fishnet",
                          "Leather Jackets", "Denim Jackets", "Oversized Blazers", "Trendy Accessories", "Chain Necklaces", "Hoop Earrings", "Statement Rings", "Trendy Bags", "Crossbody Bags"
                        ].map((interest) => (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => addInterestFromList(interest)}
                            disabled={formData.interests?.includes(interest)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                              formData.interests?.includes(interest)
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:scale-105'
                            }`}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequireLogin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-200 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
        <Link 
          href="/login"
          className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-black transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

function getSessionToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
} 