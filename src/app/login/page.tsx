"use client";

import { FaShieldAlt, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/lib/api"; // your axios API
import { saveToken } from "@/app/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      saveToken(data.token); // store JWT
      router.push("/dashboard"); // redirect on success
    } catch (err: any) {
      console.error("Login failed:", err.response?.data || err.message);
      setError("Invalid email or password");
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

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className={`w-full py-2 rounded-lg font-semibold transition ${
              loading ? "bg-yellow-300 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-500 text-black"
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer / Signup link */}
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/signup" className="text-yellow-400 hover:text-yellow-500 font-semibold">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
