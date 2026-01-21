'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Car, History, CreditCard, 
  Settings, LogOut, HelpCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Marketplace', path: '/marketplace' },
  { icon: Car, label: 'Orders', path: '/marketplace/bookings' },
  { icon: Settings, label: 'Settings', path: '/marketplace/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-72 h-screen bg-white border-r border-zinc-200 flex flex-col p-8 fixed left-0 top-0 z-50">
      <div className="mb-16">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <img src="/convivia24.png" alt="Convivia24" className="h-8 w-auto object-contain" />
        </Link>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                isActive 
                  ? 'bg-red-700 text-white shadow-lg shadow-red-900/20' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-red-700 transition-colors'} />
              <span className="text-sm font-black tracking-tight uppercase italic">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeNav"
                  className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-8 border-t border-zinc-100 space-y-3 text-center">
        {/* Rotating Logo in Sidebar */}
        <motion.img 
          src="/Logo2.png" 
          alt="" 
          className="w-12 h-12 mx-auto mb-6 opacity-10 grayscale"
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        
        <Link
          href="/support"
          className="flex items-center gap-4 px-5 py-2 text-zinc-400 hover:text-zinc-900 transition-all text-xs font-bold uppercase tracking-widest justify-center"
        >
          <HelpCircle size={16} />
          <span>Support Center</span>
        </Link>
      </div>
    </div>
  );
}
