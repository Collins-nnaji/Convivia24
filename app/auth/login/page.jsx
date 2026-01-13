'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Redirect based on role
      const role = result.user.role;
      if (role === 'client') {
        router.push('/client/dashboard');
      } else if (role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'staff') {
        router.push('/staff/dashboard');
      } else if (role === 'supervisor') {
        router.push('/supervisor/jobs');
      } else {
        router.push('/');
      }
    } else {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6 sm:space-y-8"
      >
        {/* Logo & Header */}
        <div className="text-center space-y-4">
          <motion.img
            src="/Logo2.png"
            alt="Convivia 24"
            className="w-16 h-16 mx-auto opacity-90"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic text-black">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm">
            Sign in to your Convivia 24 account
          </p>
        </div>

        {/* Login Form */}
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

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
              <Mail size={14} className="text-red-600" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-4 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
              placeholder="business@example.com"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
              <Lock size={14} className="text-red-600" />
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-4 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-5 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
          >
            {loading ? (
              'Signing In...'
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Links */}
        <div className="text-center space-y-2 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/auth/register')}
              className="text-red-600 hover:text-red-700 font-bold transition-colors"
            >
              Register as Client
            </button>
          </p>
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
