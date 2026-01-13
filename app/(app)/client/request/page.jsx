'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, Calendar, MapPin, AlertCircle, Clock, DollarSign, CheckCircle, Sparkles, Lock, Star } from 'lucide-react';

export default function RequestService() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'cleaning', 'security', 'bundle'
  const [formData, setFormData] = useState({
    service_id: '',
    urgency: 'routine',
    scheduled_start: '',
    scheduled_end: '',
    location_address: '',
    special_instructions: '',
  });
  const [selectedService, setSelectedService] = useState(null);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (formData.service_id) {
      const service = services.find(s => s.id === formData.service_id);
      if (service) {
        setSelectedService(service);
        calculateQuote(service, formData.urgency);
      }
    }
  }, [formData.service_id, formData.urgency, services]);

  const fetchServices = async () => {
    try {
      // Services endpoint is public, no auth needed
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Fetch services error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateQuote = (service, urgency) => {
    if (!service) return;
    
    let cost = service.base_price || 0;
    if (urgency === 'urgent') {
      cost = cost * 1.5;
    } else if (urgency === 'emergency') {
      cost = cost * 2;
    }

    setQuote({
      base_price: service.base_price,
      urgency_multiplier: urgency === 'urgent' ? 1.5 : urgency === 'emergency' ? 2 : 1,
      total_cost: cost,
      duration: service.duration_hours,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...formData,
          total_cost: quote?.total_cost || selectedService?.base_price || 0,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/client/jobs/${data.booking.id}`);
      } else {
        setError(data.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Create booking error:', error);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter services by category
  const filteredServices = services.filter(service => {
    // Category filter
    if (selectedCategory !== 'all' && service.category !== selectedCategory) {
      return false;
    }
    // Urgency filter - show all services for routine, filter for urgent/emergency
    if (formData.urgency === 'emergency' || formData.urgency === 'urgent') {
      // Show rapid/emergency services for urgent requests
      return service.type === 'rapid' || service.type === 'emergency' || service.category === 'security';
    }
    return true;
  });

    // Format currency for Nigeria (NGN)
    const formatCurrency = (amount) => `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter italic text-black mb-2">
          Request Service
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">Choose cleaning, security, or both. Get instant pricing and confirmed quotes.</p>
      </div>

      {/* Service Category Selector */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-200">
        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-600">Service Type:</span>
        {[
          { id: 'all', label: 'All Services', icon: Star, color: 'gray' },
          { id: 'cleaning', label: 'Cleaning', icon: Sparkles, color: 'red' },
          { id: 'security', label: 'Security', icon: Lock, color: 'blue' },
          { id: 'bundle', label: 'Bundles', icon: Star, color: 'green' },
        ].map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          return (
            <motion.button
              key={category.id}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedCategory(category.id);
                setFormData({ ...formData, service_id: '' }); // Clear selection when category changes
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-black uppercase tracking-wider text-xs transition-all shadow-sm ${
                isActive
                  ? category.id === 'cleaning'
                    ? 'bg-red-100 border-red-300 text-red-700 shadow-md'
                    : category.id === 'security'
                    ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-md'
                    : category.id === 'bundle'
                    ? 'bg-green-100 border-green-300 text-green-700 shadow-md'
                    : 'bg-gray-100 border-gray-300 text-gray-700 shadow-md'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'
              }`}
            >
              <Icon size={16} />
              {category.label}
            </motion.button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 sm:p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 sm:gap-3"
          >
            <AlertCircle size={18} className="sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-red-700 font-medium">{error}</p>
          </motion.div>
        )}

        {/* Urgency Selection */}
        <div className="space-y-3 sm:space-y-4">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
            <AlertCircle size={14} className="sm:w-4 sm:h-4 text-red-600" />
            Urgency Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { value: 'routine', label: 'Routine', desc: 'Normal scheduling', selectedBg: 'bg-gray-100', selectedBorder: 'border-gray-300', selectedText: 'text-gray-800' },
              { value: 'urgent', label: 'Urgent', desc: 'Same-day response', selectedBg: 'bg-orange-100', selectedBorder: 'border-orange-300', selectedText: 'text-orange-700' },
              { value: 'emergency', label: 'Emergency', desc: 'Immediate response', selectedBg: 'bg-red-100', selectedBorder: 'border-red-300', selectedText: 'text-red-700' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, urgency: option.value, service_id: option.value === 'emergency' || option.value === 'urgent' ? '' : formData.service_id })}
                className={`p-3 sm:p-4 rounded-xl border transition-all text-left ${
                  formData.urgency === option.value
                    ? `${option.selectedBg} ${option.selectedBorder} ${option.selectedText}`
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-red-300'
                }`}
              >
                <p className="font-black uppercase tracking-tight mb-1">{option.label}</p>
                <p className="text-xs text-gray-500">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Service Selection */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            Service Type
          </label>
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading services...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {filteredServices.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, service_id: service.id })}
                  className={`p-4 sm:p-5 md:p-6 rounded-xl border transition-all text-left shadow-sm ${
                    formData.service_id === service.id
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-red-300'
                  }`}
                >
                  <p className="font-black uppercase tracking-tight mb-2">{service.name}</p>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-red-600 font-black">
                      <DollarSign size={12} />
                      {formatCurrency(service.base_price || 0)}
                      {service.pricing_model === 'hourly' && '/hr'}
                      {service.pricing_model === 'daily' && '/day'}
                      {service.pricing_model === 'monthly' && '/month'}
                    </div>
                    {service.duration_hours && (
                      <span className="flex items-center gap-1 text-gray-600 font-bold">
                        <Clock size={12} />
                        {service.duration_hours >= 24 
                          ? `${Math.round(service.duration_hours / 24)} days`
                          : `${service.duration_hours}hrs`}
                      </span>
                    )}
                  </div>
                  {service.category && (
                    <div className="mt-2">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded ${
                        service.category === 'cleaning'
                          ? 'bg-red-100 text-red-700'
                          : service.category === 'security'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {service.category === 'cleaning' ? 'CONVIVIA24 CLEAN' : 
                         service.category === 'security' ? 'CONVIVIA24 SECURE' : 
                         'BUNDLE'}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
              <Calendar size={14} className="sm:w-4 sm:h-4 text-red-600" />
              Preferred Start Time
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_start}
              onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
              className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl bg-white border border-gray-200 text-black focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
              <Clock size={14} className="sm:w-4 sm:h-4 text-red-600" />
              Preferred End Time
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_end}
              onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
              className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl bg-white border border-gray-200 text-black focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
            <MapPin size={14} className="sm:w-4 sm:h-4 text-red-600" />
            Service Location Address
          </label>
          <textarea
            value={formData.location_address}
            onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
            required
            rows={3}
            className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-sm sm:text-base"
            placeholder="Enter full address where service is needed"
          />
        </div>

        {/* Special Instructions */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
            Special Instructions (Optional)
          </label>
          <textarea
            value={formData.special_instructions}
            onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
            rows={4}
            className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl bg-white border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-sm sm:text-base"
            placeholder="Any specific requirements or special instructions..."
          />
        </div>

        {/* Quote Display */}
        {quote && selectedService && (
          <div className="p-4 sm:p-6 rounded-xl bg-green-50 border border-green-300 space-y-2 sm:space-y-3 shadow-lg">
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-green-700">Estimated Quote</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-700">
                <span className="font-bold">Base Price:</span>
                <span className="font-black">{formatCurrency(quote.base_price)}</span>
              </div>
              {quote.urgency_multiplier > 1 && (
                <div className="flex justify-between text-orange-700">
                  <span className="font-bold">Urgency Premium ({Math.round((quote.urgency_multiplier - 1) * 100)}%):</span>
                  <span className="font-black">{formatCurrency(quote.total_cost - quote.base_price)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-black text-black pt-3 border-t-2 border-gray-300">
                <span>Total Cost:</span>
                <span className="text-red-600">{formatCurrency(quote.total_cost)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 pt-2">
                <span className="font-bold">Estimated Duration:</span>
                <span className="font-black">
                  {quote.duration >= 24 
                    ? `${Math.round(quote.duration / 24)} days`
                    : `${quote.duration} hours`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={submitting || !formData.service_id || !formData.location_address}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-5 sm:px-6 py-4 sm:py-5 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 sm:gap-3 uppercase tracking-wider text-xs sm:text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
        >
          {submitting ? 'Submitting Request...' : 'Submit Service Request'}
          <ArrowRight size={18} className="sm:w-5 sm:h-5" />
        </motion.button>
      </form>
    </div>
  );
}
