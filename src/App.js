import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AppLayout from './components/layout/AppLayout';
import Discovery from './pages/Discovery';
import Saved from './pages/Saved';
import Profile from './pages/Profile';
import Business from './pages/Business';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* App Routes wrapped in Layout */}
        <Route element={<AppLayout />}>
          <Route path="/explore" element={<Discovery />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/business" element={<Business />} />
          {/* Redirect Feed to Explore */}
          <Route path="/feed" element={<Navigate to="/explore" replace />} />
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;