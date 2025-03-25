import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Calendar, Users, CheckCircle, Sparkles, ArrowRight, Globe, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const BusinessRegister = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    website: '',
    phoneNumber: '',
    email: '',
    capacity: '',
    features: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleCheckboxChange = (feature) => {
    if (formData.features.includes(feature)) {
      setFormData({
        ...formData,
        features: formData.features.filter(f => f !== feature)
      });
    } else {
      setFormData({
        ...formData,
        features: [...formData.features, feature]
      });
    }
  };

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // This would handle the registration submission
    console.log({ ...formData, businessType, location, files });
    setCurrentStep(4); // Move to success step
  };

  const steps = [
    { number: 1, title: 'Basic Information' },
    { number: 2, title: 'Location & Details' },
    { number: 3, title: 'Photos & Features' },
    { number: 4, title: 'Success' }
  ];

  const features = [
    'Wi-Fi', 'Parking', 'Outdoor Space', 'Private Rooms', 'Wheelchair Access',
    'Live Music', 'Alcohol Served', 'Food Available', 'Family Friendly', 'Pet Friendly',
    'Corporate Events', 'Social Gatherings', 'Catering Available'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-block mb-6">
              <h1 className="text-3xl font-bold text-red-600">Convivia<span className="text-gray-800">24</span></h1>
            </Link>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Register Your Business
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our network of venues and service providers to promote your business and connect with potential customers.
            </p>
          </div>

          {/* Step Progress */}
          <div className="mb-10">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.number} className="flex flex-col items-center w-full">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    currentStep >= step.number ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle size={20} />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="text-sm text-center hidden sm:block">
                    {step.title}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 w-full ${
                      currentStep > index + 1 ? 'bg-red-600' : 'bg-gray-200'
                    } absolute top-5 left-1/2 -z-10`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Steps */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold mb-6">Tell us about your business</h3>
                
                <div className="mb-8">
                  <label className="block text-gray-700 mb-2 font-medium">Business Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setBusinessType('venue')}
                      className={`p-4 border rounded-lg flex flex-col items-center transition-all ${
                        businessType === 'venue' 
                          ? 'border-red-600 bg-red-50 text-red-600' 
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <Building size={32} className={businessType === 'venue' ? 'text-red-600' : 'text-gray-500'} />
                      <span className="mt-2 font-medium">Venue</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setBusinessType('event_organizer')}
                      className={`p-4 border rounded-lg flex flex-col items-center transition-all ${
                        businessType === 'event_organizer' 
                          ? 'border-red-600 bg-red-50 text-red-600' 
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <Calendar size={32} className={businessType === 'event_organizer' ? 'text-red-600' : 'text-gray-500'} />
                      <span className="mt-2 font-medium">Event Organizer</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setBusinessType('service_provider')}
                      className={`p-4 border rounded-lg flex flex-col items-center transition-all ${
                        businessType === 'service_provider' 
                          ? 'border-red-600 bg-red-50 text-red-600' 
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <Users size={32} className={businessType === 'service_provider' ? 'text-red-600' : 'text-gray-500'} />
                      <span className="mt-2 font-medium">Service Provider</span>
                    </button>
                  </div>
                </div>
                
                <div className="mb-8">
                  <label className="block text-gray-700 mb-2 font-medium">Location</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setLocation('nigeria')}
                      className={`p-4 border rounded-lg flex items-center gap-3 transition-all ${
                        location === 'nigeria' 
                          ? 'border-red-600 bg-red-50 text-red-600' 
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <span className="text-2xl">🇳🇬</span>
                      <span className="font-medium">Nigeria</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setLocation('uk')}
                      className={`p-4 border rounded-lg flex items-center gap-3 transition-all ${
                        location === 'uk' 
                          ? 'border-red-600 bg-red-50 text-red-600' 
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <span className="text-2xl">🇬🇧</span>
                      <span className="font-medium">United Kingdom</span>
                    </button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">Business Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all"
                    placeholder="Enter your business name"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="description" className="block text-gray-700 mb-2 font-medium">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all"
                    placeholder="Briefly describe your business..."
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!businessType || !location || !formData.name || !formData.description}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
            
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold mb-6">Location & Contact Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="address" className="block text-gray-700 mb-2 font-medium">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all"
                      placeholder="123 Business Street"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-gray-700 mb-2 font-medium">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all"
                      placeholder="City"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="phoneNumber" className="block text-gray-700 mb-2 font-medium">Phone Number</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all"
                      placeholder="+44 1234 567890"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all"
                      placeholder="business@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label htmlFor="website" className="block text-gray-700 mb-2 font-medium">Website (Optional)</label>
                    <div className="flex items-center">
                      <div className="bg-gray-100 px-4 py-3 rounded-l-lg border border-r-0 border-gray-300 text-gray-500">
                        <Globe size={18} />
                      </div>
                      <input
                        type="text"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-r-lg border border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all"
                        placeholder="www.yourbusiness.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="capacity" className="block text-gray-700 mb-2 font-medium">Capacity (Optional)</label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all"
                      placeholder="e.g., 100"
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!formData.address || !formData.city || !formData.phoneNumber || !formData.email}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
            
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold mb-6">Photos & Features</h3>
                
                <div className="mb-8">
                  <label className="block text-gray-700 mb-2 font-medium">Upload Photos</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <Upload size={40} className="text-gray-400 mb-2" />
                      <p className="text-gray-500 mb-1">Drag & drop files here or click to browse</p>
                      <p className="text-sm text-gray-400">Upload up to 5 photos of your venue/business</p>
                    </label>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-4">
                      {files.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mb-8">
                  <label className="block text-gray-700 mb-2 font-medium">Features & Amenities</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {features.map((feature) => (
                      <label
                        key={feature}
                        className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.features.includes(feature)
                            ? 'border-red-600 bg-red-50 text-red-600'
                            : 'border-gray-200 hover:border-red-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={formData.features.includes(feature)}
                          onChange={() => handleCheckboxChange(feature)}
                        />
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          formData.features.includes(feature)
                            ? 'border-red-600 bg-red-600 text-white'
                            : 'border-gray-300'
                        }`}>
                          {formData.features.includes(feature) && <CheckCircle size={12} />}
                        </div>
                        <span>{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition-all"
                  >
                    Submit Registration
                  </button>
                </div>
              </motion.div>
            )}
            
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Registration Successful!</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Thank you for registering your business with us. Your submission is under review and we'll contact you shortly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/business-dashboard" className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition-all">
                    <Building size={16} />
                    Go to Dashboard
                  </Link>
                  <Link to="/" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all">
                    Return to Home
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Benefits Section */}
          {currentStep < 4 && (
            <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="text-red-600" size={20} />
                Benefits of Joining
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Get discovered by thousands of potential customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Promote your events and services on our platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Receive bookings and inquiries directly through our system</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Access valuable analytics and customer insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Join our ConviviaPass partner program to offer exclusive benefits</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessRegister; 