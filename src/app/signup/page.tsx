"use client";

import { FaShieldAlt, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupUser, loginUser } from "@/app/lib/api"; // your axios API
import { saveToken } from "@/app/lib/auth";

export default function SignupPage() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      // Call signup API
      await signupUser({ name: fullname, email, password });

      // Show success message
      setSuccessMessage("Signed up successfully! Logging you in...");

      // Automatically login
      const data = await loginUser({ email, password });
      saveToken(data.token);

      // Redirect after short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      console.error("Signup failed:", err.response?.data || err.message);
      setError("Signup failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <FaShieldAlt className="text-yellow-400 text-5xl" />
          <h1 className="text-2xl font-bold text-black">ShopSecure</h1>
          <p className="text-yellow-400 text-sm text-center italic mt-1">
            Shop from Your Vendor Without Fear
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="flex items-center gap-2 border rounded px-3 py-2 focus-within:ring-2 focus-within:ring-yellow-400">
            <FaUser className="text-gray-400" />
            <input
              type="text"
              placeholder="Full Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full outline-none text-black"
              required
            />
          </div>

          <div className="flex items-center gap-2 border rounded px-3 py-2 focus-within:ring-2 focus-within:ring-yellow-400">
            <FaEnvelope className="text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full outline-none text-black"
              required
            />
          </div>

          <div className="flex items-center gap-2 border rounded px-3 py-2 focus-within:ring-2 focus-within:ring-yellow-400">
            <FaLock className="text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full outline-none text-black"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Error & Success Messages */}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {successMessage && <p className="text-yellow-400 text-sm">{successMessage}</p>}

          <button
            type="submit"
            className={`w-full py-2 rounded-lg font-semibold transition ${
              loading
                ? "bg-yellow-300 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500 text-black"
            }`}
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        {/* Footer / Login link */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-yellow-400 hover:text-yellow-500 font-semibold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
