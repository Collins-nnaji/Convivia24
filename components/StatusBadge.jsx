'use client';

import React from 'react';

const statusConfig = {
  pending: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
    label: 'Pending'
  },
  scheduled: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    label: 'Scheduled'
  },
  in_progress: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
    label: 'In Progress'
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
    label: 'Completed'
  },
  cancelled: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
    label: 'Cancelled'
  },
  assigned: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    label: 'Assigned'
  },
  accepted: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
    label: 'Accepted'
  },
  started: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
    label: 'Started'
  },
  draft: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    label: 'Draft'
  },
  sent: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    label: 'Sent'
  },
  paid: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
    label: 'Paid'
  },
  overdue: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
    label: 'Overdue'
  },
  compliant: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
    label: 'Compliant'
  },
  non_compliant: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
    label: 'Non-Compliant'
  },
  verified: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
    label: 'Verified'
  },
};

export default function StatusBadge({ status, size = 'default' }) {
  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  
  const sizeClasses = {
    small: 'px-2 py-1 text-[10px]',
    default: 'px-3 py-1.5 text-xs',
    large: 'px-4 py-2 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border font-black uppercase tracking-wider ${config.bg} ${config.text} ${config.border} ${sizeClasses[size] || sizeClasses.default}`}
    >
      {config.label || status?.replace('_', ' ') || 'Unknown'}
    </span>
  );
}
