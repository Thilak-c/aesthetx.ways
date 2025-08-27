"use client";
import {
  Search,
  Instagram,
  Youtube,
  Users,
  Globe,
  Megaphone,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import {
  INDIAN_STATES,
  validatePhoneNumber,
  validatePinCode,
} from "@/lib/indianStates";

const getSessionToken = () => {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
};

function ProgressBar({ step, total }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
      <motion.div
        className="h-full bg-gradient-to-r from-gray-700 to-black rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

const stepVariants = {
  initial: { opacity: 0, x: 30, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -30, scale: 0.95 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ALL_INTERESTS = [
  "Baggy Shirts",
  "Oversized T-Shirts",
  "Crop Tops",
  "High Waist Jeans",
  "Low Rise Pants",
  "Mom Jeans",
  "Dad Sneakers",
  "Chunky Sneakers",
  "Platform Shoes",
  "Y2K Fashion",
  "Vintage",
  "Retro",
  "Street Style",
  "Hip Hop",
  "Skater Style",
  "Grunge",
  "Punk",
  "Goth",
  "Emo",
  "Chokers",
  "Oversized Hoodies",
  "Baggy Pants",
  "Cargo Pants",
  "Athleisure",
  "Streetwear",
  "Trendy Dresses",
  "Mini Skirts",
  "Micro Shorts",
  "Tank Tops",
  "Tube Tops",
  "Bralettes",
  "Mesh Tops",
  "Fishnet",
  "Leather Jackets",
  "Denim Jackets",
  "Oversized Blazers",
  "Trendy Accessories",
  "Chain Necklaces",
  "Hoop Earrings",
  "Statement Rings",
  "Trendy Bags",
  "Crossbody Bags",
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const REFERRAL_SOURCES = [
  { label: "Google", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }, // search icon
  { label: "Instagram", icon: "M7 20h10a2 2 0 002-2V6a2 2 0..." }, // camera icon
  { label: "Friend", icon: "M17 20h5V4H2v16h5m10-6h6" }, // user icon
  { label: "Facebook", icon: "M18 2h-3a5 5..." },
  { label: "Other", icon: "M12 20h9" },
];

export default function Onboarding() {
  const router = useRouter();
  const token = getSessionToken();
  const me = useQuery(api.users.meByToken, token ? { token } : "skip");
  const ob = useQuery(
    api.users.getOnboarding,
    me?._id ? { userId: me._id } : "skip"
  );

  const saveProfile = useMutation(api.users.saveProfile);
  const savePhoneAndAddress = useMutation(api.users.savePhoneAndAddress);
  const setStep = useMutation(api.users.setOnboardingStep);
  const complete = useMutation(api.users.completeOnboarding);

  const [photoUrl, setPhotoUrl] = useState("");
  const [interests, setInterests] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Address and phone state
  const [selectedState, setSelectedState] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");

  // Referral source
  const [referralSource, setReferralSource] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = useMemo(() => ob?.onboardingStep || 1, [ob]);
  const totalSteps = 4;

  useEffect(() => {
    if (me === undefined) return;
    if (!me) {
      router.push("/login");
      return;
    }
    if (ob?.onboardingCompleted) router.push("/");

    const ls = JSON.parse(localStorage.getItem("ob-cache") || "{}");
    setPhotoUrl(ob?.photoUrl ?? ls.photoUrl ?? "");
    setInterests(ob?.interests ?? ls.interests ?? []);

    // Load existing data
    if (ob?.phoneNumber && !ob?.phoneNumberLocked) {
      setPhoneNumber(ob.phoneNumber);
    }
    // Load address data from permanentAddress (backward compatibility) or address field
    if (ob?.permanentAddress && !ob?.permanentAddressLocked) {
      setSelectedState(ob.permanentAddress.state || "");
      setCity(ob.permanentAddress.city || "");
      setPinCode(ob.permanentAddress.pinCode || "");
      setFullAddress(ob.permanentAddress.fullAddress || "");
    } else if (ob?.address) {
      setSelectedState(ob.address.state || "");
      setCity(ob.address.city || "");
      setPinCode(ob.address.pinCode || "");
      setFullAddress(ob.address.fullAddress || "");
    }
  }, [me, ob, router]);

  useEffect(() => {
    localStorage.setItem("ob-cache", JSON.stringify({ photoUrl, interests }));
  }, [photoUrl, interests]);

  if (me === undefined || ob === undefined) return null;

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (data?.url) setPhotoUrl(data.url);
  };

  const nextFromProfile = async () => {
    if (!photoUrl) {
      toast.error("Please upload a profile picture");
      return;
    }
    await saveProfile({ userId: me._id, photoUrl, interests });
    await setStep({ userId: me._id, step: 2 });
  };

  const nextFromSizeInterests = async () => {
    if (selectedSizes.length === 0) {
      toast.error("Please select at least one size");
      return;
    }
    if (interests.length === 0) {
      toast.error("Please select at least one interest");
      return;
    }
    await saveProfile({ userId: me._id, interests, selectedSizes });
    await setStep({ userId: me._id, step: 3 });
  };

  const validateAndSaveAddress = async () => {
    setIsSubmitting(true);
    setErrors({});

    const newErrors = {};

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      newErrors.phoneNumber = phoneValidation.message;
    }

    // Validate state
    if (!selectedState.trim()) {
      newErrors.state = "Please select a state";
    }

    // Validate city
    if (!city.trim()) {
      newErrors.city = "Please enter your city";
    }

    // Validate PIN code
    const pinValidation = validatePinCode(pinCode);
    if (!pinValidation.isValid) {
      newErrors.pinCode = pinValidation.message;
    }

    // Validate full address
    if (!fullAddress.trim()) {
      newErrors.fullAddress = "Please enter your full address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await savePhoneAndAddress({
        userId: me._id,
        phoneNumber: phoneValidation.cleanPhone,
        secondaryPhoneNumber: secondaryPhone,
        state: selectedState,
        city: city.trim(),
        pinCode: pinValidation.cleanPin,
        fullAddress: fullAddress.trim(),
      });
      await setStep({ userId: me._id, step: 4 });
    } catch (error) {
      setErrors({ submit: error.message });
      toast.error(error.message || "Failed to save contact details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finish = async () => {
    if (!referralSource) {
      toast.error("Please select how you found us");
      return;
    }
    await complete({ userId: me._id, referralSource });
    confetti({ particleCount: 160, spread: 70, origin: { y: 0.6 } });
    localStorage.removeItem("ob-cache");
    setTimeout(() => router.push("/"), 350);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 md:p-4 p-2 flex justify-center items-start">
      <motion.div
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-4 space-y-8"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Image src="/logo.png" alt="AesthetX" width={150} height={100} />
          </div>

          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-gray-500">
              Step {step} of {totalSteps}
            </span>
          </div>
        </motion.div>

        <ProgressBar step={step} total={totalSteps} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="s1"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-gray-600">
                  Upload a photo so we can recognize you
                </p>
              </motion.div>

              <motion.div
                className="flex flex-col items-center space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  className="relative"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {photoUrl ? (
                    <div className="relative">
                      <motion.img
                        src={photoUrl}
                        alt="Profile preview"
                        className="w-40 h-40 rounded-full object-cover border-4 border-blue-100 shadow-2xl"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                      />
                      <motion.button
                        onClick={() => setPhotoUrl("")}
                        className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <span className="text-lg">×</span>
                      </motion.button>
                    </div>
                  ) : (
                    <motion.div
                      className="w-40 h-40 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50"
                      whileHover={{ scale: 1.05, borderColor: "#3B82F6" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center">
                        <motion.div
                          className="text-6xl text-gray-400 mb-2"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <svg
                            className="w-14 h-14 text-black"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </motion.div>
                        <div className="text-sm text-gray-500">No photo</div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div className="space-y-4" variants={itemVariants}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <motion.label
                    htmlFor="photo-upload"
                    className="inline-flex items-center px-12 py-[10px] bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all cursor-pointer shadow-lg"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    {photoUrl ? "Change" : "Upload"}
                  </motion.label>
                </motion.div>
              </motion.div>

              <motion.div
                className="flex justify-center"
                variants={itemVariants}
              >
                <motion.button
                  onClick={nextFromProfile}
                  disabled={!photoUrl}
                  className="px-10 py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium shadow-xl"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!photoUrl}
                >
                  Continue
                  <svg
                    className="w-5 h-5 ml-2 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6 px-4"
            >
              {/* Header */}
              <motion.div
                className="text-center space-y-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-r from-gray-700 to-black rounded-full flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </motion.div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Size & Style
                  </h2>
                </div>
                <p className="text-sm text-gray-600">
                  Choose your perfect fits
                </p>
              </motion.div>

              {/* Sizes */}
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div className="space-y-3" variants={itemVariants}>
                  <div className="flex items-center space-x-2 mb-2">
                    <svg
                      className="w-5 h-5 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <h3 className="text-base font-medium text-gray-800">
                      Your Size
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {SIZES.map((size, index) => (
                      <motion.button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSizes((prev) =>
                            prev.includes(size)
                              ? prev.filter((s) => s !== size)
                              : [...prev, size]
                          );
                        }}
                        className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                          selectedSizes.includes(size)
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Interests */}
                <motion.div className="space-y-3" variants={itemVariants}>
                  <div className="flex items-center space-x-2 mb-2">
                    <svg
                      className="w-5 h-5 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                    <h3 className="text-base font-medium text-gray-800">
                      Your Style
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_INTERESTS.map((tag, index) => (
                      <motion.button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setInterests((prev) =>
                            prev.includes(tag)
                              ? prev.filter((t) => t !== tag)
                              : [...prev, tag]
                          )
                        }
                        className={`px-3 py-2 text-sm rounded-lg border transition ${
                          interests.includes(tag)
                            ? "bg-blue-100 text-blue-700 border-blue-300"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        {tag}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>

              {/* Continue button */}
              <motion.div
                className="flex justify-center"
                variants={itemVariants}
              >
                <motion.button
                  onClick={nextFromSizeInterests}
                  disabled={
                    selectedSizes.length === 0 || interests.length === 0
                  }
                  className="w-full py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg text-base font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue
                  <svg
                    className="w-4 h-4 ml-1 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="s3"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6 px-4"
            >
              {/* Header */}
              <motion.div
                className="text-center space-y-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-r from-gray-700 to-black rounded-full flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </motion.div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Contact & Address
                  </h2>
                </div>
                <p className="text-sm text-gray-600">
                  We’ll use this for deliveries and updates
                </p>
              </motion.div>

              {/* Form */}
              <motion.div
                className="space-y-5"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* State + City */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  variants={itemVariants}
                >
                  {/* State */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span>State *</span>
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value);
                        if (errors.state)
                          setErrors((prev) => ({ ...prev, state: "" }));
                      }}
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        errors.state
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select a state</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-red-600 text-xs">{errors.state}</p>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span>City *</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (errors.city)
                          setErrors((prev) => ({ ...prev, city: "" }));
                      }}
                      placeholder="Enter your city"
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        errors.city
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-red-600 text-xs">{errors.city}</p>
                    )}
                  </div>
                </motion.div>

                {/* PIN + Phone */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  variants={itemVariants}
                >
                  {/* PIN */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span>PIN Code *</span>
                    </label>
                    <input
                      type="text"
                      value={pinCode}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        setPinCode(value);
                        if (errors.pinCode)
                          setErrors((prev) => ({ ...prev, pinCode: "" }));
                      }}
                      placeholder="6-digit PIN"
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        errors.pinCode
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      maxLength={6}
                    />
                    {errors.pinCode && (
                      <p className="text-red-600 text-xs">{errors.pinCode}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span>Main Phone *</span>
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setPhoneNumber(value);
                        if (errors.phoneNumber)
                          setErrors((prev) => ({ ...prev, phoneNumber: "" }));
                      }}
                      placeholder="10-digit number"
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        errors.phoneNumber
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      maxLength={10}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-600 text-xs">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Secondary Phone */}
                <motion.div className="space-y-2" variants={itemVariants}>
                  <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span>Secondary Phone (Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={secondaryPhone}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setSecondaryPhone(value);
                    }}
                    placeholder="Enter secondary phone"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    maxLength={10}
                  />
                </motion.div>

                {/* Full Address */}
                <motion.div className="space-y-2" variants={itemVariants}>
                  <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span>Full Address *</span>
                  </label>
                  <textarea
                    value={fullAddress}
                    onChange={(e) => {
                      setFullAddress(e.target.value);
                      if (errors.fullAddress)
                        setErrors((prev) => ({ ...prev, fullAddress: "" }));
                    }}
                    placeholder="House no., street, area, landmark"
                    rows={3}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none ${
                      errors.fullAddress
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.fullAddress && (
                    <p className="text-red-600 text-xs">{errors.fullAddress}</p>
                  )}
                </motion.div>
              </motion.div>

              {/* Continue Button */}
              <motion.div
                className="flex justify-center"
                variants={itemVariants}
              >
                <motion.button
                  onClick={validateAndSaveAddress}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg text-base font-medium shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <svg
                        className="w-4 h-4 ml-1 inline"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="s4"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              {/* Title */}
              <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-r from-gray-700 to-black rounded-full flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Search className="w-6 h-6 text-white" />
                  </motion.div>
                  <h2 className="md:text-3xl text-xl font-semibold text-gray-900">
                    How did you find us?
                  </h2>
                </div>
                <p className="text-gray-600">This helps us improve our reach</p>
              </motion.div>

              {/* Referral Source Options */}
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {REFERRAL_SOURCES.map((source, index) => (
                  <motion.button
                    key={source.label}
                    type="button"
                    onClick={() => setReferralSource(source.label)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                      referralSource === source.label
                        ? "border-purple-500 bg-purple-50 text-purple-700 scale-105 shadow-lg"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:scale-105"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {source.label}
                  </motion.button>
                ))}
              </motion.div>

              {/* Finish Button */}
              <motion.div
                className="flex justify-center"
                variants={itemVariants}
              >
                <motion.button
                  onClick={finish}
                  disabled={!referralSource}
                  className="px-10 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium shadow-xl flex items-center gap-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Complete Setup
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
