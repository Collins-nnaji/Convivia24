import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPageMobile from './components/LandingPageMobile';

import EventDiscoveryPremium from './pages/EventDiscoveryPremium';
import EventCompanions from './pages/EventCompanions';
import PartnerDashboard from './pages/PartnerDashboard';
import UserDashboard from './components/dashboard/UserDashboard';
import EventManagementDashboard from './components/dashboard/EventManagementDashboard';

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
                <Route path="/event-companions" element={<EventCompanions />} />
                <Route path="/partner-dashboard" element={<PartnerDashboard />} />
                
                {/* Dashboard Pages */}
                <Route path="/dashboard" element={<UserDashboard currentUser={{
                  id: 'user_1',
                  name: 'Alex Johnson',
                  email: 'alex.johnson@email.com',
                  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                  preferences: ['music', 'networking', 'tech'],
                  location: 'New York, NY',
                  joinedDate: '2024-01-15',
                  totalEvents: 12,
                  loyaltyPoints: 1250
                }} />} />
                <Route path="/manage-events" element={<EventManagementDashboard currentUser={{
                  id: 'org_1',
                  name: 'TechForward Inc.',
                  email: 'contact@techforward.com'
                }} />} />

        {/* Redirects */}
        <Route path="/events" element={<Navigate to="/discover" replace />} />
        <Route path="/music" element={<Navigate to="/discover" replace />} />
        <Route path="/live-updates" element={<Navigate to="/discover" replace />} />
        <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
        <Route path="/rewards" element={<Navigate to="/dashboard" replace />} />
        <Route path="/conviviapass" element={<Navigate to="/dashboard" replace />} />
        <Route path="/business-register" element={<Navigate to="/manage-events" replace />} />
        <Route path="/admin" element={<Navigate to="/manage-events" replace />} />
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