import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import Events from './pages/Events';
import Shopping from './pages/Shopping';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import ConviviaPass from './pages/ConviviaPass';
import BusinessRegister from './pages/BusinessRegister';
import OrganizerDashboard from './pages/OrganizerDashboard';

import AgeGate from './components/AgeGate';
import { RewardsProvider } from './context/RewardsContext';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import { CommunityProvider } from './context/CommunityContext';
import { CartProvider } from './context/CartContext';

// Wrap routes with AnimatePresence
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<Events />} />
        <Route path="/shopping" element={<AgeGate><Shopping /></AgeGate>} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/conviviapass" element={<ConviviaPass />} />
        <Route path="/business-register" element={<BusinessRegister />} />

        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/experiences" element={<Navigate to="/venues" replace />} />
        <Route path="/hotspots" element={<Navigate to="/venues" replace />} />
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
        <CartProvider>
          <RewardsProvider>
            <Router>
              <Layout>
                <AnimatedRoutes />
              </Layout>
            </Router>
          </RewardsProvider>
        </CartProvider>
      </CommunityProvider>
    </AuthProvider>
  );
}

export default App;