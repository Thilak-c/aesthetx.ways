"use client";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link"; // Import Link for consistent navigation styling
import { Eye, EyeOff } from "lucide-react"; // Import Eye and EyeOff icons

export default function Signup() {
  const router = useRouter();
  const signup = useAction(api.auth.signup);
  const signIn = useAction(api.auth.signIn);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signup({ email: form.email, password: form.password, name: form.name });
      const { sessionToken } = await signIn({ email: form.email, password: form.password });
      document.cookie = `sessionToken=${sessionToken}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;
      router.push("/onboarding");
    } catch (err) {
      const msg = String(err?.message || "");
      setError(
        msg.toLowerCase().includes("already")
          ? "That email is already in use. Try logging in instead."
          : "Could not sign up. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

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

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1 tracking-tight">Create your account</h1>
          <p className="text-sm sm:text-base text-gray-700 font-medium">Join the <span className="text-gray-900 font-bold">AesthetX</span> community</p>
        </div>

        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
            Your Name
          </label>
          <input 
            name="name" 
            id="name"
            placeholder="Enter your name" 
            className="w-full px-5 py-3.5 sm:px-6 sm:py-4 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition-all shadow-md bg-white/90 text-gray-900 placeholder-gray-600 appearance-none hover:border-gray-600"
            onChange={onChange} 
            required
          />
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
              placeholder="Enter your password (min 8 chars)" 
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
          <p className="text-xs sm:text-sm text-red-700 bg-red-100 p-3 sm:p-4 rounded-xl border border-red-300 shadow-md text-center animate-shake">
            {error}
          </p>
        )}
        
        <button 
          type="submit"
          disabled={busy}
          className="w-full bg-gradient-to-r from-gray-900 to-black text-white font-bold py-3.5 sm:py-4 rounded-xl hover:from-black hover:to-gray-950 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:scale-95"
        >
          {busy ? "Creating..." : "Sign up"}
        </button>

        <p className="text-xs sm:text-sm text-center text-gray-700 mt-3 sm:mt-4">
          Already have an account? 
          <Link href="/login" className="text-gray-900 hover:text-black font-bold underline ml-1 transition-colors hover:scale-105 inline-block transform hover:-translate-y-0.5 active:scale-95">
            Log in
          </Link>
        </p>
      </motion.form>
    </div>
  );
} 