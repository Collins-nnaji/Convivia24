import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogIn } from 'lucide-react';

const AuthNav = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex items-center space-x-4">
      {currentUser ? (
        <div className="flex items-center space-x-4">
          <Link 
            to="/profile"
            className="flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600"
          >
            {currentUser.profilePicture ? (
              <img 
                src={currentUser.profilePicture} 
                alt="Profile" 
                className="h-8 w-8 rounded-full mr-2 object-cover border-2 border-indigo-500"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                <User className="h-4 w-4 text-indigo-600" />
              </div>
            )}
            <span>{currentUser.name}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <LogIn className="h-4 w-4 mr-1" />
            Login
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};

export default AuthNav; 