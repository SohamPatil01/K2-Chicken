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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="K2 Chicken - Baramati Agro"
                className="h-20 w-auto rounded-2xl"
                onError={(e) => {
                  // Fallback to SVG if PNG doesn't exist
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = "/logo.svg";
                }}
              />
            </div>
            <p className="text-gray-600 mt-2">
              {isRegistering
                ? "Create your account"
                : "Sign in to your account"}
            </p>
          </Link>
        </div>

        {/* Login/Register Form */}
        <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8">
          <div className="flex gap-4 mb-6 border-b">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setError("");
              }}
              className={`flex-1 py-2 font-semibold transition-colors ${
                !isRegistering
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(true);
                setError("");
              }}
              className={`flex-1 py-2 font-semibold transition-colors ${
                isRegistering
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Register
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Name Field (Register only) */}
            {isRegistering && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserPlus className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-base"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Email Field (Register only) */}
            {isRegistering && (
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email (Optional)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-base"
                  placeholder="Enter your email"
                />
              </div>
            )}

            {/* Phone Field */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-base"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-base"
                  placeholder={
                    isRegistering ? "Create a password" : "Enter your password"
                  }
                />
                {password && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>
                    {isRegistering ? "Creating account..." : "Signing in..."}
                  </span>
                </>
              ) : (
                <>
                  {isRegistering ? (
                    <UserPlus className="h-5 w-5" />
                  ) : (
                    <LogIn className="h-5 w-5" />
                  )}
                  <span>{isRegistering ? "Create Account" : "Sign In"}</span>
                </>
              )}
            </button>
          </form>

          {/* Benefits for logged-in users */}
          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <p className="text-sm font-semibold text-orange-900 mb-2">
              Benefits of creating an account:
            </p>
            <ul className="text-xs text-orange-800 space-y-1">
              <li>✓ View your order history</li>
              <li>✓ Get exclusive discounts on repeat orders</li>
              <li>✓ Save your delivery addresses</li>
              <li>✓ Faster checkout experience</li>
            </ul>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
