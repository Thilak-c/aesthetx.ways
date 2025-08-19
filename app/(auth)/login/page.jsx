"use client";
import { useEffect, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const getSessionToken = () => {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
};

export default function Login() {
  const router = useRouter();
  const signIn = useAction(api.auth.signIn);
  
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
      setError(err.message || "Invalid email or password. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <motion.form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-card text-card-foreground rounded-2xl shadow p-6 space-y-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <input 
          name="email" 
          type="email" 
          placeholder="Email" 
          className="w-full border rounded px-3 py-2" 
          onChange={onChange} 
          required 
        />
        <div className="relative">
          <input 
            name="password" 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            className="w-full border rounded px-3 py-2 pr-10" 
            onChange={onChange} 
            required 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-50">
          {busy ? "Signing in..." : "Log in"}
        </button>
        <p className="text-sm text-muted-foreground">No account? <a href="/signup" className="underline">Create one</a></p>
      </motion.form>
    </div>
  );
} 