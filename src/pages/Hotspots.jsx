import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Music, 
  GlassWater, 
  Martini, 
  Calendar, 
  Filter, 
  Search, 
  ChevronDown, 
  ArrowRight,
  TrendingUp,
  Zap,
  Award,
  CheckCircle2,
  Beer,
  Wine,
  Cocktail,
  Coffee,
  Pizza,
  Utensils,
  Music2,
  Mic2,
  PartyPopper,
  Sparkles,
  CalendarDays,
  Clock4,
  Map,
  Phone,
  Globe,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Snapchat,
  TikTok,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Hotspots = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortOption, setSortOption] = useState('popularity');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');

  // Sample hotspots data with detailed information
  const hotspots = [
    {
      id: 1,
      name: 'The Grand Lounge',
      category: 'nightclub',
      type: 'Nightclub',
      location: 'Victoria Island, Lagos',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bmlnaHRjbHVifGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.8,
      price: '₦5,000 - ₦20,000',
      description: 'Luxury nightclub with world-class DJs and premium atmosphere',
      features: ['Live DJs', 'VIP Areas', 'Dance Floor', 'Cocktail Bar'],
      openingHours: '10:00 PM - 4:00 AM',
      capacity: 500,
      eventsCompleted: 150,
      popularity: 95,
      contact: {
        phone: '+234 777 123 4567',
        email: 'info@grandlounge.com',
        website: 'www.grandlounge.com',
        social: {
          instagram: '@grandlounge',
          facebook: 'GrandLounge',
          twitter: '@grandlounge'
        }
      },
      amenities: ['Parking', 'Security', 'Coat Check', 'VIP Rooms'],
      music: ['Hip Hop', 'R&B', 'Afrobeats', 'House'],
      dressCode: 'Smart Casual',
      specialEvents: ['Ladies Night', 'Happy Hour', 'Theme Nights'],
      reviews: [
        {
          user: 'John Doe',
          rating: 5,
          comment: 'Best nightclub in Lagos! Amazing atmosphere and great music.'
        },
        {
          user: 'Jane Smith',
          rating: 4,
          comment: 'Great VIP service but drinks are a bit expensive.'
        }
      ]
    },
    {
      id: 2,
      name: 'The Garden Lounge',
      category: 'restaurant',
      type: 'Restaurant & Bar',
      location: 'Ikoyi, Lagos',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHJlc3RhdXJhbnR8ZW58MHx8MHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.7,
      price: '₦3,000 - ₦15,000',
      description: 'Elegant garden restaurant with live music and outdoor seating',
      features: ['Live Music', 'Outdoor Seating', 'Private Events', 'Wine Bar'],
      openingHours: '11:00 AM - 11:00 PM',
      capacity: 200,
      eventsCompleted: 120,
      popularity: 92,
      contact: {
        phone: '+234 777 234 5678',
        email: 'info@gardenlounge.com',
        website: 'www.gardenlounge.com',
        social: {
          instagram: '@gardenlounge',
          facebook: 'GardenLounge',
          twitter: '@gardenlounge'
        }
      },
      amenities: ['Parking', 'WiFi', 'Private Rooms', 'Garden Area'],
      cuisine: ['International', 'Local', 'Fusion'],
      dressCode: 'Smart Casual',
      specialEvents: ['Sunday Brunch', 'Wine Tasting', 'Live Music Nights'],
      reviews: [
        {
          user: 'Mike Johnson',
          rating: 5,
          comment: 'Perfect for romantic dinners and special occasions.'
        },
        {
          user: 'Sarah Wilson',
          rating: 4,
          comment: 'Great atmosphere and service, but booking is essential.'
        }
      ]
    },
    {
      id: 3,
      name: 'The Rooftop Bar',
      category: 'bar',
      type: 'Rooftop Bar',
      location: 'Lekki, Lagos',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHJvb2Z0b3AlMjBiYXJ8ZW58MHx8MHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.6,
      price: '₦2,500 - ₦12,000',
      description: 'Stylish rooftop bar with panoramic city views and craft cocktails',
      features: ['City Views', 'Craft Cocktails', 'Live DJs', 'Sunset Views'],
      openingHours: '4:00 PM - 2:00 AM',
      capacity: 150,
      eventsCompleted: 100,
      popularity: 90,
      contact: {
        phone: '+234 777 345 6789',
        email: 'info@rooftopbar.com',
        website: 'www.rooftopbar.com',
        social: {
          instagram: '@rooftopbar',
          facebook: 'RooftopBar',
          twitter: '@rooftopbar'
        }
      },
      amenities: ['Parking', 'Elevator', 'Outdoor Seating', 'Bar Counter'],
      drinks: ['Craft Cocktails', 'Wine', 'Beer', 'Spirits'],
      dressCode: 'Smart Casual',
      specialEvents: ['Sunset Sessions', 'Cocktail Masterclass', 'Weekend Brunch'],
      reviews: [
        {
          user: 'David Brown',
          rating: 5,
          comment: 'Best views in Lagos! Perfect for sunset drinks.'
        },
        {
          user: 'Emma Davis',
          rating: 4,
          comment: 'Great cocktails and atmosphere, but can get crowded.'
        }
      ]
    },
    {
      id: 4,
      name: 'The Jazz Club',
      category: 'live_music',
      type: 'Live Music Venue',
      location: 'Ajah, Lagos',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGxpdmUlMjBtdXNpY3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.9,
      price: '₦4,000 - ₦18,000',
      description: 'Intimate jazz club featuring live performances and premium drinks',
      features: ['Live Jazz', 'Intimate Setting', 'Premium Drinks', 'Private Events'],
      openingHours: '7:00 PM - 1:00 AM',
      capacity: 100,
      eventsCompleted: 80,
      popularity: 88,
      contact: {
        phone: '+234 777 456 7890',
        email: 'info@jazzclub.com',
        website: 'www.jazzclub.com',
        social: {
          instagram: '@jazzclub',
          facebook: 'JazzClub',
          twitter: '@jazzclub'
        }
      },
      amenities: ['Parking', 'Stage', 'Sound System', 'Private Rooms'],
      music: ['Jazz', 'Blues', 'Soul', 'R&B'],
      dressCode: 'Smart Casual',
      specialEvents: ['Jazz Nights', 'Open Mic', 'Artist Showcases'],
      reviews: [
        {
          user: 'Robert Wilson',
          rating: 5,
          comment: 'Authentic jazz experience with talented musicians.'
        },
        {
          user: 'Lisa Anderson',
          rating: 4,
          comment: 'Great atmosphere and music, but seating is limited.'
        }
      ]
    },
    {
      id: 5,
      name: 'The Beach Club',
      category: 'beach',
      type: 'Beach Club',
      location: 'Epe, Lagos',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGJlYWNoJTIwY2x1YnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.7,
      price: '₦3,500 - ₦25,000',
      description: 'Exclusive beach club with water sports and beach parties',
      features: ['Beach Access', 'Water Sports', 'Beach Parties', 'Pool'],
      openingHours: '10:00 AM - 8:00 PM',
      capacity: 300,
      eventsCompleted: 200,
      popularity: 94,
      contact: {
        phone: '+234 777 567 8901',
        email: 'info@beachclub.com',
        website: 'www.beachclub.com',
        social: {
          instagram: '@beachclub',
          facebook: 'BeachClub',
          twitter: '@beachclub'
        }
      },
      amenities: ['Parking', 'Beach Access', 'Pool', 'Restaurant'],
      activities: ['Swimming', 'Beach Volleyball', 'Water Sports', 'Sunbathing'],
      dressCode: 'Beach Casual',
      specialEvents: ['Beach Parties', 'BBQ Nights', 'Water Sports Tournaments'],
      reviews: [
        {
          user: 'Tom Harris',
          rating: 5,
          comment: 'Perfect weekend getaway with great beach activities.'
        },
        {
          user: 'Sophie Turner',
          rating: 4,
          comment: 'Beautiful location but can get crowded on weekends.'
        }
      ]
    },
    {
      id: 6,
      name: 'Lagos Beach Resort',
      category: 'beach',
      type: 'Beach Resort',
      location: 'Epe, Lagos',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGJlYWNoJTIwcmVzb3J0fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.8,
      price: '₦5,000 - ₦30,000',
      description: 'Luxury beach resort with multiple pools and water activities',
      features: ['Beach Access', 'Multiple Pools', 'Water Sports', 'Spa', 'Restaurant'],
      openingHours: '8:00 AM - 10:00 PM',
      capacity: 500,
      eventsCompleted: 180,
      popularity: 96,
      contact: {
        phone: '+234 777 678 9012',
        email: 'info@lagosbeachresort.com',
        website: 'www.lagosbeachresort.com',
        social: {
          instagram: '@lagosbeachresort',
          facebook: 'LagosBeachResort',
          twitter: '@lagosbeachresort'
        }
      },
      amenities: ['Parking', 'Beach Access', 'Multiple Pools', 'Spa', 'Restaurant'],
      activities: ['Swimming', 'Beach Volleyball', 'Water Sports', 'Spa Treatments', 'Beach Yoga'],
      dressCode: 'Beach Casual',
      specialEvents: ['Beach Parties', 'BBQ Nights', 'Water Sports Tournaments', 'Beach Yoga Classes'],
      reviews: [
        {
          user: 'Alex Thompson',
          rating: 5,
          comment: 'Perfect family getaway with amazing facilities and activities.'
        },
        {
          user: 'Maria Garcia',
          rating: 4,
          comment: 'Beautiful location and great service, but can get crowded on weekends.'
        }
      ]
    },
    {
      id: 7,
      name: 'Sunset Beach Club',
      category: 'beach',
      type: 'Beach Club',
      location: 'Lekki, Lagos',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGJlYWNoJTIwY2x1YnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.6,
      price: '₦4,000 - ₦20,000',
      description: 'Exclusive beach club with stunning sunset views and beach parties',
      features: ['Beach Access', 'Sunset Views', 'Beach Parties', 'Pool', 'Restaurant'],
      openingHours: '11:00 AM - 2:00 AM',
      capacity: 250,
      eventsCompleted: 150,
      popularity: 92,
      contact: {
        phone: '+234 777 789 0123',
        email: 'info@sunsetbeachclub.com',
        website: 'www.sunsetbeachclub.com',
        social: {
          instagram: '@sunsetbeachclub',
          facebook: 'SunsetBeachClub',
          twitter: '@sunsetbeachclub'
        }
      },
      amenities: ['Parking', 'Beach Access', 'Pool', 'Restaurant', 'Bar'],
      activities: ['Swimming', 'Beach Parties', 'Sunset Watching', 'Beach Games'],
      dressCode: 'Beach Casual',
      specialEvents: ['Sunset Parties', 'Beach BBQs', 'Live Music Nights', 'Beach Games Tournaments'],
      reviews: [
        {
          user: 'Chris Wilson',
          rating: 5,
          comment: 'Best sunset views in Lagos! Perfect for weekend getaways.'
        },
        {
          user: 'Sarah Chen',
          rating: 4,
          comment: 'Great atmosphere and beach parties, but drinks are expensive.'
        }
      ]
    },
    {
      id: 8,
      name: 'Electric Dreams',
      category: 'high-energy',
      type: 'Nightclub',
      location: 'Victoria Island, Lagos',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bmlnaHRjbHVifGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.9,
      price: '₦6,000 - ₦25,000',
      description: 'High-energy nightclub with state-of-the-art sound system and international DJs',
      features: ['Live DJs', 'VIP Areas', 'Dance Floor', 'Cocktail Bar', 'LED Walls'],
      openingHours: '10:00 PM - 5:00 AM',
      capacity: 600,
      eventsCompleted: 200,
      popularity: 98,
      contact: {
        phone: '+234 777 890 1234',
        email: 'info@electricdreams.com',
        website: 'www.electricdreams.com',
        social: {
          instagram: '@electricdreams',
          facebook: 'ElectricDreams',
          twitter: '@electricdreams'
        }
      },
      amenities: ['Parking', 'Security', 'Coat Check', 'VIP Rooms', 'Sound System'],
      music: ['Electronic', 'House', 'Techno', 'Afrobeats'],
      dressCode: 'Smart Casual',
      specialEvents: ['International DJ Nights', 'Theme Parties', 'VIP Events'],
      reviews: [
        {
          user: 'David Wilson',
          rating: 5,
          comment: 'Best electronic music venue in Lagos! Amazing production and atmosphere.'
        },
        {
          user: 'Emma Thompson',
          rating: 4,
          comment: 'Incredible sound system and lighting, but can get very crowded.'
        }
      ]
    },
    {
      id: 9,
      name: 'The Cozy Corner',
      category: 'chill',
      type: 'Lounge & Cafe',
      location: 'Ikoyi, Lagos',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGxvdW5nZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.7,
      price: '₦2,500 - ₦12,000',
      description: 'Relaxed lounge with comfortable seating and specialty coffee',
      features: ['Specialty Coffee', 'Comfortable Seating', 'WiFi', 'Board Games', 'Outdoor Area'],
      openingHours: '8:00 AM - 11:00 PM',
      capacity: 150,
      eventsCompleted: 120,
      popularity: 90,
      contact: {
        phone: '+234 777 901 2345',
        email: 'info@cozycorner.com',
        website: 'www.cozycorner.com',
        social: {
          instagram: '@cozycorner',
          facebook: 'CozyCorner',
          twitter: '@cozycorner'
        }
      },
      amenities: ['Parking', 'WiFi', 'Outdoor Seating', 'Board Games', 'Coffee Bar'],
      drinks: ['Specialty Coffee', 'Tea', 'Smoothies', 'Light Snacks'],
      dressCode: 'Casual',
      specialEvents: ['Coffee Tasting', 'Board Game Nights', 'Poetry Readings'],
      reviews: [
        {
          user: 'Sophie Chen',
          rating: 5,
          comment: 'Perfect spot for working or relaxing. Great coffee and atmosphere.'
        },
        {
          user: 'James Brown',
          rating: 4,
          comment: 'Love the outdoor seating and board games collection.'
        }
      ]
    },
    {
      id: 10,
      name: 'The Blue Note',
      category: 'live-music',
      type: 'Live Music Venue',
      location: 'Lekki, Lagos',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGxpdmUlMjBtdXNpY3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.8,
      price: '₦4,500 - ₦20,000',
      description: 'Intimate live music venue featuring local and international artists',
      features: ['Live Music', 'Acoustic Sessions', 'Open Mic', 'Sound System', 'Bar'],
      openingHours: '6:00 PM - 2:00 AM',
      capacity: 200,
      eventsCompleted: 160,
      popularity: 95,
      contact: {
        phone: '+234 777 012 3456',
        email: 'info@bluenote.com',
        website: 'www.bluenote.com',
        social: {
          instagram: '@bluenote',
          facebook: 'BlueNote',
          twitter: '@bluenote'
        }
      },
      amenities: ['Parking', 'Stage', 'Sound System', 'Bar', 'VIP Area'],
      music: ['Jazz', 'Blues', 'Soul', 'R&B', 'Acoustic'],
      dressCode: 'Smart Casual',
      specialEvents: ['Jazz Nights', 'Open Mic Nights', 'Artist Showcases', 'Acoustic Sessions'],
      reviews: [
        {
          user: 'Michael Johnson',
          rating: 5,
          comment: 'Best live music venue in Lagos! Amazing acoustics and atmosphere.'
        },
        {
          user: 'Lisa Anderson',
          rating: 4,
          comment: 'Great variety of artists and genres. Love the intimate setting.'
        }
      ]
    },
    {
      id: 11,
      name: 'The Pulse',
      category: 'high-energy',
      type: 'Nightclub',
      location: 'Victoria Island, Lagos',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bmlnaHRjbHVifGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.7,
      price: '₦5,500 - ₦22,000',
      description: 'High-energy nightclub with multiple dance floors and themed nights',
      features: ['Multiple Dance Floors', 'VIP Areas', 'Live DJs', 'Theme Nights', 'Cocktail Bar'],
      openingHours: '10:00 PM - 4:00 AM',
      capacity: 800,
      eventsCompleted: 180,
      popularity: 96,
      contact: {
        phone: '+234 777 123 4567',
        email: 'info@thepulse.com',
        website: 'www.thepulse.com',
        social: {
          instagram: '@thepulse',
          facebook: 'ThePulse',
          twitter: '@thepulse'
        }
      },
      amenities: ['Parking', 'Security', 'Coat Check', 'VIP Rooms', 'Multiple Bars'],
      music: ['Hip Hop', 'R&B', 'Afrobeats', 'House', 'Pop'],
      dressCode: 'Smart Casual',
      specialEvents: ['Ladies Night', 'Theme Parties', 'International DJ Nights'],
      reviews: [
        {
          user: 'Alex Turner',
          rating: 5,
          comment: 'Amazing energy and multiple dance floors! Never a dull moment.'
        },
        {
          user: 'Rachel Green',
          rating: 4,
          comment: 'Great variety of music and themed nights. VIP service is top-notch.'
        }
      ]
    },
    {
      id: 12,
      name: 'The Zen Garden',
      category: 'chill',
      type: 'Lounge & Restaurant',
      location: 'Ikoyi, Lagos',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGxvdW5nZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      rating: 4.8,
      price: '₦3,000 - ₦15,000',
      description: 'Serene lounge with garden views and fusion cuisine',
      features: ['Garden Views', 'Fusion Cuisine', 'Tea Selection', 'Outdoor Seating', 'WiFi'],
      openingHours: '9:00 AM - 10:00 PM',
      capacity: 180,
      eventsCompleted: 140,
      popularity: 92,
      contact: {
        phone: '+234 777 234 5678',
        email: 'info@zengarden.com',
        website: 'www.zengarden.com',
        social: {
          instagram: '@zengarden',
          facebook: 'ZenGarden',
          twitter: '@zengarden'
        }
      },
      amenities: ['Parking', 'WiFi', 'Garden Area', 'Private Rooms', 'Tea Bar'],
      cuisine: ['Fusion', 'Asian', 'Mediterranean', 'Healthy Options'],
      dressCode: 'Smart Casual',
      specialEvents: ['Tea Tasting', 'Yoga Sessions', 'Garden Parties', 'Cooking Classes'],
      reviews: [
        {
          user: 'Emma Wilson',
          rating: 5,
          comment: 'Perfect oasis in the city. Love the garden views and peaceful atmosphere.'
        },
        {
          user: 'David Chen',
          rating: 4,
          comment: 'Great fusion cuisine and tea selection. Perfect for business meetings.'
        }
      ]
    }
  ];

  // Sample social media feeds data
  const liveFeeds = [
    {
      id: 1,
      platform: 'instagram',
      username: '@grandlounge',
      content: '🔥 Tonight: Ladies Night with DJ Max! Free entry for ladies before 11 PM',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bmlnaHRjbHVifGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      likes: 234,
      comments: 45,
      timestamp: '2h ago'
    },
    {
      id: 2,
      platform: 'twitter',
      username: '@rooftopbar',
      content: '🌅 Sunset Sessions starting now! Join us for the best views and cocktails in Lagos',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHJvb2Z0b3AlMjBiYXJ8ZW58MHx8MHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
      likes: 156,
      comments: 23,
      timestamp: '1h ago'
    },
    {
      id: 3,
      platform: 'facebook',
      username: 'JazzClub',
      content: '🎵 Live Jazz Night featuring The Blue Note Quartet. Doors open at 7 PM',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGxpdmUlMjBtdXNpY3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
      likes: 189,
      comments: 34,
      timestamp: '3h ago'
    }
  ];

  // Add mood categories
  const moodCategories = [
    {
      id: 'high-energy',
      name: 'High Energy',
      icon: <Zap className="w-6 h-6" />,
      description: 'Vibrant nightclubs and party spots',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'chill',
      name: 'Chill Vibes',
      icon: <Coffee className="w-6 h-6" />,
      description: 'Relaxed lounges and cafes',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'live-music',
      name: 'Live Music',
      icon: <Music2 className="w-6 h-6" />,
      description: 'Live performances and bands',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'beach',
      name: 'Beach Life',
      icon: <Sun className="w-6 h-6" />,
      description: 'Beach clubs and waterfront spots',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  // Filter hotspots based on search query and filters
  const filteredHotspots = hotspots.filter(hotspot => {
    const matchesSearch = hotspot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         hotspot.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || hotspot.category === selectedCategory;
    const matchesRating = hotspot.rating >= ratingFilter;
    const matchesLocation = selectedLocation === 'all' || hotspot.location.includes(selectedLocation);
    const matchesPrice = true; // Temporarily disable price filtering
    const matchesFeatures = selectedFeatures.length === 0 || 
                           selectedFeatures.every(feature => hotspot.features.includes(feature));
    
    return matchesSearch && matchesCategory && matchesRating && matchesLocation && matchesPrice && matchesFeatures;
  });

  // Sort hotspots
  const sortedHotspots = [...filteredHotspots].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        return parseFloat(a.price.replace(/[^0-9.-]+/g, '')) - parseFloat(b.price.replace(/[^0-9.-]+/g, ''));
      case 'popularity':
      default:
        return b.popularity - a.popularity;
    }
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section with Live Feeds */}
      <div className="relative min-h-[80vh] overflow-hidden">
        {/* Background with animated gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FF0000]/10 via-[#0A0A0A] to-[#0A0A0A]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:20px_20px] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Hero Content */}
            <div className="flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-[#FF0000] to-white">
                  Experience Lagos Nightlife
                </h1>
                <p className="text-xl text-gray-300 mb-8 max-w-xl">
                  Discover the city's most vibrant venues, live events, and social hotspots. Get real-time updates on what's happening right now.
                </p>
                <div className="relative max-w-xl mb-12">
                  <input
                    type="text"
                    placeholder="Search for venues, events, or locations..."
                    className="w-full px-6 py-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] pl-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                </div>
                <div className="flex flex-wrap gap-4">
                  {['Nightclubs', 'Live Music', 'Bars', 'Beach Clubs'].map((category, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCategory(category.toLowerCase())}
                      className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedCategory === category.toLowerCase()
                          ? 'bg-[#FF0000] text-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Live Feeds */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10" />
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Live from Venues</h2>
                  <div className="flex items-center gap-2 text-[#FF0000]">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">Live Updates</span>
                  </div>
                </div>
                <div className="space-y-6">
                  {liveFeeds.map((feed, index) => (
                    <motion.div
                      key={feed.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:border-[#FF0000]/50 transition-all duration-300"
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {feed.platform === 'instagram' && <Instagram className="w-5 h-5 text-pink-500" />}
                          {feed.platform === 'twitter' && <Twitter className="w-5 h-5 text-blue-400" />}
                          {feed.platform === 'facebook' && <Facebook className="w-5 h-5 text-blue-600" />}
                          <span className="text-white/80 font-medium">{feed.username}</span>
                          <span className="text-white/40 text-sm">{feed.timestamp}</span>
                        </div>
                        <p className="text-white/90 mb-3">{feed.content}</p>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span>❤️ {feed.likes}</span>
                          <span>💬 {feed.comments}</span>
                        </div>
                      </div>
                      <div className="aspect-video relative">
                        <img
                          src={feed.image}
                          alt={feed.content}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Featured Venues Section with Horizontal Scroll */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Featured Venues</h2>
            <div className="flex items-center gap-2 text-[#FF0000]">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Updated Weekly</span>
            </div>
          </div>
          
          <div className="relative">
            <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
              {hotspots.slice(0, 5).map((hotspot, index) => (
                <motion.div
                  key={hotspot.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative min-w-[300px] max-w-[300px] flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-[#FF0000]/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative bg-white/5 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={hotspot.image}
                        alt={hotspot.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-white">{hotspot.name}</h3>
                          <div className="flex items-center bg-white/10 px-3 py-1 rounded-full text-sm">
                            <Star className="h-4 w-4 text-[#FF0000] mr-1" fill="currentColor" />
                            {hotspot.rating}
                          </div>
                        </div>
                        <div className="flex items-center text-white/80 mt-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{hotspot.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-sm text-white/60">
                          <Clock className="h-4 w-4 mr-1" />
                          {hotspot.openingHours}
                        </div>
                        <div className="text-[#FF0000] font-medium">{hotspot.price}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {hotspot.features.slice(0, 3).map((feature, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-white/5 text-white/80 text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0A0A0A] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Mood Categories with Enhanced Highlighting */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8">Find Your Vibe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {moodCategories.map((mood) => (
              <motion.div
                key={mood.id}
                whileHover={{ scale: 1.02 }}
                className={`relative group cursor-pointer ${
                  selectedCategory === mood.id ? 'ring-2 ring-[#FF0000] ring-opacity-50' : ''
                }`}
                onClick={() => setSelectedCategory(mood.id)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  selectedCategory === mood.id ? 'opacity-40' : 'opacity-20 group-hover:opacity-30'
                } transition-opacity duration-300 rounded-xl`} />
                <div className={`relative bg-white/5 backdrop-blur-xl rounded-xl border ${
                  selectedCategory === mood.id ? 'border-[#FF0000]' : 'border-white/10'
                } p-6 transition-all duration-300`}>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${mood.color} flex items-center justify-center mb-4 ${
                    selectedCategory === mood.id ? 'scale-110' : ''
                  } transition-transform duration-300`}>
                    {mood.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${
                    selectedCategory === mood.id ? 'text-[#FF0000]' : 'text-white'
                  } transition-colors duration-300`}>
                    {mood.name}
                  </h3>
                  <p className="text-white/60 text-sm">{mood.description}</p>
                  {selectedCategory === mood.id && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2 className="w-5 h-5 text-[#FF0000]" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Category Header with Count */}
        {selectedCategory !== 'all' && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {moodCategories.find(mood => mood.id === selectedCategory)?.name || 'Selected Category'}
                </h2>
                <p className="text-white/60 mt-1">
                  {filteredHotspots.length} venues found
                </p>
              </div>
              <div className="flex items-center gap-2 text-[#FF0000]">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm">Featured in this category</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Sort */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">All Venues</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-300 hover:text-white transition-all duration-300"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white/5 rounded-lg text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
            >
              <option value="popularity">Popularity</option>
              <option value="rating">Rating</option>
              <option value="price">Price</option>
            </select>
          </div>
        </div>

        {/* Enhanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-12 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Category</label>
                  <select
                    className="w-full px-4 py-2 bg-white/5 rounded-lg text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="nightclub">Nightclubs</option>
                    <option value="restaurant">Restaurants</option>
                    <option value="bar">Bars</option>
                    <option value="live_music">Live Music</option>
                    <option value="beach">Beach Clubs</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Location</label>
                  <select
                    className="w-full px-4 py-2 bg-white/5 rounded-lg text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="all">All Locations</option>
                    <option value="Victoria Island">Victoria Island</option>
                    <option value="Ikoyi">Ikoyi</option>
                    <option value="Lekki">Lekki</option>
                    <option value="Ajah">Ajah</option>
                    <option value="Epe">Epe</option>
                  </select>
                </div>

                {/* Features Filter */}
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Features</label>
                  <div className="flex flex-wrap gap-2">
                    {['Live Music', 'VIP Areas', 'Outdoor Seating', 'Private Events', 'Parking', 'Pool'].map((feature) => (
                      <button
                        key={feature}
                        onClick={() => {
                          setSelectedFeatures(prev =>
                            prev.includes(feature)
                              ? prev.filter(f => f !== feature)
                              : [...prev, feature]
                          );
                        }}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedFeatures.includes(feature)
                            ? 'bg-[#FF0000] text-white'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hotspots Grid */}
        <div className="grid grid-cols-1 gap-8">
          {sortedHotspots.map((hotspot) => (
            <motion.div
              key={hotspot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-[#FF0000]/50 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="md:w-1/3 relative">
                  <img
                    src={hotspot.image}
                    alt={hotspot.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" />
                      {hotspot.rating}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="md:w-2/3 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{hotspot.name}</h3>
                      <div className="flex items-center text-white/60">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{hotspot.location}</span>
                      </div>
                    </div>
                    <div className="text-[#FF0000] font-medium">{hotspot.price}</div>
                  </div>

                  <p className="text-white/80 mb-4">{hotspot.description}</p>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-sm text-white/60 mb-1">Type</div>
                      <div className="text-white">{hotspot.type}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-sm text-white/60 mb-1">Opening Hours</div>
                      <div className="text-white">{hotspot.openingHours}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-sm text-white/60 mb-1">Capacity</div>
                      <div className="text-white">{hotspot.capacity} people</div>
                    </div>
                  </div>

                  {/* Features Tags */}
                  <div className="mb-6">
                    <div className="text-sm text-white/60 mb-2">Features</div>
                    <div className="flex flex-wrap gap-2">
                      {hotspot.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#FF0000]/10 text-[#FF0000] rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact & Social */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <a href={`tel:${hotspot.contact.phone}`} className="text-white/60 hover:text-white">
                        <Phone className="h-5 w-5" />
                      </a>
                      <a href={hotspot.contact.website} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
                        <Globe className="h-5 w-5" />
                      </a>
                      <a href={`mailto:${hotspot.contact.email}`} className="text-white/60 hover:text-white">
                        <Mail className="h-5 w-5" />
                      </a>
                    </div>
                    <div className="flex items-center gap-4">
                      <a href={`https://instagram.com/${hotspot.contact.social.instagram}`} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
                        <Instagram className="h-5 w-5" />
                      </a>
                      <a href={`https://facebook.com/${hotspot.contact.social.facebook}`} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
                        <Facebook className="h-5 w-5" />
                      </a>
                      <a href={`https://twitter.com/${hotspot.contact.social.twitter}`} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
                        <Twitter className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hotspots;