import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import Events from './pages/Events';
import ModernShopping from './pages/ModernShopping';
import DrinkDetail from './pages/DrinkDetail';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import ConviviaPass from './pages/ConviviaPass';
import BusinessRegister from './pages/BusinessRegister';


import AgeGate from './components/AgeGate';
import { RewardsProvider } from './context/RewardsContext';
import { LoyaltyProvider } from './context/LoyaltyContext';
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
        <Route path="/shopping" element={<AgeGate><ModernShopping /></AgeGate>} />
        <Route path="/drink/:id" element={<AgeGate><DrinkDetail /></AgeGate>} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/conviviapass" element={<ConviviaPass />} />
        <Route path="/business-register" element={<BusinessRegister />} />


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
          <LoyaltyProvider>
            <RewardsProvider>
              <Router>
                <Layout>
                  <AnimatedRoutes />
                </Layout>
              </Router>
            </RewardsProvider>
          </LoyaltyProvider>
        </CartProvider>
      </CommunityProvider>
    </AuthProvider>
  );
}

export default App;