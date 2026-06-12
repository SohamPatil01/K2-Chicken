"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@/context/AuthContext";

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect) {
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
      const redirectUrl =
        sessionStorage.getItem("loginRedirect") || "/checkout";
      sessionStorage.removeItem("loginRedirect");
      router.push(redirectUrl);
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="k2-page flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-k2-green font-display text-base font-extrabold text-k2-cream">
              K2
            </span>
            <span className="flex flex-col text-left leading-tight">
              <span className="font-display text-2xl font-extrabold text-k2-green">
                K2 Chicken
              </span>
              <span className="font-mono text-[9.5px] uppercase tracking-widest text-k2-saffron-hot">
                Only fresh, never frozen
              </span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-[#5a6a61]">
            {isRegistering ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        <div className="k2-card-padded shadow-card">
          <div className="mb-6 flex gap-4 border-b border-k2-paper">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setError("");
              }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                !isRegistering
                  ? "border-b-2 border-k2-saffron text-k2-saffron"
                  : "text-[#7b877f] hover:text-k2-ink"
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
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                isRegistering
                  ? "border-b-2 border-k2-saffron text-k2-saffron"
                  : "text-[#7b877f] hover:text-k2-ink"
              }`}
            >
              Register
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-3 rounded-card border border-k2-paper bg-k2-cream-dark p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-k2-saffron-hot" />
                <span className="text-sm text-k2-saffron-hot">{error}</span>
              </div>
            )}

            {isRegistering && (
              <div>
                <label htmlFor="name" className="k2-label">
                  Full Name
                </label>
                <div className="relative">
                  <UserPlus className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b877f]" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="k2-input pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {isRegistering && (
              <div>
                <label htmlFor="email" className="k2-label">
                  Email (Optional)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="k2-input"
                  placeholder="Enter your email"
                />
              </div>
            )}

            <div>
              <label htmlFor="phone" className="k2-label">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b877f]" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="k2-input pl-10"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="k2-label">
                Password *
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b877f]" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="k2-input pl-10 pr-10"
                  placeholder={
                    isRegistering ? "Create a password" : "Enter your password"
                  }
                />
                {password && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-[#7b877f]" />
                    ) : (
                      <Eye className="h-5 w-5 text-[#7b877f]" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex min-h-[48px] w-full items-center justify-center gap-2 rounded-pill py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
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

          <div className="mt-6 rounded-card border border-k2-paper bg-k2-cream-dark p-4">
            <p className="mb-2 text-sm font-semibold text-k2-green-deep">
              Benefits of an account:
            </p>
            <ul className="space-y-1 text-xs text-[#5a6a61]">
              <li>✓ View your order history</li>
              <li>✓ Get exclusive discounts on repeat orders</li>
              <li>✓ Save delivery addresses</li>
              <li>✓ Faster checkout</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-[#7b877f] transition-colors hover:text-k2-saffron"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
