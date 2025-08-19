"use client";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Signup() {
  const router = useRouter();
  const signup = useAction(api.auth.signup);
  const signIn = useAction(api.auth.signIn);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <motion.form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-card text-card-foreground rounded-2xl shadow p-6 space-y-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-2xl font-bold">Create your account</h1>
        <input name="name" placeholder="Your name" className="w-full border rounded px-3 py-2" onChange={onChange} />
        <input name="email" type="email" placeholder="Email" required className="w-full border rounded px-3 py-2" onChange={onChange} />
        <input name="password" type="password" placeholder="Password (min 8 chars)" required className="w-full border rounded px-3 py-2" onChange={onChange} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-50">
          {busy ? "Creating..." : "Sign up"}
        </button>
        <p className="text-sm text-muted-foreground">Already have an account? <a href="/login" className="underline">Log in</a></p>
      </motion.form>
    </div>
  );
} 