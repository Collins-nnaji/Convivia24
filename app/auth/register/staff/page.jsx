'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, UserPlus, Mail, Lock, MapPin, Phone, 
  AlertCircle, CheckCircle2, Upload, Calendar, Clock,
  Briefcase, Award, FileText, Building, ShieldCheck
} from 'lucide-react';

export default function StaffRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    service_category: 'cleaning', // 'cleaning', 'security', or 'both'
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    postcode: '',
    city: '',
    county: '',
    country: 'Nigeria',
    availability: {
      monday: { available: true, start: '08:00', end: '18:00' },
      tuesday: { available: true, start: '08:00', end: '18:00' },
      wednesday: { available: true, start: '08:00', end: '18:00' },
      thursday: { available: true, start: '08:00', end: '18:00' },
      friday: { available: true, start: '08:00', end: '18:00' },
      saturday: { available: false, start: '09:00', end: '17:00' },
      sunday: { available: false, start: '09:00', end: '17:00' },
    },
    service_areas: [], // Which areas they can work in
    experience_years: '',
    certifications: [],
    licenses: [], // For security staff (Security licenses)
    license_number: '', // Security license number
    license_expiry: '', // License expiry date
    sia_licensed: false,
    background_check: false,
    dbs_check: false,
    references: [
      { name: '', phone: '', relationship: '' },
      { name: '', phone: '', relationship: '' },
    ],
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Added service category selection as step 1

  const serviceAreas = [
    'Lagos Mainland', 'Lagos Island', 'Ikeja', 'Victoria Island', 'Lekki',
    'Abuja (FCT)', 'Garki', 'Wuse', 'Maitama', 'Asokoro',
    'Port Harcourt', 'Kano', 'Ibadan', 'Enugu', 'Kaduna',
    'Abeokuta', 'Onitsha', 'Calabar', 'Uyo', 'Benin City',
  ];

  const cleaningCertifications = [
    'Basic Cleaning Certification',
    'Health & Safety Training',
    'Food Safety & Hygiene',
    'Infection Control',
    'Waste Management',
    'First Aid Certificate',
    'Manual Handling',
    'Environmental Sanitation',
  ];

  const securityLicenses = [
    'Private Security Guard License',
    'Event Security License',
    'Corporate Security License',
    'Estate Security License',
    'VIP Protection License',
    'CCTV Operator License',
    'Armed Security License',
  ];

  const getCertifications = () => {
    if (formData.service_category === 'security') {
      return securityLicenses;
    }
    return cleaningCertifications;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show success message and redirect
        router.push('/auth/register/staff/success');
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

  const toggleAvailability = (day) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day],
          available: !formData.availability[day].available,
        },
      },
    });
  };

  const toggleServiceArea = (area) => {
    const areas = formData.service_areas.includes(area)
      ? formData.service_areas.filter(a => a !== area)
      : [...formData.service_areas, area];
    setFormData({ ...formData, service_areas: areas });
  };

  const toggleCertification = (cert) => {
    const certs = formData.certifications.includes(cert)
      ? formData.certifications.filter(c => c !== cert)
      : [...formData.certifications, cert];
    setFormData({ ...formData, certifications: certs });
  };

  const toggleLicense = (license) => {
    const licenses = formData.licenses.includes(license)
      ? formData.licenses.filter(l => l !== license)
      : [...formData.licenses, license];
    setFormData({ ...formData, licenses });
  };

  const updateReference = (index, field, value) => {
    const references = [...formData.references];
    references[index][field] = value;
    setFormData({ ...formData, references });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return formData.service_category !== '';
      case 2:
        return formData.email && formData.password && formData.first_name && formData.last_name && formData.phone;
      case 3:
        return formData.postcode && formData.city && formData.county && formData.service_areas.length > 0;
      case 4:
        return true; // Availability is optional
      case 5:
        const hasValidReferences = formData.references.some(r => r.name && r.phone);
        const hasSecurityRequirements = (formData.service_category === 'security' || formData.service_category === 'both')
          ? formData.sia_licensed && formData.license_number && formData.licenses.length > 0
          : true;
        const hasCleaningRequirements = (formData.service_category === 'cleaning' || formData.service_category === 'both')
          ? formData.dbs_check
          : true;
        return formData.background_check && hasValidReferences && hasSecurityRequirements && hasCleaningRequirements;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl space-y-8"
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
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black">
            Work With Us
          </h1>
          <p className="text-gray-600 text-sm font-medium">
            Join Convivia 24 as a cleaning or security professional. Register now and get vetted for on-demand work across Nigeria.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4, 5].map((step) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-2 flex-1">
                <motion.div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-sm transition-all ${
                    currentStep === step
                      ? 'bg-red-600 border-red-600 text-white'
                      : currentStep > step
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {currentStep > step ? <CheckCircle2 size={20} /> : step}
                </motion.div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-600 text-center">
                  {step === 1 && 'Service Type'}
                  {step === 2 && 'Personal'}
                  {step === 3 && 'Location'}
                  {step === 4 && 'Availability'}
                  {step === 5 && 'Vetting'}
                </p>
              </div>
              {step < 5 && (
                <div className={`h-1 flex-1 mx-2 rounded-full ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form */}
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

          {/* Step 1: Service Category Selection */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 p-8 rounded-2xl bg-gray-50 border border-gray-200"
            >
              <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-4">What Service Do You Provide?</h2>
              <p className="text-sm text-gray-600 font-medium mb-6">
                Select whether you're applying as a cleaning professional, security professional, or both.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { 
                    id: 'cleaning', 
                    label: 'Cleaning & Sanitation', 
                    icon: Briefcase, 
                    description: 'Home, commercial, deep cleaning, and estate sanitation services',
                    color: 'red'
                  },
                  { 
                    id: 'security', 
                    label: 'Security Services', 
                    icon: Lock, 
                    description: 'Event security, home guards, office security, estate patrols (Security license required)',
                    color: 'blue'
                  },
                  { 
                    id: 'both', 
                    label: 'Both Services', 
                    icon: Building, 
                    description: 'Offer both cleaning and security services (requires Security license for security)',
                    color: 'green'
                  },
                ].map((option) => {
                  const Icon = option.icon;
                  const isSelected = formData.service_category === option.id;
                  const colorClasses = {
                    red: {
                      bg: 'bg-red-100',
                      border: 'border-red-300',
                      text: 'text-red-700',
                      iconBg: 'bg-red-600',
                      iconText: 'text-red-600'
                    },
                    blue: {
                      bg: 'bg-blue-100',
                      border: 'border-blue-300',
                      text: 'text-blue-700',
                      iconBg: 'bg-blue-600',
                      iconText: 'text-blue-600'
                    },
                    green: {
                      bg: 'bg-green-100',
                      border: 'border-green-300',
                      text: 'text-green-700',
                      iconBg: 'bg-green-600',
                      iconText: 'text-green-600'
                    }
                  };
                  const colors = colorClasses[option.color] || colorClasses.red;
                  
                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({ ...formData, service_category: option.id })}
                      className={`p-6 rounded-2xl border-2 transition-all text-left ${
                        isSelected
                          ? `${colors.bg} ${colors.border} shadow-xl`
                          : 'bg-white border-gray-200 hover:border-gray-300 shadow-md'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center text-white mb-4`}>
                        <Icon size={24} />
                      </div>
                      <h3 className={`text-lg font-black uppercase tracking-tight mb-2 ${
                        isSelected ? colors.text : 'text-black'
                      }`}>
                        {option.label}
                      </h3>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        {option.description}
                      </p>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-4 flex items-center gap-2"
                        >
                          <CheckCircle2 size={18} className={colors.iconText} />
                          <span className={`text-xs font-black uppercase tracking-wider ${colors.text}`}>
                            Selected
                          </span>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 p-8 rounded-2xl bg-gray-50 border border-gray-200"
            >
              <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                    <UserPlus size={14} className="text-red-600" />
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Last Name *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
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
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                    <Phone size={14} className="text-red-600" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
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
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                    placeholder="•••••••• (min 8 characters)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                    <Briefcase size={14} className="text-red-600" />
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                    placeholder="e.g. 3"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Location & Service Areas */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 p-8 rounded-2xl bg-gray-50 border border-gray-200"
            >
              <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-4">Location & Service Areas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                    <MapPin size={14} className="text-red-600" />
                    Area/Location *
                  </label>
                  <input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                    placeholder="e.g. Ikeja, Victoria Island, Lekki"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-600">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                    placeholder="Lagos"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-600">State *</label>
                  <input
                    type="text"
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                    placeholder="Lagos State"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                  <MapPin size={14} className="text-red-600" />
                  Service Areas (Select all areas you can work in) *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {serviceAreas.map((area) => (
                    <motion.button
                      key={area}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleServiceArea(area)}
                      className={`p-3 rounded-xl border-2 text-sm font-bold uppercase tracking-wider transition-all ${
                        formData.service_areas.includes(area)
                          ? 'bg-red-100 border-red-300 text-red-700 shadow-md'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'
                      }`}
                    >
                      {area}
                    </motion.button>
                  ))}
                </div>
                {formData.service_areas.length === 0 && (
                  <p className="text-xs text-red-600 font-medium">Please select at least one service area</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Availability */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 p-8 rounded-2xl bg-gray-50 border border-gray-200"
            >
              <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-4">Availability</h2>
              <p className="text-sm text-gray-600 font-medium mb-6">
                Set your weekly availability. You can update this anytime after approval.
              </p>

              <div className="space-y-4">
                {Object.entries(formData.availability).map(([day, schedule]) => (
                  <motion.div
                    key={day}
                    className="p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-red-300 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={schedule.available}
                          onChange={() => toggleAvailability(day)}
                          className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm font-black uppercase tracking-wider text-black capitalize">
                          {day}
                        </span>
                      </label>
                      {schedule.available && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={schedule.start}
                            onChange={(e) => {
                              const newAvailability = { ...formData.availability };
                              newAvailability[day].start = e.target.value;
                              setFormData({ ...formData, availability: newAvailability });
                            }}
                            className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-black text-sm font-medium focus:outline-none focus:border-red-500"
                          />
                          <span className="text-gray-500 font-medium">to</span>
                          <input
                            type="time"
                            value={schedule.end}
                            onChange={(e) => {
                              const newAvailability = { ...formData.availability };
                              newAvailability[day].end = e.target.value;
                              setFormData({ ...formData, availability: newAvailability });
                            }}
                            className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-black text-sm font-medium focus:outline-none focus:border-red-500"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black uppercase tracking-wider text-blue-700 mb-1">Note</p>
                    <p className="text-xs text-blue-600 font-medium">
                      Availability can be updated anytime. For urgent/emergency jobs, you may be contacted outside your set hours if you opt-in.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Vetting & References */}
          {currentStep === 5 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 p-8 rounded-2xl bg-gray-50 border border-gray-200"
            >
              <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-4">Vetting & References</h2>
              
              {/* Security License Information (if security selected) */}
              {(formData.service_category === 'security' || formData.service_category === 'both') && (
                <div className="p-6 rounded-xl bg-blue-50 border-2 border-blue-200 space-y-4 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock size={24} className="text-blue-600" />
                    <h3 className="text-lg font-black uppercase tracking-tight text-blue-700">
                      Security License Information (Required)
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2 block">
                        Security License Number *
                      </label>
                      <input
                        type="text"
                        value={formData.license_number}
                        onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                        required={formData.service_category === 'security' || formData.service_category === 'both'}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                        placeholder="SEC-XXXX-XXXX"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2 block">
                          License Expiry Date *
                        </label>
                        <input
                          type="date"
                          value={formData.license_expiry}
                          onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                          required={formData.service_category === 'security' || formData.service_category === 'both'}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-black focus:outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-8">
                        <input
                          type="checkbox"
                          id="sia_licensed"
                          checked={formData.sia_licensed}
                          onChange={(e) => setFormData({ ...formData, sia_licensed: e.target.checked })}
                          required={formData.service_category === 'security' || formData.service_category === 'both'}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="sia_licensed" className="text-sm font-black uppercase tracking-wider text-blue-700">
                          I have a valid Security license *
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                        <Award size={14} className="text-blue-600" />
                        Security License Types (Select all that apply) *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {securityLicenses.map((license) => (
                          <motion.button
                            key={license}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleLicense(license)}
                            className={`p-3 rounded-xl border-2 text-xs font-bold uppercase tracking-wider transition-all text-center ${
                              formData.licenses.includes(license)
                                ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-md'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                            }`}
                          >
                            {license}
                          </motion.button>
                        ))}
                      </div>
                      {formData.service_category === 'security' && formData.licenses.length === 0 && (
                        <p className="text-xs text-red-600 font-medium">Please select at least one Security license type</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Certifications (for cleaning) */}
              {(formData.service_category === 'cleaning' || formData.service_category === 'both') && (
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                    <Award size={14} className="text-red-600" />
                    Certifications (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {cleaningCertifications.map((cert) => (
                      <motion.button
                        key={cert}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleCertification(cert)}
                        className={`p-3 rounded-xl border-2 text-xs font-bold uppercase tracking-wider transition-all text-center ${
                          formData.certifications.includes(cert)
                            ? 'bg-green-100 border-green-300 text-green-700 shadow-md'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
                        }`}
                      >
                        {cert}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Background Checks */}
              <div className="space-y-4">
                {(formData.service_category === 'cleaning' || formData.service_category === 'both') && (
                  <div className="p-4 rounded-xl bg-white border-2 border-gray-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.dbs_check}
                        onChange={(e) => setFormData({ ...formData, dbs_check: e.target.checked })}
                        required={formData.service_category === 'cleaning' || formData.service_category === 'both'}
                        className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 mt-0.5"
                      />
                      <div>
                      <p className="text-sm font-black uppercase tracking-wider text-black mb-1">
                        I consent to a comprehensive background check *
                      </p>
                      <p className="text-xs text-gray-600 font-medium">
                        Required for cleaning professionals. We'll conduct this after your application is reviewed.
                      </p>
                      </div>
                    </label>
                  </div>
                )}
                
                <div className="p-4 rounded-xl bg-white border-2 border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.background_check}
                      onChange={(e) => setFormData({ ...formData, background_check: e.target.checked })}
                      required
                      className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-black uppercase tracking-wider text-black mb-1">
                        I consent to a comprehensive background check *
                      </p>
                      <p className="text-xs text-gray-600 font-medium">
                        Required for all professionals. We'll verify your information and references in Nigeria.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* References */}
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                  <FileText size={14} className="text-red-600" />
                  References (At least one required) *
                </label>
                {formData.references.map((ref, index) => (
                  <div key={index} className="p-4 rounded-xl bg-white border border-gray-200 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Reference {index + 1}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={ref.name}
                        onChange={(e) => updateReference(index, 'name', e.target.value)}
                        placeholder="Name"
                        required={index === 0}
                        className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm"
                      />
                      <input
                        type="tel"
                        value={ref.phone}
                        onChange={(e) => updateReference(index, 'phone', e.target.value)}
                        placeholder="Phone"
                        required={index === 0}
                        className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm"
                      />
                      <input
                        type="text"
                        value={ref.relationship}
                        onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                        placeholder="Relationship (e.g. Former Employer)"
                        className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-red-500 transition-all"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-red-500 transition-all"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Relationship</label>
                    <input
                      type="text"
                      value={formData.emergency_contact_relationship}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-red-500 transition-all"
                      placeholder="Spouse, Parent, Sibling, etc."
                    />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-600">Additional Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-red-500 transition-all"
                  placeholder="Any additional information you'd like to share..."
                />
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 pt-6">
            {currentStep > 1 && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevStep}
                className="px-6 py-4 bg-white border-2 border-gray-300 text-black font-black rounded-xl hover:bg-gray-50 hover:border-red-300 transition-all uppercase tracking-wider text-sm shadow-lg flex items-center gap-2"
              >
                ← Previous
              </motion.button>
            )}
            <div className="flex-1" />
            {currentStep < totalSteps ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="px-6 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all uppercase tracking-wider text-sm shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
              >
                Next Step
                <ArrowRight size={18} />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={loading || !isStepValid(currentStep)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-all uppercase tracking-wider text-sm shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
                <CheckCircle2 size={18} />
              </motion.button>
            )}
          </div>
        </form>

        {/* Footer Links */}
        <div className="text-center space-y-2 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/auth/login')}
              className="text-red-600 hover:text-red-700 font-bold transition-colors"
            >
              Sign In
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
