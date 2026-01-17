"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaLock, FaSignInAlt } from "react-icons/fa";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("user_id", data.user.user_id);
        router.push("/withoutcase");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="relative w-full max-w-md bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-10 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-purple-300 rounded-full opacity-40 blur-3xl animate-blob" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-300 rounded-full opacity-30 blur-3xl animate-blob animation-delay-2000" />

        {/* Card Content */}
        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <div className="bg-white text-gray-900 font-extrabold px-6 py-3 rounded-xl shadow-lg text-2xl tracking-wider uppercase">
              Ambulance 108
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 text-center mb-1">
            Welcome Back
          </h2>
          <p className="text-gray-700 text-center mb-6">
            Login to Fleet Monitoring System
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 text-red-100 bg-red-500/80 px-4 py-2 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FaUser />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition"
                placeholder="Username"
              />
           
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FaLock />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition"
                placeholder="Password"
              />
             
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-bold shadow-lg transition transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : <><FaSignInAlt /> Login</>}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-8">
            © {new Date().getFullYear()} Ambulance Monitoring System
          </p>
        </div>

        {/* Animations */}
        <style jsx>{`
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          @keyframes blob {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
        `}</style>
      </div>
    </div>
  );
}
