'use client';

import Link from 'next/link';
import { Popcorn, User } from 'lucide-react';

export const NavBar = () => (
  <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-sm z-50 border-b border-white/10">
    <div className="container flex items-center justify-between h-20">
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-3">
          <Popcorn className="w-9 h-9 text-red-500" />
          <span className="text-2xl font-black text-white">CINEMA</span>
        </Link>
        <div className="hidden lg:flex gap-8">
          <Link href="/" className="text-gray-300 hover:text-white transition-all font-medium">
            Home
          </Link>
          <Link href="/movies" className="text-gray-300 hover:text-white transition-all font-medium">
            Movies
          </Link>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button className="p-3 hover:bg-white/10 rounded-full transition-all">
          <User className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  </nav>
);


