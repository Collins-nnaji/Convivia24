import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Calendar, Users, CheckCircle, Sparkles, ArrowRight, Globe, Upload, X } from 'lucide-react';

const BusinessRegisterModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    venueName: '',
    venueType: '',
    description: '',
    address: '',
    city: '',
    country: '',
    website: '',
    phoneNumber: '',
    email: '',
    capacity: '',
    eventTypes: [],
    amenities: []
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

  const handleCheckboxChange = (item, type) => {
    const currentArray = formData[type];
    if (currentArray.includes(item)) {
      setFormData({
        ...formData,
        [type]: currentArray.filter(f => f !== item)
      });
    } else {
      setFormData({
        ...formData,
        [type]: [...currentArray, item]
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
    console.log({ ...formData, businessType, location, files });
    setCurrentStep(4); // Move to success step
  };

  const handleClose = () => {
    setCurrentStep(1);
    setBusinessType('');
    setLocation('');
    setFiles([]);
    setFormData({
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
    onClose();
  };

  const steps = [
    { number: 1, title: 'Basic Information' },
    { number: 2, title: 'Location & Details' },
    { number: 3, title: 'Photos & Features' },
    { number: 4, title: 'Success' }
  ];

  const businessTypes = [
    { id: 'concert-venue', name: 'Concert Venue', icon: '🎵' },
    { id: 'nightclub', name: 'Nightclub & Bar', icon: '🍺' },
    { id: 'conference-center', name: 'Conference Center', icon: '🏢' },
    { id: 'restaurant', name: 'Restaurant & Lounge', icon: '🍽️' },
    { id: 'rooftop', name: 'Rooftop & Outdoor', icon: '🌆' },
    { id: 'cultural', name: 'Cultural Center', icon: '🎭' },
    { id: 'sports', name: 'Sports Venue', icon: '⚽' },
    { id: 'other', name: 'Other Event Space', icon: '🎉' }
  ];

  const locations = [
    { id: 'lagos', name: 'Lagos', flag: '🇳🇬' },
    { id: 'abuja', name: 'Abuja', flag: '🇳🇬' },
    { id: 'london', name: 'London', flag: '🇬🇧' },
    { id: 'manchester', name: 'Manchester', flag: '🇬🇧' },
    { id: 'other', name: 'Other Location', flag: '🌍' }
  ];

  const eventTypes = [
    'Concerts', 'Conferences', 'Networking Events', 'Food & Wine Tastings', 
    'Cultural Events', 'Sports Viewing', 'Private Parties', 'Corporate Events'
  ];

  const amenities = [
    'Wi-Fi', 'Parking', 'Outdoor Space', 'Private Rooms', 'Wheelchair Access',
    'Live Music Setup', 'Sound System', 'Lighting', 'Bar Service', 'Catering', 'Dance Floor'
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">List Your Event Venue</h2>
              <p className="text-gray-600 mt-1">Connect with event-goers and grow your venue</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.number 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.number ? <CheckCircle size={16} /> : step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step.number ? 'bg-red-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Step 1: Business Type & Basic Info */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold mb-6">What type of venue or event space do you operate?</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {businessTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setBusinessType(type.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        businessType === type.id 
                          ? 'border-red-500 bg-red-50 text-red-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-medium">{type.name}</div>
                    </motion.button>
                  ))}
                </div>

                <h3 className="text-xl font-semibold mb-6">Where are you located?</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {locations.map((loc) => (
                    <motion.button
                      key={loc.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setLocation(loc.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        location === loc.id 
                          ? 'border-red-500 bg-red-50 text-red-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{loc.flag}</div>
                      <div className="font-medium">{loc.name}</div>
                    </motion.button>
                  ))}
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
                  />
                </div>
                
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleNextStep}
                    disabled={!businessType || !location || !formData.name || !formData.description}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                    <ArrowRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Location & Contact Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold mb-6">Contact & Location Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">Email Address</label>
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
                  
                  <div>
                    <label htmlFor="phoneNumber" className="block text-gray-700 mb-2 font-medium">Phone Number</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all"
                      placeholder="+234 xxx xxx xxxx"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="address" className="block text-gray-700 mb-2 font-medium">Business Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all"
                    placeholder="Street address"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label htmlFor="city" className="block text-gray-700 mb-2 font-medium">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all"
                      placeholder="City name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-gray-700 mb-2 font-medium">Country</label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 transition-all"
                      required
                    >
                      <option value="">Select Country</option>
                      <option value="nigeria">Nigeria</option>
                      <option value="uk">United Kingdom</option>
                      <option value="other">Other</option>
                    </select>
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
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
                  >
                    Previous
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleNextStep}
                    disabled={!formData.email || !formData.phoneNumber || !formData.address || !formData.city || !formData.country}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                    <ArrowRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Features & Photos */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold mb-6">Venue Details & Features</h3>
                
                <div className="mb-8">
                  <h4 className="font-medium text-gray-700 mb-4">What types of events do you host? (Select all that apply)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {eventTypes.map((eventType) => (
                      <motion.label
                        key={eventType}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.eventTypes.includes(eventType)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.eventTypes.includes(eventType)}
                          onChange={() => handleCheckboxChange(eventType, 'eventTypes')}
                          className="sr-only"
                        />
                        <span className={`text-sm font-medium ${
                          formData.eventTypes.includes(eventType) ? 'text-red-700' : 'text-gray-700'
                        }`}>
                          {eventType}
                        </span>
                      </motion.label>
                    ))}
                  </div>
                </div>
                
                <div className="mb-8">
                  <h4 className="font-medium text-gray-700 mb-4">What amenities does your venue offer? (Select all that apply)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((amenity) => (
                      <motion.label
                        key={amenity}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.amenities.includes(amenity)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleCheckboxChange(amenity, 'amenities')}
                          className="sr-only"
                        />
                        <span className={`text-sm font-medium ${
                          formData.amenities.includes(amenity) ? 'text-red-700' : 'text-gray-700'
                        }`}>
                          {amenity}
                        </span>
                      </motion.label>
                    ))}
                  </div>
                </div>
                
                <div className="mb-8">
                  <h4 className="font-medium text-gray-700 mb-4">Upload Business Photos (Optional)</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="mx-auto text-gray-400 mb-4" size={32} />
                    <p className="text-gray-600 mb-4">Drag and drop photos here, or click to select</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="px-6 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 transition-colors"
                    >
                      Choose Files
                    </label>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-700 mb-2">Uploaded Files:</h5>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
                  >
                    Previous
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition-all"
                  >
                    Submit Application
                    <CheckCircle size={16} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="text-green-600" size={40} />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Thank you for your interest in joining our B2B partner program. We'll review your application and get back to you within 2-3 business days.
                </p>
                
                <div className="bg-red-50 rounded-lg p-6 max-w-md mx-auto mb-8">
                  <h4 className="font-semibold text-red-700 mb-3">What's Next?</h4>
                  <ul className="text-sm text-red-600 space-y-2 text-left">
                    <li>• We'll verify your business information</li>
                    <li>• You'll receive access to wholesale pricing</li>
                    <li>• Get dedicated account management</li>
                    <li>• Start ordering premium spirits in bulk</li>
                  </ul>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
                >
                  Close
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BusinessRegisterModal;
