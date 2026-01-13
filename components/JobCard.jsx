'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, Clock, DollarSign, 
  User, ChevronRight, AlertCircle
} from 'lucide-react';

const statusColors = {
  pending: 'bg-orange-100 text-orange-700 border-orange-300',
  scheduled: 'bg-gray-100 text-gray-800 border-gray-300',
  in_progress: 'bg-red-100 text-red-700 border-red-300',
  completed: 'bg-green-100 text-green-700 border-green-300',
  cancelled: 'bg-red-100 text-red-700 border-red-300',
};

const urgencyColors = {
  routine: 'text-gray-600',
  urgent: 'text-orange-600',
  emergency: 'text-red-600',
};

export default function JobCard({ job, onClick, index = 0 }) {
  const {
    id,
    status,
    urgency,
    scheduled_start,
    location_address,
    total_cost,
    service_name,
    business_name,
    requested_by_first_name,
    requested_by_last_name,
    assignment_status,
  } = job;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={onClick}
      className="group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-red-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        {/* Left Section */}
        <div className="flex-1 space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black mb-1 sm:mb-2 group-hover:text-red-600 transition-colors">
                {service_name || 'Service Request'}
              </h3>
              {business_name && (
                <p className="text-xs sm:text-sm text-gray-600 font-medium">{business_name}</p>
              )}
            </div>
            
            {/* Status Badge */}
            <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border text-[10px] sm:text-xs font-black uppercase tracking-wider flex-shrink-0 ${statusColors[status] || statusColors.pending}`}>
              {status?.replace('_', ' ') || 'pending'}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Date/Time */}
            {scheduled_start && (
              <div className="flex items-center gap-3 text-black">
                <Calendar size={16} className="text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Scheduled</p>
                  <p className="text-sm font-medium text-black">{formatDate(scheduled_start)}</p>
                </div>
              </div>
            )}

            {/* Location */}
            {location_address && (
              <div className="flex items-start gap-3 text-black">
                <MapPin size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Location</p>
                  <p className="text-sm font-medium text-black truncate">{location_address}</p>
                </div>
              </div>
            )}

            {/* Cost */}
                {total_cost > 0 && (
              <div className="flex items-center gap-2 sm:gap-3 text-black">
                <DollarSign size={14} className="sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">Cost</p>
                      <p className="text-xs sm:text-sm font-medium text-black">₦{total_cost.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            )}

            {/* Urgency */}
            {urgency && (
              <div className="flex items-center gap-2 sm:gap-3 text-black">
                <AlertCircle size={14} className={`sm:w-4 sm:h-4 ${urgencyColors[urgency] || urgencyColors.routine} flex-shrink-0`} />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">Urgency</p>
                  <p className={`text-xs sm:text-sm font-medium capitalize ${urgencyColors[urgency] || urgencyColors.routine}`}>
                    {urgency}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Requested By */}
          {(requested_by_first_name || requested_by_last_name) && (
            <div className="flex items-center gap-3 text-gray-600">
              <User size={14} className="text-gray-500" />
              <span className="text-xs font-medium">
                Requested by {[requested_by_first_name, requested_by_last_name].filter(Boolean).join(' ') || 'Client'}
              </span>
            </div>
          )}

          {/* Assignment Status (for staff) */}
          {assignment_status && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock size={12} className="text-red-600" />
              <span className="font-medium capitalize">{assignment_status.replace('_', ' ')}</span>
            </div>
          )}
        </div>

        {/* Right Section - Arrow */}
        <div className="flex items-center justify-center sm:justify-end">
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-gray-400 group-hover:text-red-600 transition-colors"
          >
            <ChevronRight size={20} className="sm:w-6 sm:h-6" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
