"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  User, 
  MapPin, 
  Phone, 
  Heart, 
  Mail, 
  Plus, 
  Upload,
  Camera,
  Edit3,
  Save,
  X,
  ChevronRight
} from "lucide-react";
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-900 text-lg font-medium">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!me) {
    // Check if we have a token but no user (invalid/expired session)
    if (token) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-900 text-lg font-medium">Loading your profile...</p>
            <p className="text-gray-600 text-sm mt-2">Please wait while we fetch your information</p>
          </div>
        </div>
      );
    } else {
      // No token, redirect to login
      router.push('/login');
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-900 text-lg font-medium">Redirecting to login...</p>
          </div>
        </div>
      );
    }
  }

  // Check if user is deleted or inactive
  if (me.isDeleted || me.isActive === false) {
    router.push('/login');
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-900 text-lg font-medium">Redirecting to login...</p>
          <p className="text-gray-600 text-sm mt-2">Your account is not active</p>
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
      
      // Compress large images to fit Convex's 1MB limit
      if (file.size > 1024 * 1024) { // If larger than 1MB
        compressImage(file, (compressedFile) => {
          setSelectedFile(compressedFile);
          createPreview(compressedFile);
          processPhoto(compressedFile);
          toast.success('Image compressed and ready to save!');
        });
      } else {
        setSelectedFile(file);
        createPreview(file);
        processPhoto(file);
      }
    }
  };

  const processPhoto = (file) => {
    // Convert file to base64 and update form data automatically
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target.result;
      
      // Update the form data with the new photo
      setFormData(prev => ({
        ...prev,
        photoUrl: base64String
      }));
      
      // Also update the preview immediately
      setPreviewUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const createPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (file, callback) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 800x800 to keep file size small)
      let { width, height } = img;
      const maxSize = 800;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with quality 0.7 (70%)
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        callback(compressedFile);
      }, 'image/jpeg', 0.7);
    };
    
    img.src = URL.createObjectURL(file);
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

  const addInterestFromList = (interest) => {
    if (!formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
      toast.success(`Added "${interest}" to your interests!`);
    }
  };

  const profileSections = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Manage your basic profile details',
      icon: User,
      content: (
        <div className="space-y-4 lg:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
                className={`w-full px-4 py-3 lg:py-4 rounded-xl border transition-all duration-200 text-sm lg:text-base ${
                  isEditing
                    ? 'border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                } focus:outline-none`}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={me.email || ''}
                disabled
                className="w-full px-4 py-3 lg:py-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed text-sm lg:text-base"
              />
              <p className="text-xs lg:text-sm text-gray-500 mt-1 lg:mt-2">Email cannot be changed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
                Primary Phone
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                disabled={!isEditing}
                className={`w-full px-4 py-3 lg:py-4 rounded-xl border transition-all duration-200 text-sm lg:text-base ${
                  isEditing
                    ? 'border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                } focus:outline-none`}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
                Secondary Phone
              </label>
              <input
                type="tel"
                name="secondaryPhoneNumber"
                value={formData.secondaryPhoneNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, secondaryPhoneNumber: e.target.value }))}
                disabled={!isEditing}
                className={`w-full px-4 py-3 lg:py-4 rounded-xl border transition-all duration-200 text-sm lg:text-base ${
                  isEditing
                    ? 'border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                } focus:outline-none`}
                placeholder="+1 (555) 987-6543"
              />
            </div>
          </div>

          {isEditing && formData.photoUrl !== me.photoUrl && (
            <div className="pt-4 lg:pt-6 border-t border-gray-200">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  📸 A new profile photo has been selected and will be saved with your changes.
                </p>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'address',
      title: 'Address Information',
      description: 'Manage your location and address details',
      icon: MapPin,
      content: (
        <div className="space-y-4 lg:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
                State
              </label>
              <select
                name="state"
                value={formData.address?.state || ''}
                onChange={handleStateChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 lg:py-4 rounded-xl border transition-all duration-200 text-sm lg:text-base ${
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
              <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
                City
              </label>
              <select
                name="city"
                value={formData.address?.city || ''}
                onChange={handleCityChange}
                disabled={!isEditing || !formData.address?.state}
                className={`w-full px-4 py-3 lg:py-4 rounded-xl border transition-all duration-200 text-sm lg:text-base ${
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
              <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
                PIN Code
              </label>
              <input
                type="text"
                name="pinCode"
                value={formData.address?.pinCode || ''}
                onChange={handlePinCodeChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 lg:py-4 rounded-xl border transition-all duration-200 text-sm lg:text-base ${
                  isEditing
                    ? 'border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                } focus:outline-none`}
                placeholder="123456"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
              Full Address
            </label>
            <textarea
              name="fullAddress"
              value={formData.address?.fullAddress || ''}
              onChange={handleFullAddressChange}
              disabled={!isEditing}
              rows={3}
              className={`w-full px-4 py-3 lg:py-4 rounded-xl border transition-all duration-200 text-sm lg:text-base ${
                isEditing
                  ? 'border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              } focus:outline-none resize-none`}
              placeholder="Enter your complete address"
            />
          </div>
        </div>
      )
    },
    {
      id: 'interests',
      title: 'Interests & Preferences',
      description: 'Manage your personal interests and preferences',
      icon: Heart,
      content: (
        <div className="space-y-4 lg:space-y-5">
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-700 mb-3 lg:mb-4">
              Your Interests
            </label>
            <div className="flex flex-wrap gap-2 lg:gap-3 mb-4 lg:mb-6">
              {formData.interests && formData.interests.length > 0 ? (
                formData.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-2 lg:px-4 lg:py-2.5 bg-gray-100 text-gray-800 text-sm lg:text-base font-medium rounded-lg border border-gray-200"
                  >
                    {interest}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm lg:text-base">No interests selected yet</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="space-y-4 lg:space-y-6">
              <div className="flex gap-3 lg:gap-4">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add a new interest"
                  className="flex-1 px-4 py-3 lg:py-4 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200 text-sm lg:text-base"
                />
                <button
                  type="button"
                  onClick={addInterest}
                  disabled={!newInterest.trim()}
                  className="px-6 py-3 lg:px-8 lg:py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
                >
                  Add
                </button>
              </div>

              <div>
                <p className="text-sm lg:text-base font-medium text-gray-700 mb-3 lg:mb-4">Quick Add Options:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-3">
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
                      className={`px-3 py-2 lg:px-4 lg:py-2.5 text-sm lg:text-base font-medium rounded-lg border transition-all duration-200 ${
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
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo/Brand */}
            <Link href="/">
              <div className="flex items-center space-x-3">
                <img 
                  src="/logo.png" 
                  alt="AesthetX Logo" 
                  className="h-8 lg:h-12 object-contain"
                />
              </div>
            </Link>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Link
                href="/user/profile"
                className="px-4 py-2 lg:px-6 lg:py-3 rounded-lg lg:rounded-xl text-gray-900 bg-gray-100 font-medium transition-all duration-200 text-sm lg:text-base"
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="hidden sm:inline">Profile</span>
                </div>
              </Link>
              <Link
                href="/user/settings"
                className="px-4 py-2 lg:px-6 lg:py-3 rounded-lg lg:rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium transition-all duration-200 text-sm lg:text-base"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden sm:inline">Settings</span>
                </div>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 lg:px-4 lg:py-3 bg-gray-100 rounded-lg lg:rounded-xl">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  {me.photoUrl ? (
                    <img 
                      src={me.photoUrl} 
                      alt="Profile" 
                      className="w-6 h-6 lg:w-8 lg:h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-600 rounded-full flex items-center justify-center border border-gray-200">
                      <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs lg:text-sm font-medium text-gray-900 leading-tight">
                      {me.name || "User"}
                    </p>
                    <p className="hidden lg:block text-xs text-gray-600 leading-tight">
                      {me.email}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Mobile User Menu */}
              <div className="sm:hidden">
                {me.photoUrl ? (
                  <img 
                    src={me.photoUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center border border-gray-200">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

   
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* User Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 lg:p-12 mb-12 lg:mb-16 overflow-hidden relative"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full -mr-16 -mt-16 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-50 to-gray-100 rounded-full -ml-12 -mb-12 opacity-60"></div>
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Profile Photo */}
            <div className="relative">
              {me.photoUrl ? (
                <img
                  src={me.photoUrl}
                  alt="Profile"
                  className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-gray-100 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border-4 border-gray-100 shadow-sm flex items-center justify-center">
                  <User className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-center lg:text-left flex-1">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-6">
  {/* User Name */}
  <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2 lg:mb-0">
    {me.name || "User"}
  </h2>

  {/* Edit Button */}
  <motion.button
    onClick={() => setIsEditing(!isEditing)}
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    className={`relative px-6 py-2 lg:px-10 lg:py-4 rounded-2xl font-semibold 
                text-sm lg:text-base transition-all duration-300 shadow-lg 
                overflow-hidden group ${
                  isEditing
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                    : "bg-gradient-to-r from-gray-900 to-black text-white hover:from-black hover:to-gray-900"
                }`}
  >
    {/* Hover background overlay */}
    <div
      className={`absolute inset-0 bg-gradient-to-r ${
        isEditing ? "from-red-400 to-red-500" : "from-gray-800 to-gray-900"
      } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
    />

    {/* Button Text */}
    <div className=" text text-center items-center space-x-2">
      <span>{isEditing ? "Exit Edit" : "Edit Profile"}</span>
    </div>

    {/* Ripple Effect on toggle */}
    {isEditing && (
      <motion.div
        key="ripple"
        className="absolute inset-0 bg-white opacity-20 rounded-2xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 0], opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.6 }}
      />
    )}
  </motion.button>
</div>

              
              <p className="text-gray-600 flex items-center justify-center lg:justify-start space-x-2 text-sm lg:text-base mb-4 lg:mb-6">
                <Mail className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>{me.email}</span>
              </p>
              
              {/* Account Status */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                <span className="px-3 py-1 lg:px-4 lg:py-2 bg-green-100 text-green-800 text-xs lg:text-sm font-medium rounded-full">
                  Active
                </span>
                <span className="px-3 py-1 lg:px-4 lg:py-2 bg-gray-100 text-gray-700 text-xs lg:text-sm font-medium rounded-full">
                  Member since {me.createdAt ? new Date(me.createdAt).toLocaleDateString() : 'N/A'}
                </span>
                <span className="px-3 py-1 lg:px-4 lg:py-2 bg-blue-100 text-blue-800 text-xs lg:text-sm font-medium rounded-full">
                  Last updated {me.updatedAt ? new Date(me.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              {/* Photo Upload Section */}
              {isEditing && (
                <div className="mt-6 lg:mt-8 space-y-3 lg:space-y-4">
                  <div className="text-center lg:text-left">
                    <p className="text-sm lg:text-base text-gray-600 mb-3 lg:mb-4">
                      Select a new profile photo. It will be automatically processed and ready to save.
                    </p>
                  </div>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center px-6 py-3 lg:px-8 lg:py-4 bg-gray-900 text-white font-medium rounded-xl cursor-pointer hover:bg-black transition-all duration-200 text-sm lg:text-base"
                  >
                    <Camera className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
                    Choose Photo
                  </label>
                  
                  {selectedFile && (
                    <div className="flex items-center space-x-3">

                      
                    </div>
                  )}

                  {/* Preview */}
                  {previewUrl && (
                    <div className="mt-4 lg:mt-6 p-4 lg:p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">Preview:</p>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover mx-auto border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:mb-16">
          {profileSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + (index * 0.1) }}
              className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group"
            >
              {/* Section Header */}
              <div className="p-8 lg:p-10 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center space-x-5">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg group-hover:from-gray-300 group-hover:to-gray-400 transition-all duration-300">
                    <section.icon className="w-7 h-7 lg:w-8 lg:h-8 text-gray-700 group-hover:text-gray-800 transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">{section.title}</h3>
                    <p className="text-gray-600 text-base lg:text-lg font-medium">{section.description}</p>
                  </div>
                </div>
              </div>

              {/* Section Content */}
              <div className="p-8 lg:p-10">
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fixed Save Buttons at Bottom Right */}
        {isEditing && (
          <>
            {/* Add bottom padding to prevent overlap */}
            <div className="h-24 lg:h-28"></div>
            
            {/* Floating Save Button at Bottom Right */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              className="fixed bottom-6 right-6 z-[9999]"
            >
               <div className="flex flex-col space-y-4">
               <motion.button
  type="button"
  onClick={handleSave}
  disabled={busy}
  whileHover={!busy ? { scale: 1.05, y: -2 } : {}}
  whileTap={
    busy
      ? { x: [0, -5, 5, -5, 5, 0] } // shake if disabled
      : { scale: 0.95 }
  }
  className="
    relative 
    px-6 py-2 text-sm      /* small size on phones */
    md:px-8 md:py-3 md:text-base 
    lg:px-10 lg:py-4 lg:text-lg 
    flex items-center justify-center
    border border-black/20
    bg-gradient-to-r from-gray-800 to-gray-900
    text-white font-semibold rounded-2xl
    hover:from-black hover:to-gray-900
    transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    shadow-md hover:shadow-lg
    overflow-hidden
  "
>
  {busy ? (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span>Saving...</span>
    </div>
  ) : (
    "Save Changes"
  )}
</motion.button>

    </div>
              
         
             
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
} 