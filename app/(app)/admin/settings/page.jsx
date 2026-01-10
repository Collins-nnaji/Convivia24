'use client';

import React, { useState } from 'react';
import { Settings, Save, Bell, Shield, Globe, DollarSign } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    notifications: true,
    email_alerts: true,
    auto_invoice: true,
    default_payment_terms: 30,
    tax_rate: 7.5,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Save settings logic here
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Settings size={32} className="text-red-600" />
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black">Platform Settings</h1>
      </div>

      {/* Notification Settings */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-6 shadow-sm">
        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-black">
          <Bell size={24} className="text-red-600" />
          Notification Settings
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-red-300 transition-all">
            <div>
              <p className="font-bold text-black mb-1">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive email alerts for important events</p>
            </div>
            <input
              type="checkbox"
              checked={settings.email_alerts}
              onChange={(e) => setSettings({ ...settings, email_alerts: e.target.checked })}
              className="w-12 h-6 rounded-full bg-gray-200 border border-gray-300 appearance-none checked:bg-red-600 transition-all relative cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-red-300 transition-all">
            <div>
              <p className="font-bold text-black mb-1">In-App Notifications</p>
              <p className="text-sm text-gray-600">Show notifications in the platform</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
              className="w-12 h-6 rounded-full bg-gray-200 border border-gray-300 appearance-none checked:bg-red-600 transition-all relative cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Billing Settings */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-6 shadow-sm">
        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-black">
          <DollarSign size={24} className="text-green-600" />
          Billing Settings
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-green-300 transition-all">
            <div>
              <p className="font-bold text-black mb-1">Auto-Generate Invoices</p>
              <p className="text-sm text-gray-600">Automatically create invoices when jobs are completed</p>
            </div>
            <input
              type="checkbox"
              checked={settings.auto_invoice}
              onChange={(e) => setSettings({ ...settings, auto_invoice: e.target.checked })}
              className="w-12 h-6 rounded-full bg-gray-200 border border-gray-300 appearance-none checked:bg-green-600 transition-all relative cursor-pointer"
            />
          </label>
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
            <label className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2 block">
              Default Payment Terms (days)
            </label>
            <input
              type="number"
              value={settings.default_payment_terms}
              onChange={(e) => setSettings({ ...settings, default_payment_terms: parseInt(e.target.value) || 30 })}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-black focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
              min="1"
              max="90"
            />
          </div>
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
            <label className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2 block">
              Tax Rate (%)
            </label>
            <input
              type="number"
              value={settings.tax_rate}
              onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-black focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-wider text-sm flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 shadow-lg"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
