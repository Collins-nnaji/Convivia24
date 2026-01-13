'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, UserPlus, Mail, Lock, Building, MapPin, Phone, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    business_name: '',
    business_address: '',
    business_city: '',
    business_state: '',
    business_country: 'Nigeria',
    business_industry: '',
    business_size: '',
    contact_person: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        router.push('/client/dashboard');
      } else {
        setError(data.error || 'Registration failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-6 sm:space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.img
            src="/Logo2.png"
            alt="Convivia 24"
            className="w-16 h-16 mx-auto opacity-90"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic text-black">Register as Client</h1>
          <p className="text-gray-600 text-xs sm:text-sm font-medium">Create your business account to access cleaning and security services</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3"
            >
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </motion.div>
          )}

          {/* Personal Info */}
          <div className="space-y-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white border border-gray-200 shadow-sm">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight mb-3 sm:mb-4 text-black">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                  <UserPlus size={14} className="text-red-600" />
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                  <Mail size={14} className="text-red-600" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
                  placeholder="business@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                  <Phone size={14} className="text-red-600" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
                  placeholder="+234 800 000 0000"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                  <Lock size={14} className="text-red-600" />
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="space-y-4 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <h2 className="text-lg font-black uppercase tracking-tight mb-4 text-black">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                  <Building size={14} className="text-red-600" />
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
                  placeholder="ABC Corporation Ltd."
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                  <MapPin size={14} className="text-red-600" />
                  Business Address *
                </label>
                <textarea
                  value={formData.business_address}
                  onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                  required
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
                  placeholder="123 Main Street, Lagos"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-600">City</label>
                <input
                  type="text"
                  value={formData.business_city}
                  onChange={(e) => setFormData({ ...formData, business_city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
                  placeholder="Lagos"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-600">State</label>
                <input
                  type="text"
                  value={formData.business_state}
                  onChange={(e) => setFormData({ ...formData, business_state: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
                  placeholder="Lagos"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Industry</label>
                <input
                  type="text"
                  value={formData.business_industry}
                  onChange={(e) => setFormData({ ...formData, business_industry: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
                  placeholder="Healthcare, Education, etc."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Size</label>
                <select
                  value={formData.business_size}
                  onChange={(e) => setFormData({ ...formData, business_size: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-black focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
                >
                      <option value="">Select size...</option>
                      <option value="small">Small (1-10 employees)</option>
                      <option value="medium">Medium (11-50 employees)</option>
                      <option value="large">Large (50+ employees)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-5 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                <ArrowRight size={20} />
              </motion.button>
            </form>

            {/* Footer Links */}
            <div className="text-center space-y-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/auth/login')}
                  className="text-red-600 hover:text-red-700 font-bold transition-colors"
                >
                  Sign In
                </button>
              </p>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2 font-medium">Looking for work?</p>
                <button
                  onClick={() => router.push('/auth/register/staff')}
                  className="text-sm text-green-600 hover:text-green-700 font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  Apply as Cleaning or Security Professional
                  <ArrowRight size={14} />
                </button>
              </div>
              <button
                onClick={() => router.push('/')}
                className="text-xs text-gray-600 hover:text-red-600 transition-colors"
              >
                ← Back to Home
              </button>
            </div>
      </motion.div>
    </div>
  );
}
