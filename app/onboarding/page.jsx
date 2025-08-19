"use client";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { INDIAN_STATES, validatePhoneNumber, validatePinCode } from "@/lib/indianStates";

const getSessionToken = () => {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
};

function ProgressBar({ step, total }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-black transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

const stepVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const ALL_INTERESTS = ["Streetwear", "Minimal", "Athleisure", "Techwear", "Eco", "Formal"];

export default function Onboarding() {
  const router = useRouter();
  const token = getSessionToken();
  const me = useQuery(api.users.meByToken, token ? { token } : "skip");
  const ob = useQuery(api.users.getOnboarding, me?._id ? { userId: me._id } : "skip");

  const saveProfile = useMutation(api.users.saveProfile);
  const savePhoneAndAddress = useMutation(api.users.savePhoneAndAddress);
  const setStep = useMutation(api.users.setOnboardingStep);
  const complete = useMutation(api.users.completeOnboarding);

  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [interests, setInterests] = useState([]);
  
  // Phone and address state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  
  // Validation errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const step = useMemo(() => ob?.onboardingStep || 1, [ob]);
  const totalSteps = 5;

  useEffect(() => {
    if (me === undefined) return;
    if (!me) {
      router.push("/login");
      return;
    }
    if (ob?.onboardingCompleted) router.push("/");

    const ls = JSON.parse(localStorage.getItem("ob-cache") || "{}");
    setName(ob?.name ?? ls.name ?? "");
    setPhotoUrl(ob?.photoUrl ?? ls.photoUrl ?? "");
    setInterests(ob?.interests ?? ls.interests ?? []);
    
    // Load phone and address data
    if (ob?.phoneNumber && !ob?.phoneNumberLocked) {
      setPhoneNumber(ob.phoneNumber);
    }
    if (ob?.permanentAddress && !ob?.permanentAddressLocked) {
      setSelectedState(ob.permanentAddress.state || "");
      setCity(ob.permanentAddress.city || "");
      setPinCode(ob.permanentAddress.pinCode || "");
      setFullAddress(ob.permanentAddress.fullAddress || "");
    }
  }, [me, ob, router]);

  useEffect(() => {
    localStorage.setItem("ob-cache", JSON.stringify({ name, photoUrl, interests }));
  }, [name, photoUrl, interests]);

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
    await saveProfile({ userId: me._id, name: (name || "").trim(), photoUrl, interests });
    await setStep({ userId: me._id, step: 2 });
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
        state: selectedState,
        city: city.trim(),
        pinCode: pinValidation.cleanPin,
        fullAddress: fullAddress.trim(),
      });
      setShowSuccessScreen(true);
      toast.success("Contact details saved successfully! 🎉");
      setTimeout(async () => {
        await setStep({ userId: me._id, step: 3 });
      }, 2000);
    } catch (error) {
      setErrors({ submit: error.message });
      toast.error(error.message || "Failed to save contact details");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const nextTour1 = async () => { await setStep({ userId: me._id, step: 4 }); };
  const nextTour2 = async () => { await setStep({ userId: me._id, step: 5 }); };
  const finish = async () => {
    await complete({ userId: me._id });
    confetti({ particleCount: 160, spread: 70, origin: { y: 0.6 } });
    localStorage.removeItem("ob-cache");
    setTimeout(() => router.push("/"), 350);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex justify-center items-start">
      <div className="w-full max-w-2xl bg-card text-card-foreground rounded-2xl shadow p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Getting started</h1>
          <span className="text-sm text-muted-foreground">{step}/{totalSteps}</span>
        </div>
        <ProgressBar step={step} total={totalSteps} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Set up your profile</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full border rounded px-3 py-2" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Avatar</label>
                    <div className="flex items-center gap-3">
                      <input type="file" accept="image/*" onChange={onUpload} />
                      {photoUrl ? <img src={photoUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" /> : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_INTERESTS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setInterests((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))}
                        className={`px-3 py-1 rounded-full border ${interests.includes(tag) ? "bg-black text-white" : "bg-transparent"}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button disabled={!name} onClick={nextFromProfile} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">Continue</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Contact & Address Details</h2>
                  <p className="text-sm text-muted-foreground">
                    {ob?.phoneNumberLocked ? 
                      "Your contact details are locked and cannot be changed." :
                      "This information will be locked after submission and cannot be changed later."
                    }
                  </p>
                </div>

                {ob?.phoneNumberLocked && ob?.permanentAddressLocked ? (
                  // Show locked state with current data
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone Number</label>
                        <p className="font-medium">{ob.phoneNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">State</label>
                        <p className="font-medium">{ob.permanentAddress?.state}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">City</label>
                        <p className="font-medium">{ob.permanentAddress?.city}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">PIN Code</label>
                        <p className="font-medium">{ob.permanentAddress?.pinCode}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Address</label>
                      <p className="font-medium">{ob.permanentAddress?.fullAddress}</p>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={nextTour1} className="px-4 py-2 rounded bg-black text-white">
                        Continue
                      </button>
                    </div>
                  </div>
                ) : showSuccessScreen ? (
                  // Show success screen
                  <motion.div 
                    className="text-center space-y-6 py-8"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <div className="text-6xl">✅</div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-green-700">Contact Details Saved!</h3>
                      <p className="text-sm text-muted-foreground">
                        Your phone number and permanent address have been securely saved and locked.
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    </div>
                  </motion.div>
                ) : (
                  // Show editable form
                  <div className="space-y-4">
                    {errors.submit && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {errors.submit}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number *</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhoneNumber(value);
                          if (errors.phoneNumber) setErrors(prev => ({ ...prev, phoneNumber: '' }));
                        }}
                        placeholder="Enter 10-digit mobile number"
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-colors ${
                          errors.phoneNumber ? 'border-red-300 bg-red-50' : ''
                        }`}
                        maxLength={10}
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-600 text-xs">{errors.phoneNumber}</p>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">State *</label>
                        <select
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value);
                            if (errors.state) setErrors(prev => ({ ...prev, state: '' }));
                          }}
                          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-colors ${
                            errors.state ? 'border-red-300 bg-red-50' : ''
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

                      <div className="space-y-2">
                        <label className="text-sm font-medium">City *</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value);
                            if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                          }}
                          placeholder="Enter your city"
                          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-colors ${
                            errors.city ? 'border-red-300 bg-red-50' : ''
                          }`}
                        />
                        {errors.city && (
                          <p className="text-red-600 text-xs">{errors.city}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">PIN Code *</label>
                      <input
                        type="text"
                        value={pinCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setPinCode(value);
                          if (errors.pinCode) setErrors(prev => ({ ...prev, pinCode: '' }));
                        }}
                        placeholder="Enter 6-digit PIN code"
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-colors ${
                          errors.pinCode ? 'border-red-300 bg-red-50' : ''
                        }`}
                        maxLength={6}
                      />
                      {errors.pinCode && (
                        <p className="text-red-600 text-xs">{errors.pinCode}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Address *</label>
                      <textarea
                        value={fullAddress}
                        onChange={(e) => {
                          setFullAddress(e.target.value);
                          if (errors.fullAddress) setErrors(prev => ({ ...prev, fullAddress: '' }));
                        }}
                        placeholder="Enter your complete address (house no., street, area, landmark)"
                        rows={3}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-colors resize-none ${
                          errors.fullAddress ? 'border-red-300 bg-red-50' : ''
                        }`}
                      />
                      {errors.fullAddress && (
                        <p className="text-red-600 text-xs">{errors.fullAddress}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={validateAndSaveAddress}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          'Save & Continue'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <TourCard title="Quick tip #1" subtitle="Use categories and filters to find styles instantly." cta="Next tip" onNext={nextTour1} />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <TourCard title="Quick tip #2" subtitle="Save favorites to build your personal collection." cta="One more" onNext={nextTour2} />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" variants={stepVariants} initial="initial" animate="animate" exit="exit">
              <div className="space-y-4 text-center">
                <h2 className="text-2xl font-bold">You're all set 🎉</h2>
                <p className="text-muted-foreground">We built a dashboard just for you.</p>
                <button onClick={finish} className="px-5 py-2 rounded bg-black text-white">Go to dashboard</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TourCard({ title, subtitle, cta, onNext }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground">{subtitle}</p>
      <motion.div
        className="w-full h-36 rounded-xl border flex items-center justify-center text-sm"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        Hover / tap around to see subtle animations
      </motion.div>
      <div className="flex justify-end">
        <button onClick={onNext} className="px-4 py-2 rounded bg-black text-white">{cta}</button>
      </div>
    </div>
  );
} 