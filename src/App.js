import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
// Auth pages removed for now
import Events from './pages/Events';
import Venues from './pages/Venues';
import ConviviaPass from './pages/ConviviaPass';
import BusinessRegister from './pages/BusinessRegister';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import { CommunityProvider } from './context/CommunityContext';
import EventDiscoveryDetail from './components/EventDiscoveryDetail';

// Wrap routes with AnimatePresence
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        {/* Auth routes removed for now */}
        <Route path="/events" element={<Events />} />
        <Route path="/event/:id" element={<EventDiscoveryDetail />} />
        <Route path="/venues" element={<Venues />} />
        <Route path="/experiences" element={<Navigate to="/venues" replace />} />
        <Route path="/hotspots" element={<Navigate to="/venues" replace />} />
        <Route path="/conviviapass" element={<ConviviaPass />} />
        <Route path="/business-register" element={<BusinessRegister />} />
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
      <CommunityProvider>
        <Router>
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </Router>
      </CommunityProvider>
    </AuthProvider>
  );
}

export default App;