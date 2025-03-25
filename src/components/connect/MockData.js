import {
  Globe, Utensils, Palette, Dumbbell, 
  Plane, Book, Music, Camera, Mountain, 
  Gamepad, Coffee
} from 'lucide-react';
import React from 'react';

export const interests = [
  { id: 'all', name: 'All Interests', icon: <Globe size={24} /> },
  { id: 'food', name: 'Food & Drinks', icon: <Utensils size={24} /> },
  { id: 'culture', name: 'Arts & Culture', icon: <Palette size={24} /> },
  { id: 'fitness', name: 'Fitness & Sports', icon: <Dumbbell size={24} /> },
  { id: 'travel', name: 'Travel', icon: <Plane size={24} /> },
  { id: 'books', name: 'Books & Reading', icon: <Book size={24} /> },
  { id: 'music', name: 'Music', icon: <Music size={24} /> },
  { id: 'photography', name: 'Photography', icon: <Camera size={24} /> },
  { id: 'outdoor', name: 'Outdoors', icon: <Mountain size={24} /> },
  { id: 'gaming', name: 'Gaming', icon: <Gamepad size={24} /> },
  { id: 'social', name: 'Coffee Chats', icon: <Coffee size={24} /> }
];

export const hotspots = [
  { id: 'all', name: 'All Locations' },
  { id: 'brew', name: 'The Brew Café' },
  { id: 'highland', name: 'Highland Trekkers Club' },
  { id: 'jazz', name: 'Jazz Corner' },
  { id: 'victoria', name: 'Victoria Island Bistro' },
  { id: 'green', name: 'Green Juice Bar' },
  { id: 'brick', name: 'Brick Lane Gallery' },
  { id: 'southbank', name: 'Southbank Centre' }
];

export const people = [
  {
    id: 1,
    name: 'Sarah Thompson',
    username: '@sarah_t',
    interests: ['food', 'photography', 'travel'],
    bio: 'Food lover and amateur photographer. Always looking for new cuisine adventures and interesting people to chat with!',
    location: 'Lagos, Nigeria',
    status: 'Online now',
    activeHotspots: ['The Brew Café', 'Victoria Island Bistro'],
    compatibility: 92,
    lastActive: '2 minutes ago',
    connections: 143,
    occupation: 'Food Photographer',
    education: 'University of Lagos',
    languages: ['English', 'Yoruba'],
    tags: ['Foodie', 'Photography', 'Travel'],
    verified: true,
    age: 28,
    joinDate: 'January 2023'
  },
  {
    id: 2,
    name: 'James Wilson',
    username: '@jwilson',
    interests: ['photography', 'outdoor', 'culture'],
    bio: 'Street photographer with a passion for urban exploration. Let\'s connect and maybe explore the city together!',
    location: 'London, UK',
    status: 'Active today',
    activeHotspots: ['Brick Lane Gallery', 'Southbank Centre'],
    compatibility: 85,
    lastActive: '1 hour ago',
    connections: 89,
    occupation: 'Graphic Designer',
    education: 'Central Saint Martins',
    languages: ['English', 'Spanish'],
    tags: ['Photography', 'Art', 'Hiking'],
    verified: true,
    age: 31,
    joinDate: 'March 2023'
  },
  {
    id: 3,
    name: 'Priya Patel',
    username: '@priya_om',
    interests: ['fitness', 'outdoor', 'food'],
    bio: 'Yoga instructor and wellness enthusiast. Love connecting with positive, health-conscious people!',
    location: 'Lagos, Nigeria',
    status: 'Online now',
    activeHotspots: ['Green Juice Bar', 'Highland Trekkers Club'],
    compatibility: 78,
    lastActive: 'Just now',
    connections: 215,
    occupation: 'Yoga Instructor',
    education: 'Wellness Academy',
    languages: ['English', 'Hindi', 'Gujarati'],
    tags: ['Fitness', 'Wellness', 'Vegan'],
    verified: true,
    age: 30,
    joinDate: 'November 2022'
  },
  {
    id: 4,
    name: 'Chinwe Okonkwo',
    username: '@chinwe_reads',
    interests: ['books', 'culture', 'coffee'],
    bio: 'Avid reader and literary critic. Currently obsessed with contemporary African literature. Always up for book discussions!',
    location: 'London, UK',
    status: 'Last seen 2h ago',
    activeHotspots: ['The Brew Café', 'Brick Lane Gallery'],
    compatibility: 88,
    lastActive: '2 hours ago',
    connections: 67,
    occupation: 'Literary Editor',
    education: 'University of London',
    languages: ['English', 'Igbo', 'French'],
    tags: ['Books', 'Writing', 'Culture'],
    verified: true,
    age: 34,
    joinDate: 'August 2022'
  },
  {
    id: 5,
    name: 'Mike Johnson',
    username: '@mike_trek',
    interests: ['outdoor', 'fitness', 'travel'],
    bio: 'Adventure enthusiast and nature lover. If it involves mountains, count me in! Looking for hiking buddies.',
    location: 'Lagos, Nigeria',
    status: 'Online now',
    activeHotspots: ['Highland Trekkers Club', 'Green Juice Bar'],
    compatibility: 72,
    lastActive: '5 minutes ago',
    connections: 172,
    occupation: 'Adventure Tour Guide',
    education: 'University of Adventure',
    languages: ['English', 'Hausa'],
    tags: ['Hiking', 'Adventure', 'Fitness'],
    verified: false,
    age: 32,
    joinDate: 'February 2023'
  },
  {
    id: 6,
    name: 'David Ahmed',
    username: '@dave_music',
    interests: ['music', 'culture', 'social'],
    bio: 'Music producer and vinyl collector. Always hunting for new sounds and interesting conversations about music.',
    location: 'London, UK',
    status: 'Active today',
    activeHotspots: ['Jazz Corner', 'Southbank Centre'],
    compatibility: 65,
    lastActive: '3 hours ago',
    connections: 124,
    occupation: 'Music Producer',
    education: 'Royal Academy of Music',
    languages: ['English', 'Arabic'],
    tags: ['Music', 'Production', 'Vinyl'],
    verified: true,
    age: 36,
    joinDate: 'May 2023'
  },
  {
    id: 7,
    name: 'Amara Okafor',
    username: '@amaracooks',
    interests: ['food', 'culture', 'social'],
    bio: 'Chef and culinary explorer. Love discussing food traditions and sharing recipes from around the world.',
    location: 'Lagos, Nigeria',
    status: 'Last seen 1h ago',
    activeHotspots: ['The Brew Café', 'Victoria Island Bistro'],
    compatibility: 80,
    lastActive: '1 hour ago',
    connections: 93,
    occupation: 'Professional Chef',
    education: 'Culinary Institute',
    languages: ['English', 'Igbo', 'French'],
    tags: ['Cooking', 'Food', 'Culture'],
    verified: true,
    age: 29,
    joinDate: 'April 2023'
  },
  {
    id: 8,
    name: 'Tom Richards',
    username: '@tom_games',
    interests: ['gaming', 'tech', 'social'],
    bio: 'Gamer and tech enthusiast. From board games to eSports, I\'m always up for gaming conversations and meetups.',
    location: 'London, UK',
    status: 'Online now',
    activeHotspots: ['Jazz Corner', 'The Brew Café'],
    compatibility: 70,
    lastActive: 'Just now',
    connections: 156,
    occupation: 'Software Developer',
    education: 'Imperial College London',
    languages: ['English'],
    tags: ['Gaming', 'Tech', 'eSports'],
    verified: false,
    age: 27,
    joinDate: 'June 2023'
  }
];

