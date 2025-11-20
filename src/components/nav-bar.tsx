'use client';

import Link from 'next/link';
import { Popcorn, User } from 'lucide-react';

export const NavBar = () => (
  <nav className="fixed top-0 w-full bg-gradient-to-b from-black/80 to-transparent z-50">
    <div className="container flex items-center justify-between h-16">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <Popcorn className="w-8 h-8 text-red-500" />
          <span className="text-2xl font-bold text-white">Cinema</span>
        </Link>
        <div className="hidden md:flex gap-6">
          <a href="#" className="text-gray-300 hover:text-white transition">Home</a>
          <a href="#" className="text-gray-300 hover:text-white transition">Movies</a>
          <a href="#" className="text-gray-300 hover:text-white transition">TV Shows</a>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-white/10 rounded-full transition">
          <User className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  </nav>
);
