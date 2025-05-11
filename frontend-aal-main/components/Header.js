// components/Header.js
import React from 'react';
import { useRouter } from 'next/router';

export default function Header() {
  const router = useRouter();

  const isActive = (path) => router.pathname === path;

  return (
    <header className="bg-[#1E2023] text-white fixed top-0 left-0 w-full z-[2000]">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-3 pl-7">
          <div>
            <h1 className="text-2xl font-bold font-[space grotesk] text-[#C6FF00]">CardinAAL</h1>
            <p className="text-gray-400 text-sm font-[space grotesk]">Calculation for Direct and Average Annual Loss</p>
          </div>
        </div>
        <nav className="flex space-x-4">
        <button
            onClick={() => router.push('/')}
            className={`
              px-4 py-2 rounded-4xl transition
              ${isActive('/') 
                ? 'bg-[#C6FF00] text-black' 
                : 'text-gray-200 hover:bg-[#C6FF00] hover:text-black'}
            `}
          >
            Home
          </button>
          <button
            onClick={() => router.push('/calculation')}
            className={`
              px-4 py-2 rounded-4xl transition
              ${isActive('/calculation') 
                ? 'bg-[#C6FF00] text-black' 
                : 'text-gray-200 hover:bg-[#C6FF00] hover:text-black'}
            `}
          >
            Perhitungan
          </button>
          <button
            onClick={() => router.push('/data')}
            className={`
              px-4 py-2 rounded-4xl transition
              ${isActive('/data') 
                ? 'bg-[#C6FF00] text-black' 
                : 'text-gray-200 hover:bg-[#C6FF00] hover:text-black'}
            `}
          >
            Data
            </button>
          <button
            onClick={() => router.push('/about')}
            className={`
              px-4 py-2 rounded-4xl transition
              ${isActive('/about') 
                ? 'bg-[#C6FF00] text-black' 
                : 'text-gray-200 hover:bg-[#C6FF00] hover:text-black'}
            `}
          >
            Tentang Kami
          </button>
        </nav>
      </div>
    </header>
  );
}