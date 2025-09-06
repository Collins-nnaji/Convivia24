import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, Clock, Users, CreditCard, Ticket, Crown, 
  CheckCircle, AlertCircle, Star, MapPin, Phone, Mail
} from 'lucide-react';

const BookingModal = ({ isOpen, onClose, event, venue }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ticketType: 'standard',
    quantity: 1,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    agreeToTerms: false
  });
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !event) return null;

  const ticketTypes = [
    {
      id: 'standard',
      name: 'Standard',
      price: event.price === 'Free' ? 0 : parseFloat(event.price.replace(/[£₦,]/g, '')),
      description: 'General admission ticket',
      features: ['Event access', 'Standard seating']
    },
    {
      id: 'vip',
      name: 'VIP',
      price: event.price === 'Free' ? 50 : parseFloat(event.price.replace(/[£₦,]/g, '')) * 1.5,
      description: 'Premium experience with exclusive benefits',
      features: ['Priority entry', 'VIP area access', 'Complimentary drinks', 'Meet & greet']
    },
    {
      id: 'group',
      name: 'Group (5+)',
      price: event.price === 'Free' ? 0 : parseFloat(event.price.replace(/[£₦,]/g, '')) * 0.8,
      description: 'Discounted rate for groups of 5 or more',
      features: ['Group discount', 'Reserved seating', 'Event access']
    }
  ];

  const selectedTicket = ticketTypes.find(t => t.id === formData.ticketType);
  const totalPrice = selectedTicket.price * formData.quantity;
  const currency = event.price.includes('£') ? '£' : event.price.includes('₦') ? '₦' : '';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    // Simulate booking process
    setTimeout(() => {
      setIsProcessing(false);
      setStep(4); // Success step
    }, 2000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Book Event</h2>
                  <p className="text-gray-600">{event.title}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-center mt-6">
                {[1, 2, 3, 4].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= stepNumber
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step > stepNumber ? <CheckCircle size={16} /> : stepNumber}
                    </div>
                    {stepNumber < 4 && (
                      <div
                        className={`w-16 h-1 mx-2 ${
                          step > stepNumber ? 'bg-red-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Event Details */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            {event.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={16} />
                            {venue?.name || event.venue}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Selection */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Select Ticket Type</h3>
                    <div className="space-y-4">
                      {ticketTypes.map((ticket) => (
                        <div
                          key={ticket.id}
                          className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                            formData.ticketType === ticket.id
                              ? 'border-red-600 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleInputChange('ticketType', ticket.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  formData.ticketType === ticket.id
                                    ? 'border-red-600 bg-red-600'
                                    : 'border-gray-300'
                                }`}
                              >
                                {formData.ticketType === ticket.id && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{ticket.name}</h4>
                                  {ticket.id === 'vip' && <Crown size={16} className="text-yellow-500" />}
                                </div>
                                <p className="text-sm text-gray-600">{ticket.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                {ticket.price === 0 ? 'Free' : `${currency}${ticket.price}`}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 ml-8">
                            <ul className="text-sm text-gray-600 space-y-1">
                              {ticket.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <CheckCircle size={14} className="text-green-500" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Number of Tickets</h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleInputChange('quantity', Math.max(1, formData.quantity - 1))}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="text-xl font-semibold w-12 text-center">{formData.quantity}</span>
                      <button
                        onClick={() => handleInputChange('quantity', formData.quantity + 1)}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Any dietary requirements, accessibility needs, or other requests..."
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold">Review & Payment</h3>
                  
                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold mb-4">Order Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>{selectedTicket.name} Ticket × {formData.quantity}</span>
                        <span>{currency}{selectedTicket.price * formData.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Fee</span>
                        <span>{currency}5.00</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>{currency}{totalPrice + 5}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h4 className="font-semibold mb-4">Payment Method</h4>
                    <div className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CreditCard size={24} className="text-gray-600" />
                        <div>
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-sm text-gray-600">Secure payment processing</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      className="mt-1 w-4 h-4 text-red-600"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the <a href="#" className="text-red-600 hover:underline">Terms and Conditions</a> and 
                      <a href="#" className="text-red-600 hover:underline"> Privacy Policy</a>
                    </label>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-600 mb-6">
                    Your tickets have been booked successfully. You'll receive a confirmation email shortly.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Ticket size={20} className="text-red-600" />
                      <span className="font-semibold">Booking Reference: #CV24-{Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formData.quantity} × {selectedTicket.name} ticket{formData.quantity > 1 ? 's' : ''} for {event.title}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {step < 4 && (
              <div className="sticky bottom-0 bg-white border-t p-6 rounded-b-2xl">
                <div className="flex justify-between items-center">
                  <button
                    onClick={step === 1 ? onClose : handleBack}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {step === 1 ? 'Cancel' : 'Back'}
                  </button>
                  
                  <div className="flex items-center gap-4">
                    {step === 3 && (
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total</div>
                        <div className="text-xl font-bold">{currency}{totalPrice + 5}</div>
                      </div>
                    )}
                    <button
                      onClick={step === 3 ? handleSubmit : handleNext}
                      disabled={step === 3 && (!formData.agreeToTerms || isProcessing)}
                      className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : step === 3 ? (
                        'Complete Booking'
                      ) : (
                        'Continue'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="sticky bottom-0 bg-white border-t p-6 rounded-b-2xl">
                <div className="flex gap-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Print Tickets
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
