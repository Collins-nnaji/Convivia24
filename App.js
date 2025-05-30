import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import VenueDetail from './pages/VenueDetail';
import Hotspots from './pages/Hotspots';
import Connect from './pages/Connect';
import ConviviaPass from './pages/ConviviaPass';
import BusinessRegister from './pages/BusinessRegister';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import { CommunityProvider } from './context/CommunityContext';
import { AIProvider } from './context/AIContext';
import AIEventAssistant from './components/AIEventAssistant';

// Wrap routes with AnimatePresence
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/events" element={<Events />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/venue/:id" element={<VenueDetail />} />
        <Route path="/hotspots" element={<Hotspots />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/experiences" element={<Navigate to="/connect" replace />} />
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
        <AIProvider>
          <Router>
            <Layout>
              <AnimatedRoutes />
              <AIEventAssistant />
            </Layout>
          </Router>
        </AIProvider>
      </CommunityProvider>
    </AuthProvider>
  );
}

export default App; 