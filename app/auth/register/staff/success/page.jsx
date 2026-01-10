'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Mail, Clock, ArrowRight, Home } from 'lucide-react';

export default function StaffRegistrationSuccess() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full space-y-8 text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black">
            Application Submitted!
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Thank you for your interest in joining Convivia 24.
          </p>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-8 rounded-2xl bg-gray-50 border border-gray-200 space-y-6 text-left"
        >
          <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-4">
            What Happens Next?
          </h2>
          <div className="space-y-4">
            {[
              {
                icon: Mail,
                title: 'Application Review',
                description: 'Our team will review your application and verify your information within 3-5 business days.',
              },
              {
                icon: Clock,
                title: 'Reference Check',
                description: 'We will contact your provided references to verify your experience and reliability.',
              },
              {
                icon: CheckCircle2,
                title: 'Background Check',
                description: 'If approved, we will arrange for a comprehensive background check to be conducted.',
              },
              {
                icon: Mail,
                title: 'Notification',
                description: 'You will receive an email notification with the result of your application.',
              },
              {
                icon: ArrowRight,
                title: 'Start Working',
                description: 'Once approved, you can start receiving job assignments in your selected service areas.',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:border-red-300 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <step.icon size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-black uppercase tracking-tight text-black mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="p-6 rounded-xl bg-blue-50 border border-blue-200"
        >
          <p className="text-sm text-gray-700 font-medium mb-2">
            Have questions about your application?
          </p>
          <p className="text-xs text-gray-600">
            Contact us at{' '}
            <a href="mailto:staff@convivia24.com" className="text-red-600 hover:text-red-700 font-bold">
              staff@convivia24.com
            </a>
            {' '}or call{' '}
            <a href="tel:+2348000000000" className="text-red-600 hover:text-red-700 font-bold">
              +234 800 000 0000
            </a>
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="px-6 py-4 bg-white border-2 border-gray-300 text-black font-black rounded-xl hover:bg-gray-50 hover:border-red-300 transition-all uppercase tracking-wider text-sm shadow-lg flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Back to Home
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/auth/login')}
            className="px-6 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-wider text-sm shadow-lg flex items-center justify-center gap-2"
          >
            Sign In
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
