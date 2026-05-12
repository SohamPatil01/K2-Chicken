"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { login, register } = useAuth();

  // Get redirect URL from query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect) {
      // Store redirect URL for after login
      sessionStorage.setItem("loginRedirect", redirect);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isRegistering) {
        if (!password.trim()) {
          setError("Password is required for registration");
          setIsLoading(false);
          return;
        }
        await register(phone, email || undefined, name || undefined, password);
      } else {
        if (!password.trim()) {
          setError("Password is required");
          setIsLoading(false);
          return;
        }
        await login(phone, password);
      }
      // Redirect to stored redirect URL or checkout
      const redirectUrl =
        sessionStorage.getItem("loginRedirect") || "/checkout";
      sessionStorage.removeItem("loginRedirect");
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-brand-red flex items-center justify-center text-white font-serif font-bold text-xl shadow-brand-sm">
              K2
            </div>
            <div className="text-left">
              <span className="block text-2xl font-serif font-bold text-gray-900">K2 Chicken</span>
              <span className="block text-[10px] text-gray-400 uppercase tracking-widest">Only Fresh, Never Frozen</span>
            </div>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">
            {isRegistering ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        {/* Login/Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex gap-4 mb-6 border-b border-gray-100">
            <button
              type="button"
              onClick={() => { setIsRegistering(false); setError(""); }}
              className={`flex-1 py-2.5 font-semibold transition-colors text-sm ${
                !isRegistering ? "text-brand-red border-b-2 border-brand-red" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setIsRegistering(true); setError(""); }}
              className={`flex-1 py-2.5 font-semibold transition-colors text-sm ${
                isRegistering ? "text-brand-red border-b-2 border-brand-red" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Register
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-brand-red flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Name Field (Register only) */}
            {isRegistering && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserPlus className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-brand-red transition-colors text-base outline-none"
                    placeholder="Enter your full name" />
                </div>
              </div>
            )}

            {/* Email Field (Register only) */}
            {isRegistering && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-brand-red transition-colors text-base outline-none"
                  placeholder="Enter your email" />
              </div>
            )}

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input id="phone" name="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-brand-red transition-colors text-base outline-none"
                  placeholder="Enter your phone number" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input id="password" name="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-brand-red transition-colors text-base outline-none"
                  placeholder={isRegistering ? "Create a password" : "Enter your password"} />
                {password && (
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 px-4 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  <span>{isRegistering ? "Creating account..." : "Signing in..."}</span>
                </>
              ) : (
                <>
                  {isRegistering ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                  <span>{isRegistering ? "Create Account" : "Sign In"}</span>
                </>
              )}
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-sm font-semibold text-gray-900 mb-2">Benefits of an account:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>✓ View your order history</li>
              <li>✓ Get exclusive discounts on repeat orders</li>
              <li>✓ Save delivery addresses</li>
              <li>✓ Faster checkout</li>
            </ul>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-brand-red transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
