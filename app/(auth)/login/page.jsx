"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link"; // Import Link for consistent navigation styling
import { Eye, EyeOff } from "lucide-react"; // Import Eye and EyeOff icons

const getSessionToken = () => {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
};

export default function Login() {
  const router = useRouter();
  const signIn = useMutation(api.auth.signIn);
  
  const token = getSessionToken();
  const me = useQuery(api.users.meByToken, token ? { token } : "skip");

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Only redirect if we have a valid user session
    if (me === undefined) return; // Still loading
    if (me && token) {
      // Valid session exists, redirect to onboarding
      router.push("/onboarding");
    }
  }, [me, token, router]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const result = await signIn({ email: form.email, password: form.password });
      
      if (result.status === "account_deleted") {
        // Redirect to account deleted page with deletion info
        const info = encodeURIComponent(JSON.stringify(result.deletionInfo));
        router.push(`/account-deleted?info=${info}`);
        setBusy(false);
        return;
      }
      
      if (result.status === "success") {
        document.cookie = `sessionToken=${result.sessionToken}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;
        router.push("/onboarding");
        return;
      }
      
      // Handle case where result doesn't have expected status
      if (result.sessionToken) {
        // Backward compatibility - old format
        document.cookie = `sessionToken=${result.sessionToken}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;
        router.push("/onboarding");
        return;
      }
      
      // If we get here, something unexpected happened
      setError("Login failed. Please try again.");
      setBusy(false);
      
    } catch (err) {
      // Convert technical errors to user-friendly messages
      const errorMessage = err.message || "Login failed";
      
      if (errorMessage.includes("Invalid credentials")) {
        setError("Incorrect email or password. Please check your details and try again.");
      } else if (errorMessage.includes("User not found")) {
        setError("No account found with this email. Please check your email or sign up.");
      } else if (errorMessage.includes("Password")) {
        setError("Incorrect password. Please try again.");
      } else if (errorMessage.includes("Email")) {
        setError("Please enter a valid email address.");
      } else if (errorMessage.includes("Network") || errorMessage.includes("fetch")) {
        setError("Connection error. Please check your internet and try again.");
      } else if (errorMessage.includes("timeout")) {
        setError("Request timed out. Please try again.");
      } else {
        // Generic fallback for unknown errors
        setError("Unable to sign in. Please try again in a moment.");
      }
      
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 pt-12 sm:pt-6 bg-gray-50 overflow-hidden">
      {/* Background with Logo */}
      <div 
        className="absolute inset-0 z-0 flex items-center justify-center"
      >
        <img
          src="/logo.png"
          alt="AesthetX Background Logo"
          className="w-full h-full object-cover opacity-1 blur-md transform scale-150 saturate-0"
        />
      </div>

      <motion.form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-sm sm:max-w-md bg-white/70 backdrop-blur-3xl rounded-3xl shadow-5xl border border-gray-300/70 p-8 sm:p-12 space-y-6 sm:space-y-7 transition-all duration-300 ease-in-out"
        initial={{ scale: 0.8, opacity: 0, y: 80 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 10, duration: 0.8 }}
      >
        {/* Logo and Brand Info */}
        <div className="text-center mb-7 sm:mb-9">
          {/* <Link href="/">
            <img
              src="/logo.png"
              alt="AesthetX Logo"
              className="h-16 sm:h-20 object-contain mx-auto mb-2 sm:mb-3 transform hover:scale-110 transition-transform duration-300 ease-in-out filter drop-shadow-md"
            />
          </Link> */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1 tracking-tight">Welcome back</h1>
          <p className="text-sm sm:text-base text-gray-700 font-medium">Sign in to your <span className="text-gray-900 font-bold">AesthetX</span> account</p>
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
            Email Address
          </label>
        <input 
          name="email" 
          type="email" 
            id="email"
            placeholder="your.email@example.com" 
            className="w-full px-5 py-3.5 sm:px-6 sm:py-4 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition-all shadow-md bg-white/90 text-gray-900 placeholder-gray-600 appearance-none hover:border-gray-600"
          onChange={onChange} 
          required 
        />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
            Password
          </label>
        <div className="relative">
          <input 
            name="password" 
            type={showPassword ? "text" : "password"} 
              id="password"
              placeholder="Enter your password" 
              className="w-full px-5 py-3.5 sm:px-6 sm:py-4 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition-all pr-12 sm:pr-14 shadow-md bg-white/90 text-gray-900 placeholder-gray-600 appearance-none hover:border-gray-600"
            onChange={onChange} 
            required 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
          >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
          </button>
          </div>
        </div>

        {error && (
          <div className="  text-center">
           
            <p className="text-sm text-red-700 leading-relaxed">
              {error}
            </p>
           
          </div>
        )}
        
        <button 
          type="submit"
          disabled={busy}
          className="w-full bg-gradient-to-r from-gray-900 to-black text-white font-bold py-3.5 sm:py-4 rounded-xl hover:from-black hover:to-gray-950 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:scale-95"
        >
          {busy ? "Signing in..." : "Log in"}
        </button>

        <p className="text-xs sm:text-sm text-center text-gray-700 mt-3 sm:mt-4">
          No account? 
          <Link href="/signup" className="text-gray-900 hover:text-black font-bold underline ml-1 transition-colors hover:scale-105 inline-block transform hover:-translate-y-0.5 active:scale-95">
            Create one
          </Link>
        </p>
      </motion.form>
    </div>
  );
} 