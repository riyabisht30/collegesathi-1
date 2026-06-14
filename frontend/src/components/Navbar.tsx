'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore, useThemeStore } from '@/lib/store';
import { syncWishlistFromServer, clearWishlistState } from '@/lib/wishlist';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, isAuthenticated, logout, loadFromStorage } = useAuthStore();
  const { theme, toggleTheme, loadTheme } = useThemeStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadFromStorage();
    loadTheme();
    setMounted(true);
  }, [loadFromStorage, loadTheme]);

  useEffect(() => {
    if (isAuthenticated) {
      syncWishlistFromServer();
    } else {
      clearWishlistState();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    clearWishlistState();
  };

  if (!mounted) return null;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CS</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                CollegeSathi
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/colleges" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 font-medium transition-colors">
                Colleges
              </Link>
              <Link href="/recommend" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 font-medium transition-colors">
                Find My College
              </Link>
              {isAuthenticated && (
                <Link href="/wishlist" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 font-medium transition-colors">
                  Wishlist
                </Link>
              )}
            </div>

            {/* Auth */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Hi, {user?.name || user?.email?.split('@')[0] || 'Student'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary text-sm py-2 px-4"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
