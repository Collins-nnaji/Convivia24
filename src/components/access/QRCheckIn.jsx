import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, Camera, X, Check, AlertCircle, Smartphone, 
  Scan, MapPin, Clock, Users, Crown, Gift, Sparkles
} from 'lucide-react';

const QRCheckIn = ({ isOpen, onClose, event, venue }) => {
  const [scanningMode, setScanningMode] = useState('display'); // 'display', 'scan', 'success', 'error'
  const [scanResult, setScanResult] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const mockUser = {
    id: 'CV24-123456',
    name: 'John Doe',
    tier: 'premium',
    age: 28,
    isVerified: true
  };

  const mockEvent = event || {
    title: 'Rooftop Summer Party',
    venue: 'Sky Lounge',
    date: '2024-06-15',
    time: '20:00',
    address: '123 High Street, London',
    perks: ['Welcome drink', 'VIP area access', '10% off food']
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanningMode('scan');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setScanningMode('error');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const simulateQRScan = () => {
    // Simulate successful scan after 2 seconds
    setTimeout(() => {
      setScanResult({
        eventId: mockEvent.id || 'event-123',
        venueId: venue?.id || 'venue-456',
        timestamp: new Date().toISOString(),
        userId: mockUser.id
      });
      setVerificationStatus('verifying');
      
      // Simulate verification process
      setTimeout(() => {
        setVerificationStatus('success');
        setScanningMode('success');
        stopCamera();
      }, 1500);
    }, 2000);
  };

  useEffect(() => {
    if (scanningMode === 'scan') {
      simulateQRScan();
    }
  }, [scanningMode]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const generateQRCode = () => {
    // In real implementation, this would generate an actual QR code
    const qrData = {
      userId: mockUser.id,
      eventId: mockEvent.id || 'event-123',
      timestamp: new Date().toISOString(),
      signature: 'hash-signature'
    };
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="10" y="10" width="20" height="20" fill="black"/>
        <rect x="40" y="10" width="20" height="20" fill="black"/>
        <rect x="70" y="10" width="20" height="20" fill="black"/>
        <rect x="100" y="10" width="20" height="20" fill="black"/>
        <rect x="130" y="10" width="20" height="20" fill="black"/>
        <rect x="160" y="10" width="20" height="20" fill="black"/>
        <rect x="10" y="40" width="20" height="20" fill="black"/>
        <rect x="70" y="40" width="20" height="20" fill="black"/>
        <rect x="130" y="40" width="20" height="20" fill="black"/>
        <rect x="10" y="70" width="20" height="20" fill="black"/>
        <rect x="40" y="70" width="20" height="20" fill="black"/>
        <rect x="100" y="70" width="20" height="20" fill="black"/>
        <rect x="160" y="70" width="20" height="20" fill="black"/>
        <rect x="10" y="100" width="20" height="20" fill="black"/>
        <rect x="70" y="100" width="20" height="20" fill="black"/>
        <rect x="130" y="100" width="20" height="20" fill="black"/>
        <rect x="160" y="100" width="20" height="20" fill="black"/>
        <rect x="10" y="130" width="20" height="20" fill="black"/>
        <rect x="40" y="130" width="20" height="20" fill="black"/>
        <rect x="70" y="130" width="20" height="20" fill="black"/>
        <rect x="100" y="130" width="20" height="20" fill="black"/>
        <rect x="10" y="160" width="20" height="20" fill="black"/>
        <rect x="70" y="160" width="20" height="20" fill="black"/>
        <rect x="130" y="160" width="20" height="20" fill="black"/>
        <rect x="160" y="160" width="20" height="20" fill="black"/>
        <text x="100" y="195" text-anchor="middle" font-family="Arial" font-size="8" fill="gray">CV24-123456</text>
      </svg>
    `)}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Event Check-In</h2>
              <p className="text-gray-600 text-sm">
                {scanningMode === 'display' ? 'Show your QR code' : 
                 scanningMode === 'scan' ? 'Scanning...' :
                 scanningMode === 'success' ? 'Check-in successful!' : 'Ready to scan'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {scanningMode === 'display' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                {/* QR Code Display */}
                <div className="mb-6">
                  <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-200 rounded-xl p-4 shadow-lg">
                    <img 
                      src={generateQRCode()} 
                      alt="QR Code" 
                      className="w-full h-full"
                    />
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-1">Member ID</div>
                    <div className="font-mono text-lg font-semibold">{mockUser.id}</div>
                  </div>
                </div>

                {/* Event Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-3">{mockEvent.title}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{mockEvent.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>{mockEvent.date} at {mockEvent.time}</span>
                    </div>
                  </div>
                </div>

                {/* Member Perks */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Gift size={16} className="text-red-600" />
                    Your Perks
                  </h4>
                  <div className="space-y-2">
                    {mockEvent.perks.map((perk, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Sparkles size={14} className="text-green-500" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={startCamera}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    <Scan size={20} />
                    Scan Venue QR Code
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Show this QR code to venue staff or scan their QR code to check in
                  </p>
                </div>
              </motion.div>
            )}

            {scanningMode === 'scan' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                {/* Camera View */}
                <div className="relative mb-6">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-64 bg-black rounded-lg object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Scanning Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-red-500 rounded-lg relative">
                      <motion.div
                        animate={{ y: [0, 180, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-x-0 top-0 h-0.5 bg-red-500 shadow-lg"
                      />
                      <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-red-500"></div>
                      <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-red-500"></div>
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-red-500"></div>
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-red-500"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Scan size={20} />
                    </motion.div>
                    <span className="font-medium">
                      {verificationStatus === 'verifying' ? 'Verifying...' : 'Looking for QR code...'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Position the QR code within the frame
                  </p>
                  <button
                    onClick={() => {
                      setScanningMode('display');
                      stopCamera();
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {scanningMode === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Check size={40} className="text-green-600" />
                </motion.div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to {mockEvent.venue}!</h3>
                <p className="text-gray-600 mb-6">
                  You've been successfully checked in to {mockEvent.title}
                </p>

                {/* Check-in Details */}
                <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-medium text-green-900 mb-3">Check-in Confirmed</h4>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span>{mockEvent.venue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Member Tier:</span>
                      <span className="flex items-center gap-1">
                        {mockUser.tier === 'premium' && <Star size={14} />}
                        {mockUser.tier === 'vip' && <Crown size={14} />}
                        {mockUser.tier.charAt(0).toUpperCase() + mockUser.tier.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activated Perks */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Activated Perks</h4>
                  <div className="space-y-2">
                    {mockEvent.perks.map((perk, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="flex items-center gap-2 text-sm bg-red-50 text-red-700 p-2 rounded"
                      >
                        <Check size={14} className="text-green-600" />
                        <span>{perk}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Continue to Event
                </button>
              </motion.div>
            )}

            {scanningMode === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={40} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Camera Access Required</h3>
                <p className="text-gray-600 mb-6">
                  Please allow camera access to scan QR codes
                </p>
                <div className="space-y-3">
                  <button
                    onClick={startCamera}
                    className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setScanningMode('display')}
                    className="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Show My QR Code Instead
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QRCheckIn;
