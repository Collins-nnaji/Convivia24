'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getNavigationItems } from '@/lib/roles';
import { 
  LayoutDashboard, Plus, Briefcase, Receipt, User, 
  ClipboardCheck, Users as UsersIcon, Building, List, 
  ShieldCheck, Settings, LogOut, Home
} from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap = {
  LayoutDashboard: LayoutDashboard,
  Plus: Plus,
  Briefcase: Briefcase,
  Receipt: Receipt,
  User: User,
  ClipboardCheck: ClipboardCheck,
  Users: UsersIcon,
  Building: Building,
  List: List,
  ShieldCheck: ShieldCheck,
  Settings: Settings,
};

const AppLayout = ({ children }) => {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // DEVELOPMENT MODE: Allow browsing without authentication
  // Set to false when ready for production
  const DEV_MODE = process.env.NODE_ENV === 'development' || true; // Allow dev mode for now

  // Mock user for development when not authenticated
  const mockUser = DEV_MODE && !user ? {
    id: 'dev-user-id',
    email: 'dev@convivia24.com',
    role: 'admin', // Default to admin to see all features
    first_name: 'Dev',
    last_name: 'User',
    business_id: null,
  } : user;

  // Show loading state while checking auth (only in production)
  if (loading && !DEV_MODE) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Use mock user or real user
  const currentUser = mockUser || user;
  const navItems = getNavigationItems(currentUser?.role || 'admin').map(item => ({
    ...item,
    icon: React.createElement(iconMap[item.icon] || LayoutDashboard, { size: 20 }),
  }));

  const [selectedRole, setSelectedRole] = useState(currentUser?.role || 'admin');

  // Role switcher for dev mode
  const devRoles = ['client', 'staff', 'supervisor', 'admin'];
  const currentRole = user ? currentUser?.role : selectedRole;
  const displayNavItems = getNavigationItems(currentRole).map(item => ({
    ...item,
    icon: React.createElement(iconMap[item.icon] || LayoutDashboard, { size: 20 }),
  }));

  const isActive = (path) => pathname === path;

  const handleLogout = () => {
    logout();
  };

  const handleRoleSwitch = (newRole) => {
    setSelectedRole(newRole);
    // Update the URL to match the role's default route
    const roleRoutes = {
      client: '/client/dashboard',
      staff: '/staff/dashboard',
      supervisor: '/supervisor/jobs',
      admin: '/admin/dashboard',
    };
    router.push(roleRoutes[newRole] || '/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-red-600 selection:text-white overflow-x-hidden relative">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-24 flex-col items-center py-10 border-r border-gray-200 bg-white shadow-sm z-50">
        <Link href="/" className="mb-12">
          <img src="/Logo2.png" alt="logo" className="w-10 h-10 opacity-90 hover:opacity-100 transition-opacity" />
        </Link>
        
        <nav className="flex flex-col gap-6 flex-1">
          {/* Dev Mode Role Switcher */}
          {DEV_MODE && !user && (
            <div className="mb-4 space-y-3">
              <div className="p-2 rounded-xl bg-orange-50 border border-orange-200">
                <p className="text-[6px] font-black uppercase tracking-wider text-orange-700 mb-2 text-center">DEV MODE</p>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleSwitch(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg bg-white border border-gray-300 text-black text-[8px] font-bold uppercase focus:outline-none focus:border-orange-500"
                >
                  {devRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <Link
                href="/test"
                className="block p-2 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 transition-all text-center"
              >
                <ShieldCheck size={16} className="mx-auto mb-1 text-red-600" />
                <span className="text-[7px] font-black uppercase tracking-wider text-red-600">TEST PAGES</span>
              </Link>
            </div>
          )}
          
          {displayNavItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`group relative flex flex-col items-center gap-1.5 transition-all ${
                isActive(item.path) ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <div className={`p-3 rounded-2xl transition-all ${isActive(item.path) ? 'bg-red-50' : 'group-hover:bg-gray-50'}`}>
                {item.icon}
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-center leading-tight">
                {item.label}
              </span>
              {/* Active Indicator Dot */}
              {isActive(item.path) && (
                <motion.div layoutId="navDot" className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-4 bg-red-600 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="mt-auto space-y-4 w-full px-2">
          <div className="text-center space-y-1 pb-4 border-b border-gray-200">
            <p className="text-[8px] font-black uppercase tracking-wider text-gray-600">
              {currentUser?.role?.toUpperCase() || 'DEV MODE'}
            </p>
            <p className="text-[10px] font-bold text-black truncate">
              {currentUser?.first_name || currentUser?.email?.split('@')[0] || 'Dev User'}
            </p>
            {DEV_MODE && !user && (
              <p className="text-[6px] font-bold text-orange-600 mt-1">DEV MODE</p>
            )}
          </div>
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full p-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all flex flex-col items-center gap-1"
            >
              <LogOut size={18} />
              <span className="text-[7px] font-black uppercase tracking-widest">Logout</span>
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="w-full p-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all flex flex-col items-center gap-1"
            >
              <User size={18} />
              <span className="text-[7px] font-black uppercase tracking-widest">Login</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:pl-24 pb-32 lg:pb-0 min-h-screen relative z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white backdrop-blur-2xl border-t border-gray-200 shadow-lg flex items-center justify-around px-6 z-50">
        {displayNavItems.slice(0, 4).map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive(item.path) ? 'text-red-600 scale-110' : 'text-gray-600 hover:text-red-600'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
        {user ? (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
          </button>
        ) : (
          <Link
            href="/auth/login"
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
          >
            <User size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Login</span>
          </Link>
        )}
      </nav>
    </div>
  );
};

export default AppLayout;
