import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, MapPin, Clock, Users, CreditCard, 
  CheckCircle, AlertCircle, Loader2, Star
} from 'lucide-react';
import { bookingService, paymentService } from '../../services/eventService';

const BookingModal = ({ isOpen, onClose, event, currentUser }) => {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    ticketType: 'general',
    quantity: 1,
    attendees: []
  });
  const [paymentData, setPaymentData] = useState({
    method: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    email: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setBookingData({
        ticketType: 'general',
        quantity: 1,
        attendees: []
      });
      setPaymentData({
        method: 'credit_card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        name: currentUser?.name || '',
        email: currentUser?.email || ''
      });
      setBookingResult(null);
      setErrors({});
    }
  }, [isOpen, currentUser]);

  const ticketTypes = [
    { id: 'general', name: 'General Admission', price: event?.price?.general || 0 },
    { id: 'vip', name: 'VIP', price: event?.price?.vip || 0 },
    { id: 'student', name: 'Student', price: event?.price?.student || 0 }
  ];

  const calculateTotal = () => {
    const selectedTicket = ticketTypes.find(t => t.id === bookingData.ticketType);
    return (selectedTicket?.price || 0) * bookingData.quantity;
  };

  const handleTicketTypeChange = (ticketType) => {
    setBookingData(prev => ({ ...prev, ticketType }));
  };

  const handleQuantityChange = (quantity) => {
    if (quantity > 0 && quantity <= 10) {
      setBookingData(prev => ({ ...prev, quantity }));
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentData(prev => ({ ...prev, method }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (bookingData.quantity > event.capacity - event.booked) {
      newErrors.quantity = 'Not enough tickets available';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!paymentData.name.trim()) newErrors.name = 'Name is required';
    if (!paymentData.email.trim()) newErrors.email = 'Email is required';
    if (paymentData.method === 'credit_card') {
      if (!paymentData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
      if (!paymentData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
      if (!paymentData.cvv.trim()) newErrors.cvv = 'CVV is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    try {
      // Process payment first
      const paymentResult = await paymentService.processPayment({
        amount: calculateTotal(),
        method: paymentData.method
      });

      if (paymentResult.success) {
        // Create booking
        const bookingResult = await bookingService.createBooking({
          userId: currentUser?.id || 'guest',
          eventId: event.id,
          ticketType: bookingData.ticketType,
          quantity: bookingData.quantity,
          totalPrice: calculateTotal(),
          paymentMethod: paymentData.method,
          paymentId: paymentResult.data.id,
          attendees: [
            {
              name: paymentData.name,
              email: paymentData.email
            }
          ]
        });

        if (bookingResult.success) {
          setBookingResult(bookingResult.data);
          setStep(4);
        } else {
          setErrors({ general: 'Booking failed. Please try again.' });
        }
      } else {
        setErrors({ general: 'Payment failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen || !event) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
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
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Book Event</h2>
                <p className="text-gray-600 mt-1">{event.title}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center mt-6 space-x-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > stepNumber ? <CheckCircle size={16} /> : stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Ticket Selection */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={event.images[0]}
                      alt={event.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar size={16} />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>{formatTime(event.time)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin size={16} />
                          <span>{event.venue?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Select Ticket Type</h4>
                  <div className="space-y-3">
                    {ticketTypes.map((ticket) => (
                      <label
                        key={ticket.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                          bookingData.ticketType === ticket.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="ticketType"
                            value={ticket.id}
                            checked={bookingData.ticketType === ticket.id}
                            onChange={() => handleTicketTypeChange(ticket.id)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{ticket.name}</div>
                            <div className="text-sm text-gray-600">
                              {ticket.id === 'vip' && 'Priority seating, welcome drink, meet & greet'}
                              {ticket.id === 'student' && 'Valid student ID required'}
                              {ticket.id === 'general' && 'Standard admission'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">${ticket.price}</div>
                          <div className="text-sm text-gray-600">per ticket</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Number of Tickets
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(bookingData.quantity - 1)}
                      disabled={bookingData.quantity <= 1}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-medium">{bookingData.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(bookingData.quantity + 1)}
                      disabled={bookingData.quantity >= 10}
                      className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  {errors.quantity && (
                    <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
                  )}
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${calculateTotal()}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment Information */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Payment Method</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {['credit_card', 'paypal'].map((method) => (
                      <label
                        key={method}
                        className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                          paymentData.method === method
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={paymentData.method === method}
                          onChange={() => handlePaymentMethodChange(method)}
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-2">
                          <CreditCard size={20} />
                          <span className="font-medium capitalize">
                            {method.replace('_', ' ')}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {paymentData.method === 'credit_card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.cardNumber && (
                        <p className="text-red-600 text-sm mt-1">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={paymentData.expiryDate}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.expiryDate && (
                          <p className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block font-medium text-gray-900 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.cvv && (
                          <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={paymentData.name}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={paymentData.email}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} className="text-blue-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Confirm Your Booking
                  </h4>
                  <p className="text-gray-600">
                    Please review your booking details before confirming
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event:</span>
                    <span className="font-medium">{event.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{formatTime(event.time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Venue:</span>
                    <span className="font-medium">{event.venue?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tickets:</span>
                    <span className="font-medium">
                      {bookingData.quantity}x {ticketTypes.find(t => t.id === bookingData.ticketType)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium capitalize">
                      {paymentData.method.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-blue-600">${calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm">{errors.general}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 4 && bookingResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={40} className="text-green-600" />
                </div>
                
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">
                    Booking Confirmed!
                  </h4>
                  <p className="text-gray-600">
                    Your tickets have been successfully booked
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-mono font-medium">{bookingResult.booking.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono font-medium">{bookingResult.booking.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Paid:</span>
                    <span className="font-semibold">${bookingResult.booking.totalPrice}</span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-blue-800 text-sm">
                    📧 A confirmation email has been sent to {paymentData.email}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
            <div className="flex items-center justify-between">
              {step > 1 && step < 4 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
              
              <div className="flex-1" />
              
              {step < 3 && (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              )}
              
              {step === 3 && (
                <button
                  onClick={handleConfirmBooking}
                  disabled={isProcessing}
                  className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm Booking</span>
                  )}
                </button>
              )}
              
              {step === 4 && (
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingModal;
