'use client';
import { useState, useEffect } from 'react';
import { Search, Bell, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NetflixNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Movies', href: '/movies' },
    { label: 'TV Shows', href: '/tv' },
    { label: 'New & Popular', href: '/new' },
    { label: 'My List', href: '/mylist' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Netflix Logo */}
            <div className="text-red-600 font-bold text-2xl">
              STREAMFLIX
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-white hover:text-gray-300 transition-colors text-sm font-medium"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right Side Items */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Search size={20} />
              </button>

              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute right-0 top-12 bg-black border border-gray-700 rounded-lg p-2"
                  >
                    <input
                      type="text"
                      placeholder="Search movies and shows..."
                      className="bg-gray-800 text-white px-3 py-2 rounded w-64 focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <button className="text-white hover:text-gray-300 transition-colors">
              <Bell size={20} />
            </button>

            {/* Profile */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-white">
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                  <User size={16} />
                </div>
              </button>

              {/* Profile Dropdown */}
              <div className="absolute right-0 top-12 hidden group-hover:block bg-black border border-gray-700 rounded-lg p-2 w-48">
                <div className="p-2 border-b border-gray-700">
                  <p className="text-white text-sm">Welcome!</p>
                </div>
                <div className="p-2 space-y-2">
                  <a href="/profile" className="block text-white hover:text-red-600 text-sm">
                    Profile
                  </a>
                  <a href="/settings" className="block text-white hover:text-red-600 text-sm">
                    Settings
                  </a>
                  <button className="block text-white hover:text-red-600 text-sm w-full text-left">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black border-t border-gray-700"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block px-3 py-2 text-white hover:bg-gray-800 rounded-md text-base font-medium"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
