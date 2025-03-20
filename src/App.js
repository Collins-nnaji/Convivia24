import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Events from './pages/Events';
import Hotspots from './pages/Hotspots';
import Experiences from './pages/Experiences';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import { CommunityProvider } from './context/CommunityContext';

function App() {
  return (
    <AuthProvider>
      <CommunityProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/events" element={<Events />} />
              <Route path="/hotspots" element={<Hotspots />} />
              <Route path="/experiences" element={<Experiences />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </Router>
      </CommunityProvider>
    </AuthProvider>
  );
}

export default App;