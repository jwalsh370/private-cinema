'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Settings, Home, Film, Heart, Clock } from 'lucide-react';

export function LuxuryNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Movies', href: '/movies', icon: Film },
    { label: 'Favorites', href: '/favorites', icon: Heart },
    { label: 'Recently Added', href: '/recent', icon: Clock },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled ? 'glass-effect' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <div className="text-3xl font-light text-soft-white font-playfair">
              CineVault
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center space-x-2 text-silver hover:text-salmon-pink transition-colors duration-300 group"
                  >
                    <Icon size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-light">{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right Side Items */}
          <div className="flex items-center space-x-6">
            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-silver hover:text-salmon-pink transition-colors p-2"
              >
                <Search size={22} />
              </button>

              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-12 glass-effect rounded-lg p-3 min-w-80"
                  >
                    <input
                      type="text"
                      placeholder="Search your collection..."
                      className="w-full bg-transparent border border-gold-accent/30 text-soft-white px-4 py-2 rounded focus:outline-none focus:border-salmon-pink"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Settings */}
            <button className="text-silver hover:text-salmon-pink transition-colors p-2">
              <Settings size={22} />
            </button>

            {/* Profile */}
            <div className="relative group">
              <button className="flex items-center justify-center w-10 h-10 border border-gold-accent/50 rounded-full text-gold-accent hover:border-salmon-pink hover:text-salmon-pink transition-all duration-300">
                <User size={20} />
              </button>

              {/* Profile Dropdown */}
              <div className="absolute right-0 top-14 hidden group-hover:block glass-effect rounded-lg p-4 w-48 border border-gold-accent/20">
                <div className="p-2 border-b border-gold-accent/20">
                  <p className="text-soft-white text-sm">Welcome to Your Theater</p>
                </div>
                <div className="p-2 space-y-2">
                  <a href="/profile" className="block text-silver hover:text-salmon-pink text-sm transition-colors">
                    Profile Settings
                  </a>
                  <a href="/preferences" className="block text-silver hover:text-salmon-pink text-sm transition-colors">
                    Preferences
                  </a>
                  <button className="block text-silver hover:text-salmon-pink text-sm w-full text-left transition-colors">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
