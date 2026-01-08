"use client";

import { UserCircleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  isAuthenticated,
  getStoredUser,
  logoutUser,
} from "@/services/authService";
import { UserDto } from "@/lib/types";
import { toast } from "sonner";

export default function UserAuth() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const userData = getStoredUser();
        setUser(userData);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Handle sign out with loading state
  const handleSignOut = async () => {
    setIsLoggingOut(true);
    setIsDropdownOpen(false);

    try {
      logoutUser(); // This clears tokens and redirects
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
      setIsLoggingOut(false);
    }
  };

  // Loading state during session check
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200 hidden sm:block"></div>
      </div>
    );
  }

  // Not authenticated - show sign in/up buttons
  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <button
          onClick={() => router.push("/auth/signin")}
          className="text-gray-700 cursor-pointer hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Sign In
        </button>
        <Button
          className="cursor-pointer"
          onClick={() => router.push("/auth/register")}
        >
          Register
        </Button>
      </div>
    );
  }

  // Authenticated - show user dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        disabled={isLoggingOut}
      >
        {/* User avatar */}
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={32}
            height={32}
            className="rounded-full border border-gray-200"
          />
        ) : (
          <UserCircleIcon className="h-8 w-8 text-gray-600" />
        )}

        {/* User name - hidden on mobile */}
        <span className="hidden sm:block max-w-[120px] truncate">
          {user?.name || user?.email?.split("@")[0] || "User"}
        </span>

        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          } ${isLoggingOut ? "opacity-50" : ""}`}
        />
      </button>

      {/* Dropdown menu */}
      {isDropdownOpen && !isLoggingOut && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          </div>

          {/* Navigation links */}
          <div className="py-1">
            <Link
              href="/user/dashboard"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              Dashboard
            </Link>

            <Link
              href="/user/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              Profile Settings
            </Link>

            {/* <Link
              href="/user/products"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              My Products
            </Link> */}

            <Link
              href="/user/favorites"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              Favorites
            </Link>

            <Link
              href="/sell"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              Sell Product
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
