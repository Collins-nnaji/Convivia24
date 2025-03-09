import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Community from './pages/Community';
import CommunityDetail from './pages/CommunityDetail';
import EventDetail from './pages/EventDetail';
import CreateCommunity from './pages/CreateCommunity';
import Events from './pages/Events';
import PlanCelebration from './pages/PlanCelebration';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
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
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route path="/community" element={<Community />} />
              <Route path="/community/:communityId" element={<CommunityDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/event/:eventId" element={<EventDetail />} />
              <Route 
                path="/create-community" 
                element={
                  <ProtectedRoute>
                    <CreateCommunity />
                  </ProtectedRoute>
                } 
              />
              <Route path="/plan-celebration" element={<PlanCelebration />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </Router>
      </CommunityProvider>
    </AuthProvider>
  );
}

export default App;