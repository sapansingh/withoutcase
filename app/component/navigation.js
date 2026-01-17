"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaBell, FaUserCircle } from "react-icons/fa";

export default function TopNav() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("Admin"); // fallback
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Client mount
  useEffect(() => {
    setMounted(true);

    // Load username from localStorage
    const storedName = localStorage.getItem("username");
    if (storedName) setUsername(storedName);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // Call server logout API
      await fetch("/api/auth/logout", { method: "POST" });

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("user_id");

      // Redirect to login
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (!mounted) return null; // render only on client

  return (
    <nav className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center space-x-2">
            <div className="bg-white text-green-600 font-bold px-2 py-1 rounded-md shadow-md">
              Ambulance 108
            </div>
            <span className="text-lg font-semibold">Fleet Monitoring</span>
          </div>

          {/* Menu */}
          <div className="hidden md:flex space-x-6 font-medium">
            <a href="#" className="hover:text-yellow-300 transition-colors">Dashboard</a>
            <a href="#" className="hover:text-yellow-300 transition-colors">Events</a>
            <a href="#" className="hover:text-yellow-300 transition-colors">Reports</a>
            <a href="#" className="hover:text-yellow-300 transition-colors">Settings</a>
          </div>

          {/* User & Notifications */}
          <div className="flex items-center space-x-4">
            <button className="relative hover:text-yellow-300 transition-colors">
              <FaBell size={20} />
              <span className="absolute -top-1 -right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 cursor-pointer hover:text-yellow-300 transition-colors"
              >
                <FaUserCircle size={24} />
                <span>{username}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded-md shadow-lg border border-gray-200 overflow-hidden z-50 animate-fadeIn">
                  <a
                    href="#"
                    className="block px-4 py-2 hover:bg-green-100 transition-colors"
                  >
                    Profile
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-green-100 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
}