export const connectionRequests = [
  {
    id: 1,
    name: 'Emma Rodriguez',
    timeAgo: '2 hours ago',
    message: 'Hi there! I noticed we share an interest in photography. Would love to connect and maybe do a photo walk sometime!',
    meetup: {
      location: 'Brick Lane Gallery',
      date: 'Saturday, May 5th at 2:00 PM'
    }
  },
  {
    id: 2,
    name: 'Daniel Lee',
    timeAgo: 'Yesterday',
    message: 'Hey! I saw that you\'re into hiking as well. The Highland Trekkers Club is having an event next weekend - would you be interested in joining?',
    meetup: {
      location: 'Highland Trekkers Club',
      date: 'Sunday, May 6th at 9:00 AM'
    }
  },
  {
    id: 3,
    name: 'Olivia Wang',
    timeAgo: '3 days ago',
    message: 'Hello! I\'m new to the area and looking to meet people who enjoy live music. Would you be interested in checking out the Jazz Corner sometime?'
  }
];

export const pendingRequests = [
  {
    id: 1,
    name: 'Michael Brown',
    timeAgo: '5 hours ago',
    message: "Hi! I'm a big fan of the same books you mentioned in your profile. Would love to discuss them over coffee!",
    meetup: {
      location: 'The Brew Café',
      date: 'Friday, May 4th at 3:30 PM'
    }
  },
  {
    id: 2,
    name: 'Sofia Garcia',
    timeAgo: '2 days ago',
    message: "Hey! Noticed we're both into vegan cooking. Would you like to check out the new Green Juice Bar that just opened?"
  }
];

export const activeConnections = [
  {
    id: 1,
    name: 'John Smith',
    date: 'March 15, 2023',
    lastActivity: 'Coffee meetup at The Brew Café'
  },
  {
    id: 2,
    name: 'Anna Davies',
    date: 'February 28, 2023',
    lastActivity: 'Photo exhibition at Brick Lane Gallery'
  },
  {
    id: 3,
    name: 'Marcus Johnson',
    date: 'April 10, 2023',
    lastActivity: 'Jazz night at Jazz Corner'
  }
]; 