'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { 
  LayoutDashboard, Plus, Briefcase, Receipt, User, 
  ClipboardCheck, Users as UsersIcon, Building, List, 
  ShieldCheck, Settings, ArrowRight, Home, FlaskConical,
  HardHat, BriefcaseBusiness, FileText, CircleDollarSign,
  ClipboardList, UserCog, Factory, ScrollText,
  UserRoundSearch, UserRoundCheck, UserRoundCog,
  ClipboardType, UsersRound, TrendingUp, CheckCircle2,
  AlertCircle, Info
} from 'lucide-react';

export default function TestNavigationPage() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-50px' });

  const pages = [
    {
      category: 'Landing & Auth',
      icon: Home,
      color: 'blue',
      pages: [
        { name: 'Landing Page', path: '/', icon: Home, description: 'Main homepage with services and pricing' },
        { name: 'Login', path: '/auth/login', icon: User, description: 'User authentication page' },
        { name: 'Register', path: '/auth/register', icon: UsersIcon, description: 'New client registration' },
      ],
    },
    {
      category: 'Client Portal',
      icon: Building,
      color: 'green',
      pages: [
        { name: 'Client Dashboard', path: '/client/dashboard', icon: LayoutDashboard, description: 'Overview of jobs and services' },
        { name: 'Request Service', path: '/client/request', icon: Plus, description: 'Create new cleaning service request' },
        { name: 'My Jobs', path: '/client/jobs', icon: Briefcase, description: 'View all client bookings' },
        { name: 'Job Details (Mock)', path: '/client/jobs/mock-1', icon: BriefcaseBusiness, description: 'Individual job details and status' },
        { name: 'Invoices', path: '/client/invoices', icon: Receipt, description: 'Billing and payment history' },
        { name: 'Profile', path: '/client/profile', icon: UserCog, description: 'Client account settings' },
      ],
    },
    {
      category: 'Admin Portal',
      icon: ShieldCheck,
      color: 'red',
      pages: [
        { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, description: 'Platform overview and analytics' },
        { name: 'All Jobs', path: '/admin/jobs', icon: List, description: 'Manage all bookings system-wide' },
        { name: 'Job Management (Mock)', path: '/admin/jobs/mock-1', icon: BriefcaseBusiness, description: 'Edit and assign jobs' },
        { name: 'Clients', path: '/admin/clients', icon: Building, description: 'Manage client businesses' },
        { name: 'Staff', path: '/admin/staff', icon: UsersIcon, description: 'Manage cleaning staff members' },
        { name: 'Services', path: '/admin/services', icon: ScrollText, description: 'Configure service types and pricing' },
        { name: 'Compliance Logs', path: '/admin/compliance', icon: ClipboardCheck, description: 'View all compliance records' },
        { name: 'Settings', path: '/admin/settings', icon: Settings, description: 'System configuration' },
      ],
    },
    {
      category: 'Staff Portal',
      icon: HardHat,
      color: 'orange',
      pages: [
        { name: 'Staff Dashboard', path: '/staff/dashboard', icon: LayoutDashboard, description: 'Assigned jobs overview' },
        { name: 'My Assigned Jobs', path: '/staff/jobs', icon: Briefcase, description: 'View and update assigned jobs' },
        { name: 'Job Details (Mock)', path: '/staff/jobs/mock-2', icon: BriefcaseBusiness, description: 'Complete job checklist and upload photos' },
        { name: 'Profile', path: '/staff/profile', icon: UserCog, description: 'Staff account settings' },
      ],
    },
    {
      category: 'Supervisor Portal',
      icon: ClipboardCheck,
      color: 'purple',
      pages: [
        { name: 'Quality Checks', path: '/supervisor/jobs', icon: ClipboardType, description: 'Review completed jobs' },
        { name: 'Compliance Check (Mock)', path: '/supervisor/jobs/mock-3', icon: ShieldCheck, description: 'Verify compliance and sign off' },
        { name: 'Team Management', path: '/supervisor/team', icon: UsersRound, description: 'Manage staff assignments' },
        { name: 'Profile', path: '/supervisor/profile', icon: UserCog, description: 'Supervisor account settings' },
      ],
    },
  ];

  const totalPages = pages.reduce((acc, cat) => acc + cat.pages.length, 0);
  const totalCategories = pages.length;

  const categoryColors = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-600' },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-red-600 selection:text-white relative p-6 lg:p-12">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: -30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
          className="text-center space-y-6 pt-8"
        >
          <div className="flex justify-center mb-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-sm font-bold uppercase tracking-wider group"
            >
              <motion.div
                whileHover={{ x: -3 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <ArrowRight size={16} className="rotate-180" />
              </motion.div>
              <span>Back to Landing</span>
            </Link>
          </div>

          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-orange-50 border-2 border-orange-300 mb-4">
            <FlaskConical size={20} className="text-orange-600" />
            <ShieldCheck size={18} className="text-orange-600" />
            <span className="text-sm font-black uppercase tracking-wider text-orange-700">Dev Mode Active</span>
          </div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isHeaderInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter italic text-black"
          >
            Test Pages
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Comprehensive navigation hub for all application routes. Quick access for development and testing.
          </motion.p>

          {/* Quick Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isHeaderInView ? "visible" : "hidden"}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8"
          >
                  {[
              { label: 'Total Pages', value: totalPages, icon: FileText, bgClass: 'bg-red-600', hoverBorder: 'hover:border-red-300' },
              { label: 'Categories', value: totalCategories, icon: List, bgClass: 'bg-blue-600', hoverBorder: 'hover:border-blue-300' },
              { label: 'User Roles', value: 4, icon: UsersIcon, bgClass: 'bg-green-600', hoverBorder: 'hover:border-green-300' },
              { label: 'Mock Data', value: '100%', icon: CheckCircle2, bgClass: 'bg-orange-600', hoverBorder: 'hover:border-orange-300' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`p-6 rounded-2xl bg-white border-2 border-gray-200 ${stat.hoverBorder} shadow-lg hover:shadow-xl transition-all text-center`}
              >
                <div className={`w-12 h-12 rounded-xl ${stat.bgClass} flex items-center justify-center text-white mb-3 mx-auto`}>
                  <stat.icon size={24} />
                </div>
                <p className="text-3xl md:text-4xl font-black text-black mb-1">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Page Categories */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          {pages.map((category, categoryIndex) => {
            const colors = categoryColors[category.color] || categoryColors.blue;
            const CategoryIcon = category.icon;

            return (
              <motion.div
                key={category.category}
                variants={itemVariants}
                className="space-y-6"
              >
                {/* Category Header */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: categoryIndex * 0.1 + 0.3, duration: 0.5 }}
                  className={`p-6 rounded-2xl ${colors.bg} ${colors.border} border-2 shadow-lg`}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`w-12 h-12 rounded-xl bg-white border-2 ${colors.border} flex items-center justify-center ${colors.icon} shadow-md`}>
                      <CategoryIcon size={24} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
                        {category.category}
                      </h2>
                      <p className="text-sm text-gray-600 font-medium mt-1">
                        {category.pages.length} {category.pages.length === 1 ? 'page' : 'pages'}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Category Pages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.pages.map((page, pageIndex) => {
                    const PageIcon = page.icon;
                    return (
                      <motion.div
                        key={page.path}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: categoryIndex * 0.1 + pageIndex * 0.05 + 0.4, duration: 0.4 }}
                        whileHover={{ y: -6, scale: 1.02 }}
                      >
                        <Link
                          href={page.path}
                          className="group block h-full"
                        >
                            <motion.div
                            whileHover={{ 
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                            className={`p-6 rounded-2xl bg-white border-2 border-gray-200 hover:border-red-300 transition-all shadow-md hover:shadow-xl h-full flex flex-col`}
                          >
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                              <PageIcon size={24} className={colors.icon} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-2">
                              <h3 className={`text-lg font-black uppercase tracking-tight text-black group-hover:text-red-600 transition-colors`}>
                                {page.name}
                              </h3>
                              <p className="text-xs text-gray-600 leading-relaxed font-medium min-h-[2.5rem]">
                                {page.description}
                              </p>
                              <p className="text-[10px] text-gray-500 font-mono mt-2">{page.path}</p>
                            </div>

                            {/* Arrow */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-red-600 transition-colors">
                                View Page
                              </span>
                              <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ArrowRight size={18} className={colors.icon} />
                              </motion.div>
                            </div>
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Instructions Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-red-50 via-white to-green-50 border-2 border-red-200 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
              <Info size={24} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-black">Testing Instructions</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: CheckCircle2, text: 'All pages work without authentication in Dev Mode', bgClass: 'bg-green-100', iconClass: 'text-green-600' },
              { icon: UsersIcon, text: 'Use the role switcher in the sidebar to see different views', bgClass: 'bg-blue-100', iconClass: 'text-blue-600' },
              { icon: FileText, text: 'Mock data is displayed when the database is not connected', bgClass: 'bg-orange-100', iconClass: 'text-orange-600' },
              { icon: Briefcase, text: 'Job detail pages use mock IDs (mock-1, mock-2, mock-3)', bgClass: 'bg-red-100', iconClass: 'text-red-600' },
              { icon: TrendingUp, text: 'All API routes have fallback mock data for development', bgClass: 'bg-purple-100', iconClass: 'text-purple-600' },
              { icon: ShieldCheck, text: 'Click any page above to navigate and test functionality', bgClass: 'bg-green-100', iconClass: 'text-green-600' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.05, duration: 0.4 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-red-300 transition-all"
              >
                <div className={`w-8 h-8 rounded-lg ${item.bgClass} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <item.icon size={16} className={item.iconClass} />
                </div>
                <p className="text-sm text-gray-700 font-medium leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Navigation Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-12 p-6 rounded-2xl bg-white border-2 border-gray-200 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-red-300 transition-all text-sm font-bold text-gray-700 hover:text-red-600"
            >
              <Home size={16} />
              Landing Page
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-all text-sm font-bold text-red-600"
            >
              <LayoutDashboard size={16} />
              Admin
            </Link>
            <Link
              href="/client/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-all text-sm font-bold text-green-700"
            >
              <LayoutDashboard size={16} />
              Client
            </Link>
            <Link
              href="/staff/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-all text-sm font-bold text-orange-700"
            >
              <LayoutDashboard size={16} />
              Staff
            </Link>
            <Link
              href="/supervisor/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-all text-sm font-bold text-purple-700"
            >
              <ClipboardCheck size={16} />
              Supervisor
            </Link>
          </div>
          <div className="text-xs text-gray-600 font-mono font-medium">
            Total: {totalPages} pages across {totalCategories} categories
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-16 pt-8 border-t-2 border-gray-200 text-center space-y-2"
        >
          <p className="text-sm font-black uppercase tracking-wider text-black">
            &copy; 2024 Convivia 24. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 flex items-center justify-center gap-2">
            <ShieldCheck size={12} className="text-green-600" />
            <span>Development Mode • Testing Environment • Mock Data Enabled</span>
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
