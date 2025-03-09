import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Upload, Tag as TagIcon } from 'lucide-react';

const CreateCommunity = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim()) {
      setError('Community name is required');
      return;
    }
    
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (tags.length === 0) {
      setError('At least one tag is required');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // In a real app, you would upload the image to a storage service
      // and get back a URL to store in the community data
      
      // Create a new community
      const newCommunity = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description.trim(),
        members: 1, // Creator is the first member
        memberCount: 1,
        image: previewUrl,
        tags,
        isJoined: true // Creator automatically joins
      };
      
      // In a real app, this would be an API call
      console.log('Creating community:', newCommunity);
      
      // Navigate to the communities page
      navigate('/community');
    } catch (err) {
      setError('Failed to create community');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" style={{ fontFamily: 'Raleway, sans-serif' }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          Create a New Community
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Community Image */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Community Image
              </label>
              <div className="flex items-center">
                <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden mr-4 flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Community preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <label className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Upload Image
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-1">Recommended size: 800x400 pixels</p>
            </div>
            
            {/* Community Name */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Community Name *
              </label>
              <input
                id="name"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter community name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description *
              </label>
              <textarea
                id="description"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Describe your community"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
            
            {/* Tags */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tags *
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <div key={index} className="flex items-center bg-red-100 text-red-800 rounded-full px-3 py-1">
                    <TagIcon className="h-3 w-3 mr-1" />
                    <span className="text-sm">{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Add a tag (e.g., wedding, traditional)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-r"
                >
                  Add
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Add at least one tag to categorize your community</p>
            </div>
            
            {/* Submit Button */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/community')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Community'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunity; 