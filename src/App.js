import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';

import AdminDashboard from './pages/AdminDashboard';
import ConviviaPass from './pages/ConviviaPass';
import BusinessRegister from './pages/BusinessRegister';
import Events from './pages/Events';
import MusicPage from './pages/Music';
import Profile from './pages/Profile';
import LiveUpdates from './pages/LiveUpdates';


import { RewardsProvider } from './context/RewardsContext';
import { LoyaltyProvider } from './context/LoyaltyContext';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';

// Wrap routes with AnimatePresence
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />

        {/* Nightlife & Social Events Platform */}
        <Route path="/events" element={<Events />} />
        <Route path="/music" element={<MusicPage />} />
        <Route path="/live-updates" element={<LiveUpdates />} />
        <Route path="/profile" element={<Profile />} />


        {/* Other Pages */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/conviviapass" element={<ConviviaPass />} />
        <Route path="/business-register" element={<BusinessRegister />} />

        {/* Redirects */}
        <Route path="/experiences" element={<Navigate to="/events" replace />} />
        <Route path="/hotspots" element={<Navigate to="/events" replace />} />
        <Route path="/business-dashboard" element={<Navigate to="/business-register" replace />} />
        <Route path="/business-demo" element={<Navigate to="/business-register" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <LoyaltyProvider>
        <RewardsProvider>
          <Router>
            <Layout>
              <AnimatedRoutes />
            </Layout>
          </Router>
        </RewardsProvider>
      </LoyaltyProvider>
    </AuthProvider>
  );
}

export default App;