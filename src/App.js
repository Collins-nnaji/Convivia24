import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPageMobile from './components/LandingPageMobile';

import EventDiscoveryPremium from './pages/EventDiscoveryPremium';
import PartnerDashboard from './pages/PartnerDashboard';

import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';

// Wrap routes with AnimatePresence
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPageMobile />} />

        {/* Core App Pages */}
        <Route path="/discover" element={<EventDiscoveryPremium />} />
        <Route path="/partner-dashboard" element={<PartnerDashboard />} />

        {/* Redirects */}
        <Route path="/events" element={<Navigate to="/discover" replace />} />
        <Route path="/music" element={<Navigate to="/discover" replace />} />
        <Route path="/live-updates" element={<Navigate to="/discover" replace />} />
        <Route path="/profile" element={<Navigate to="/" replace />} />
        <Route path="/rewards" element={<Navigate to="/" replace />} />
        <Route path="/conviviapass" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/business-register" element={<Navigate to="/partner-dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/partner-dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;