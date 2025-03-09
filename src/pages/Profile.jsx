import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Edit, Camera, LogOut } from 'lucide-react';

const Profile = () => {
  const { currentUser, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState(currentUser?.profilePicture || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // In a real app, this would make an API call to update the profile
      // For now, we'll just simulate a successful update
      await updateProfile({
        ...currentUser,
        profilePicture: previewUrl
      });
      
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" style={{ fontFamily: 'Raleway, sans-serif' }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          Your Profile
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-black to-red-900 text-white p-6 relative">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="relative mb-4 sm:mb-0 sm:mr-6">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-red-100 border-4 border-white">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={currentUser.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 m-auto text-red-600" />
                  )}
                </div>
                <label
                  htmlFor="profile-picture"
                  className="absolute bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer shadow-md"
                >
                  <Camera className="h-5 w-5 text-red-600" />
                  <input
                    type="file"
                    id="profile-picture"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                </label>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                <p className="text-gray-300 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {currentUser.email}
                </p>
              </div>
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="p-6">
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    className="pl-10 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Your name"
                    defaultValue={currentUser.name}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    className="pl-10 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Your email"
                    defaultValue={currentUser.email}
                    disabled={true}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    className="pl-10 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Leave blank to keep current password</p>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                  disabled={loading}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 