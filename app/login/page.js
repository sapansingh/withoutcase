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
        // Store token and user info in localStorage
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 relative overflow-hidden">
      {/* Abstract background shapes */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* Glass card */}
      <div className="relative w-full max-w-md bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-10 z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-white text-gray-800 font-extrabold px-6 py-3 rounded-xl shadow-lg text-2xl tracking-wider uppercase">
            FRV 112
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 text-center mb-1 animate-slideIn">
          Welcome Back
        </h2>
        <p className="text-gray-700 text-center mb-6">
          Login to Fleet Monitoring System
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 text-red-100 bg-red-500/80 px-4 py-2 rounded-lg text-sm text-center animate-shake">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username */}
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              id="username"
              placeholder="Username"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white peer"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label
              htmlFor="username"
              className={`absolute left-10 text-gray-500 text-sm transition-all duration-300
                ${username ? "-top-2 text-xs text-purple-500" : "top-1/2 -translate-y-1/2"}
                pointer-events-none
              `}
            >
              Username
            </label>
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              id="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white peer"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label
              htmlFor="password"
              className={`absolute left-10 text-gray-500 text-sm transition-all duration-300
                ${password ? "-top-2 text-xs text-purple-500" : "top-1/2 -translate-y-1/2"}
                pointer-events-none
              `}
            >
              Password
            </label>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-bold shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : <><FaSignInAlt /> Login</>}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          © {new Date().getFullYear()} FRV Monitoring System
        </p>
      </div>

      {/* Animations */}
      <style jsx>{`
        .animate-shake {
          animation: shake 0.3s;
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }

        .animate-slideIn {
          animation: slideIn 0.6s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

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
  );
}
