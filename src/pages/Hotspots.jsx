import React, { useState, useEffect, useRef } from 'react';
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
  Sun,
  Eye,
  Heart,
  ChevronRight,
  ChevronLeft,
  Crown,
  Trophy,
  Medal
} from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

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
  const [currentTopSpot, setCurrentTopSpot] = useState(0);
  const [showSpotlightDetails, setShowSpotlightDetails] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  
  // ConviviaPass Membership States
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [membershipTier, setMembershipTier] = useState('none'); // 'none', 'standard', 'premium', 'vip'
  const [pointsBalance, setPointsBalance] = useState(120);
  const [unlockedPerks, setUnlockedPerks] = useState([]);
  const [recentActivity, setRecentActivity] = useState([
    { type: 'visit', venue: 'The Grand Lounge', points: 50, date: '2 days ago' },
    { type: 'discount', venue: 'The Beach Club', points: 20, date: '1 week ago' },
    { type: 'checkin', venue: 'The Jazz Club', points: 10, date: '2 weeks ago' },
  ]);
  
  const membershipTiers = [
    { 
      id: 'standard', 
      name: 'Standard', 
      pointsRequired: 0,
      color: 'from-blue-500 to-purple-500',
      perks: [
        'No cover charge at 5+ partner venues',
        'Happy hour extended by 1 hour',
        'Priority entry on non-peak nights'
      ]
    },
    { 
      id: 'premium', 
      name: 'Premium', 
      pointsRequired: 500,
      color: 'from-red-500 to-orange-500',
      perks: [
        'No cover charge at all partner venues',
        'Complimentary welcome drink',
        'Priority entry on peak nights',
        '10% discount on food & drinks'
      ]
    },
    { 
      id: 'vip', 
      name: 'VIP', 
      pointsRequired: 2000,
      color: 'from-yellow-400 to-yellow-600',
      perks: [
        'All Premium benefits',
        'Exclusive access to VIP areas',
        'Dedicated host service',
        'Special event invitations',
        'Free valet parking'
      ]
    }
  ];
  
  // Check which tier the user qualifies for
  useEffect(() => {
    if (pointsBalance >= membershipTiers[2].pointsRequired) {
      setMembershipTier('vip');
      setUnlockedPerks([...membershipTiers[0].perks, ...membershipTiers[1].perks, ...membershipTiers[2].perks]);
    } else if (pointsBalance >= membershipTiers[1].pointsRequired) {
      setMembershipTier('premium');
      setUnlockedPerks([...membershipTiers[0].perks, ...membershipTiers[1].perks]);
    } else {
      setMembershipTier('standard');
      setUnlockedPerks([...membershipTiers[0].perks]);
    }
  }, [pointsBalance]);
  
  // Refs for scroll interactions
  const spotlightRef = useRef(null);
  const scrollControlsRef = useRef(null);
  
  // Top 3 hotspots scroll interval
  useEffect(() => {
    let interval;
    if (isAutoScrolling) {
      interval = setInterval(() => {
        setCurrentTopSpot(prev => (prev + 1) % 3);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoScrolling]);
  
  // Animations for spotlight sections
  const spotlightControls = useAnimation();
  
  useEffect(() => {
    spotlightControls.start({
      x: -currentTopSpot * 100 + '%',
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    });
  }, [currentTopSpot, spotlightControls]);
  
  // Pause auto-scroll when user interacts with spotlight
  const handleManualNavigation = (index) => {
    setIsAutoScrolling(false);
    setCurrentTopSpot(index);
    
    // Resume auto-scrolling after 15 seconds of inactivity
    const autoScrollTimer = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 15000);
    
    return () => clearTimeout(autoScrollTimer);
  };

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
  
  // Top 3 hotspots for spotlight section
  const topHotspots = [...hotspots]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 3)
    .map((spot, index) => ({
      ...spot,
      rank: index + 1,
      // Custom promotional messages for each top spot
      promoMessage: index === 0 
        ? "Lagos' #1 Nightlife Destination" 
        : index === 1 
        ? "Most Popular New Venue"
        : "Best Value Experience"
    }));

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
        <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            >
              Discover <span className="text-[#FF0000]">Lagos' Hottest</span> Venues & Events
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-white/80 mb-8"
            >
              Find the perfect spot for your next night out, from exclusive nightclubs to chill lounges
            </motion.p>
            
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative max-w-2xl mx-auto"
            >
              <div className="flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-full overflow-hidden focus-within:border-[#FF0000]/50 transition-all duration-300">
                <Search className="ml-5 h-5 w-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search venues, areas, or vibes..."
                  className="flex-1 bg-transparent border-none h-14 px-4 text-white focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="bg-[#FF0000] hover:bg-[#FF0000]/90 transition-colors h-14 px-6 text-white font-medium">
                  Explore
                </button>
              </div>
            </motion.div>
          </div>
          
          {/* NEW: Top 3 Hotspots Spotlight */}
          <div className="mb-24 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ rotate: -5, scale: 0.9 }}
                  animate={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                >
                  <Award className="w-7 h-7 text-[#FF0000]" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white">Top Monthly Picks</h2>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Updated Monthly</span>
                
                {/* Spotlight navigation controls */}
                <div ref={scrollControlsRef} className="flex items-center ml-4 space-x-2">
                  {[0, 1, 2].map(index => (
                    <button
                      key={`nav-${index}`}
                      onClick={() => handleManualNavigation(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        currentTopSpot === index 
                          ? 'bg-[#FF0000] scale-125' 
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`View hotspot ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Spotlight Carousel */}
            <div className="relative overflow-hidden" ref={spotlightRef}>
              <motion.div 
                className="flex flex-nowrap"
                animate={spotlightControls}
              >
                {topHotspots.map((hotspot, index) => (
                  <div key={`spotlight-${hotspot.id}`} className="min-w-full pr-4 pl-0">
                    <motion.div 
                      className="relative rounded-2xl overflow-hidden group/spotlight"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      whileHover={{ y: -5 }}
                    >
                      {/* Background Image with Parallax Effect */}
                      <div className="relative aspect-[21/9] overflow-hidden">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 1 }}
                          className="absolute inset-0"
                        >
                          <img
                            src={hotspot.image}
                            alt={hotspot.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                        </motion.div>
                      </div>
                      
                      {/* Rank medal */}
                      <motion.div 
                        className="absolute top-6 left-6 z-10"
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      >
                        <div className={`flex items-center justify-center w-16 h-16 rounded-full 
                          ${index === 0 
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-300' 
                            : index === 1 
                            ? 'bg-gradient-to-br from-gray-300 to-gray-500 border-2 border-gray-200' 
                            : 'bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-amber-500'
                          }`}
                        >
                          {index === 0 ? (
                            <Crown className="h-8 w-8 text-white" />
                          ) : index === 1 ? (
                            <Trophy className="h-7 w-7 text-white" />
                          ) : (
                            <Medal className="h-7 w-7 text-white" />
                          )}
                        </div>
                      </motion.div>
                      
                      {/* ConviviaPass Tag if venue participates */}
                      {index < 2 && (
                        <motion.div 
                          className="absolute top-6 left-24 bg-gradient-to-r from-[#FF0000] to-purple-600 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                        >
                          <Sparkles className="h-3 w-3" />
                          ConviviaPass
                        </motion.div>
                      )}
                      
                      {/* Content overlaid on image */}
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <div className="max-w-3xl">
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mb-3"
                          >
                            <span className="inline-block px-4 py-1.5 bg-[#FF0000]/80 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                              {hotspot.promoMessage}
                            </span>
                          </motion.div>
                        
                          <motion.h3 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-4xl font-bold text-white mb-3"
                          >
                            {hotspot.name}
                          </motion.h3>
                          
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex items-center gap-4 mb-4 text-white/90"
                          >
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-[#FF0000]" />
                              <span>{hotspot.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-[#FF0000]" fill="#FF0000" />
                              <span>{hotspot.rating}/5</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-[#FF0000]" />
                              <span>{hotspot.openingHours}</span>
                            </div>
                          </motion.div>
                          
                          <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="text-white/80 max-w-2xl mb-6"
                          >
                            {hotspot.description}
                          </motion.p>
                          
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="flex flex-wrap gap-3 mb-6"
                          >
                            {hotspot.features.slice(0, 4).map((feature, i) => (
                              <span 
                                key={`feature-${i}`}
                                className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-sm"
                              >
                                {feature}
                              </span>
                            ))}
                          </motion.div>
                          
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                            className="flex items-center gap-4"
                          >
                            <button className="px-6 py-3 bg-[#FF0000] hover:bg-[#FF0000]/90 text-white rounded-full transition-all duration-300 flex items-center">
                              View Details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                            
                            <div className="flex items-center gap-3">
                              <button className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300">
                                <Heart className="h-5 w-5 text-white" />
                              </button>
                              <button className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300">
                                <Eye className="h-5 w-5 text-white" />
                              </button>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Animated Stats Bar */}
                      <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-3">
                        <motion.div 
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="flex items-center"
                        >
                          <Users className="h-4 w-4 text-[#FF0000] mr-1.5" />
                          <span className="text-white text-sm">{hotspot.capacity}+</span>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                          className="flex items-center"
                        >
                          <Calendar className="h-4 w-4 text-[#FF0000] mr-1.5" />
                          <span className="text-white text-sm">{hotspot.eventsCompleted}+ events</span>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                          className="flex items-center"
                        >
                          <TrendingUp className="h-4 w-4 text-[#FF0000] mr-1.5" />
                          <span className="text-white text-sm">{hotspot.popularity}% popular</span>
                        </motion.div>
                      </div>
                      
                      {/* Animated "Ad" label */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 1,
                          repeat: Infinity,
                          repeatType: "reverse",
                          repeatDelay: 2
                        }}
                        className="absolute top-6 right-64 bg-[#FF0000] text-white text-xs font-medium px-2.5 py-1 rounded-sm"
                      >
                        FEATURED
                      </motion.div>
                    </motion.div>
                  </div>
                ))}
              </motion.div>
              
              {/* Left/Right Navigation Arrows */}
              <button 
                onClick={() => handleManualNavigation((currentTopSpot - 1 + 3) % 3)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm border border-white/10 transition-all duration-300"
                aria-label="Previous spotlight"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                onClick={() => handleManualNavigation((currentTopSpot + 1) % 3)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm border border-white/10 transition-all duration-300"
                aria-label="Next spotlight"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              
              {/* Auto-scroll indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                <motion.div 
                  animate={{ 
                    opacity: isAutoScrolling ? [1, 0.5, 1] : 0.5,
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: isAutoScrolling ? Infinity : 0,
                    repeatType: "loop" 
                  }}
                  className="w-1.5 h-1.5 bg-[#FF0000] rounded-full"
                />
                <span className="text-xs text-white/70">
                  {isAutoScrolling ? "Auto-scrolling" : "Paused"}
                </span>
              </div>
            </div>
          </div>
          
          {/* ConviviaPass Banner */}
          <div className="mb-24">
            <motion.div 
              className="bg-gradient-to-r from-[#0A0A0A] via-black/80 to-[#0A0A0A] backdrop-blur-xl rounded-2xl border border-[#FF0000]/20 overflow-hidden relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -5 }}
            >
              {/* Animated background particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={`particle-premium-${i}`}
                    className="absolute w-1 h-1 rounded-full bg-[#FF0000]/30"
                    initial={{ 
                      x: Math.random() * 100 + '%', 
                      y: Math.random() * 100 + '%', 
                      opacity: 0.3 + Math.random() * 0.5
                    }}
                    animate={{ 
                      x: Math.random() * 100 + '%', 
                      y: Math.random() * 100 + '%',
                      opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{ 
                      duration: 5 + Math.random() * 10, 
                      repeat: Infinity,
                      repeatType: "mirror"
                    }}
                  />
                ))}
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -left-24 -top-24 w-96 h-96 bg-[#FF0000]/10 rounded-full blur-3xl opacity-30" />
              <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-20" />
              
              <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="md:w-2/3">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      initial={{ rotate: -5, scale: 0.9 }}
                      animate={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                    >
                      <Sparkles className="w-8 h-8 text-[#FF0000]" />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">ConviviaPass</h2>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full bg-green-400`} />
                        <span className="text-green-400 text-sm font-medium">
                          {membershipTier === 'vip' ? 'VIP' : membershipTier === 'premium' ? 'Premium' : 'Standard'} Membership Active
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-white/80 mb-6 text-lg">
                    Unlock exclusive perks at Lagos' hottest venues with ConviviaPass.
                    Skip queues, access VIP areas, and enjoy special discounts.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-lg p-4">
                      <div className="text-[#FF0000] font-medium mb-1">Your Points</div>
                      <div className="text-2xl font-bold text-white">{pointsBalance} pts</div>
                      <div className="text-white/50 text-sm mt-1">
                        {membershipTier !== 'vip' 
                          ? `${membershipTiers.find(t => t.id === 'vip').pointsRequired - pointsBalance} more to VIP` 
                          : 'Maximum tier reached!'}
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-lg p-4">
                      <div className="text-[#FF0000] font-medium mb-1">Partner Venues</div>
                      <div className="text-2xl font-bold text-white">42</div>
                      <div className="text-white/50 text-sm mt-1">
                        15+ new venues this month
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-lg p-4">
                      <div className="text-[#FF0000] font-medium mb-1">Your Perks</div>
                      <div className="text-2xl font-bold text-white">{unlockedPerks.length}</div>
                      <div className="text-white/50 text-sm mt-1">
                        Tap to view all benefits
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowMembershipModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-[#FF0000] to-purple-600 hover:from-[#FF0000]/90 hover:to-purple-600/90 text-white rounded-full font-medium flex items-center gap-2 transition-all duration-300"
                    >
                      View Your Membership
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    
                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors duration-300">
                      Partner Venues
                    </button>
                  </div>
                </div>
                
                <div className="md:w-1/3 relative">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#FF0000]/20 via-purple-600/20 to-[#FF0000]/20 rounded-2xl blur-xl opacity-30"
                    animate={{
                      background: [
                        'radial-gradient(circle, rgba(255,0,0,0.2) 0%, rgba(128,0,128,0.2) 100%)',
                        'radial-gradient(circle, rgba(128,0,128,0.2) 0%, rgba(255,0,0,0.2) 100%)',
                        'radial-gradient(circle, rgba(255,0,0,0.2) 0%, rgba(128,0,128,0.2) 100%)'
                      ]
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />
                  <div className="relative bg-[#FF0000]/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <div className="absolute -top-3 -right-3">
                      <motion.div 
                        className="bg-gradient-to-r from-[#FF0000] to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {membershipTier === 'vip' ? 'VIP' : membershipTier === 'premium' ? 'PREMIUM' : 'STANDARD'}
                      </motion.div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {recentActivity.map((activity, idx) => (
                        <motion.div 
                          key={idx} 
                          className="flex items-center justify-between bg-black/30 rounded-lg p-3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              {activity.type === 'visit' && <Users className="h-3.5 w-3.5 text-[#FF0000]" />}
                              {activity.type === 'discount' && <Star className="h-3.5 w-3.5 text-[#FF0000]" />}
                              {activity.type === 'checkin' && <MapPin className="h-3.5 w-3.5 text-[#FF0000]" />}
                              <span className="text-white text-sm font-medium">{activity.venue}</span>
                            </div>
                            <div className="text-white/50 text-xs">{activity.date}</div>
                          </div>
                          <div className="text-[#FF0000] font-medium">+{activity.points}</div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="mt-4 text-center">
                      <button className="text-white/60 text-sm hover:text-white transition-colors duration-300">
                        View All Activity
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Continue with the rest of your content... */}
          {/* ... */}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Featured Venues Section with Horizontal Scroll */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: 0, scale: 1 }}
                animate={{ rotate: 10, scale: 1.1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                <Sparkles className="w-6 h-6 text-[#FF0000]" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white">Featured Venues</h2>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full text-white/70">
              <Calendar className="w-4 h-4 text-[#FF0000]" />
              <span className="text-sm">Updated Weekly</span>
            </div>
          </div>
          
          <div className="relative">
            <motion.div 
              className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide" 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {hotspots.slice(0, 5).map((hotspot, index) => (
                <motion.div
                  key={hotspot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ 
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
                  className="group relative min-w-[320px] max-w-[320px] flex-shrink-0"
                >
                  {/* Glow effect */}
                  <motion.div 
                    className="absolute -inset-1 bg-gradient-to-r from-[#FF0000]/20 to-[#FF0000]/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                  
                  <div className="relative bg-black/40 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 group-hover:border-[#FF0000]/30 transition-all duration-300">
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <motion.img
                        src={hotspot.image}
                        alt={hotspot.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 1 }}
                      />
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                      
                      {/* Rating badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        <Star className="h-3.5 w-3.5 text-[#FF0000]" fill="#FF0000" />
                        <span className="text-white text-sm font-medium">{hotspot.rating}</span>
                      </div>
                      
                      {/* Category badge */}
                      <div className="absolute top-4 left-4 bg-[#FF0000]/80 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-white text-xs font-medium">{hotspot.type}</span>
                      </div>
                      
                      {/* ConviviaPass Partner Badge - show on alternating venues */}
                      {index % 2 === 0 && (
                        <div className="absolute top-14 left-4 bg-gradient-to-r from-[#FF0000] to-purple-600 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 text-white" />
                          <span className="text-white text-xs font-medium">Partner Venue</span>
                        </div>
                      )}
                      
                      {/* Venue info */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#FF0000] transition-colors duration-300">{hotspot.name}</h3>
                        
                        <div className="flex items-center text-white/80 mb-3">
                          <MapPin className="h-4 w-4 text-[#FF0000] mr-1.5" />
                          <span className="text-sm">{hotspot.location}</span>
                        </div>
                        
                        <p className="text-white/70 text-sm line-clamp-2 mb-4">{hotspot.description}</p>
                        
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {hotspot.features.slice(0, 3).map((feature, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-white/10 backdrop-blur-sm text-white/90 text-xs rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-white/60">
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-[#FF0000]" />
                            {hotspot.openingHours}
                          </div>
                          <div className="text-[#FF0000] text-sm font-medium">{hotspot.price.split(' - ')[0]}+</div>
                        </div>
                        
                        {/* Member Perks - Only show for partner venues */}
                        {index % 2 === 0 && (
                          <div className="absolute -bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent pt-10 pb-3 px-5 transform translate-y-[calc(100%-40px)] group-hover:translate-y-0 transition-transform duration-300">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="h-4 w-4 text-[#FF0000]" />
                              <div className="text-white text-sm font-medium">Member Benefits</div>
                            </div>
                            <div className="space-y-1">
                              {membershipTier === 'standard' && (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF0000]" />
                                  <span className="text-white/80 text-xs">No cover charge on weekdays</span>
                                </div>
                              )}
                              
                              {membershipTier === 'premium' && (
                                <>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF0000]" />
                                    <span className="text-white/80 text-xs">No cover charge always</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF0000]" />
                                    <span className="text-white/80 text-xs">Complimentary welcome drink</span>
                                  </div>
                                </>
                              )}
                              
                              {membershipTier === 'vip' && (
                                <>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF0000]" />
                                    <span className="text-white/80 text-xs">VIP area access</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF0000]" />
                                    <span className="text-white/80 text-xs">Dedicated host service</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Hover overlay with actions */}
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-5 py-2.5 bg-[#FF0000] hover:bg-[#FF0000]/90 text-white rounded-full text-sm font-medium flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Trending indicator */}
                  {hotspot.popularity > 94 && (
                    <motion.div 
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-[#FF0000] to-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: 1
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: index * 0.2
                      }}
                    >
                      <TrendingUp className="w-3 h-3" />
                      TRENDING
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
            
            {/* Scroll indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#0A0A0A] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#0A0A0A] to-transparent pointer-events-none" />
            
            {/* Scroll buttons */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mood Categories with Enhanced Highlighting */}
        <div className="mb-24 relative overflow-hidden">
          <div className="absolute -left-20 -top-20 w-60 h-60 bg-[#FF0000]/20 rounded-full blur-3xl opacity-30" />
          <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-[#FF0000]/10 rounded-full blur-3xl opacity-20" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <div className="absolute inset-0 bg-[#FF0000]/20 rounded-full blur-md" />
                <Zap className="w-6 h-6 text-[#FF0000]" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white">Find Your Vibe</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {moodCategories.map((mood, index) => (
                <motion.div
                  key={mood.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className={`relative group cursor-pointer overflow-hidden ${
                    selectedCategory === mood.id ? 'ring-2 ring-[#FF0000] ring-opacity-50' : ''
                  }`}
                  onClick={() => setSelectedCategory(mood.id)}
                >
                  {/* Background gradient effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-0 ${
                    selectedCategory === mood.id ? 'opacity-15' : 'group-hover:opacity-10'
                  } transition-opacity duration-300 rounded-xl`} />
                  
                  {/* Animated particle background */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={`particle-${i}`}
                          className={`absolute w-1 h-1 rounded-full bg-white/30`}
                          initial={{ 
                            x: Math.random() * 100 + '%', 
                            y: Math.random() * 100 + '%',
                            opacity: 0.1 + Math.random() * 0.3
                          }}
                          animate={{ 
                            x: Math.random() * 100 + '%', 
                            y: Math.random() * 100 + '%',
                            opacity: [0.1, 0.3, 0.1]
                          }}
                          transition={{ 
                            duration: 3 + Math.random() * 5, 
                            repeat: Infinity,
                            delay: i * 0.5
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className={`relative bg-black/40 backdrop-blur-xl rounded-xl border ${
                    selectedCategory === mood.id ? 'border-[#FF0000]' : 'border-white/10 group-hover:border-white/20'
                  } p-6 transition-all duration-300 h-full`}>
                    <motion.div 
                      className={`w-14 h-14 rounded-full bg-gradient-to-br ${mood.color} flex items-center justify-center mb-4`}
                      whileHover={{ scale: 1.1 }}
                      animate={{ 
                        scale: selectedCategory === mood.id ? [1, 1.05, 1] : 1,
                        rotate: selectedCategory === mood.id ? [0, 5, 0, -5, 0] : 0
                      }}
                      transition={{ 
                        duration: selectedCategory === mood.id ? 2 : 0.3, 
                        repeat: selectedCategory === mood.id ? Infinity : 0,
                        repeatType: "reverse" 
                      }}
                    >
                      {mood.icon}
                    </motion.div>
                    
                    <h3 className={`text-xl font-bold mb-3 ${
                      selectedCategory === mood.id ? 'text-[#FF0000]' : 'text-white group-hover:text-white/90'
                    } transition-colors duration-300`}>
                      {mood.name}
                    </h3>
                    
                    <p className="text-white/60 text-sm mb-4">{mood.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">
                        {filteredHotspots.filter(h => h.category === mood.id).length} venues
                      </span>
                      
                      <motion.div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          selectedCategory === mood.id 
                            ? 'bg-[#FF0000]' 
                            : 'bg-white/10 group-hover:bg-white/20'
                        } transition-colors duration-300`}
                        animate={{ 
                          rotate: selectedCategory === mood.id ? 0 : 180,
                          scale: selectedCategory === mood.id ? 1 : 0.8
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {selectedCategory === mood.id ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-white/70" />
                        )}
                      </motion.div>
                    </div>
                    
                    {/* Selected indicator */}
                    {selectedCategory === mood.id && (
                      <motion.div 
                        className="absolute -top-1 -right-1 w-8 h-8"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="absolute inset-0 bg-[#FF0000] rounded-full blur-md opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Header with Count */}
        {selectedCategory !== 'all' && (
          <motion.div 
            className="mb-16 bg-gradient-to-r from-[#0A0A0A] via-black/80 to-[#0A0A0A] backdrop-blur-lg rounded-xl border border-white/10 p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {selectedCategory === 'high-energy' && <Zap className="w-5 h-5 text-[#FF0000]" />}
                  {selectedCategory === 'chill' && <Coffee className="w-5 h-5 text-[#FF0000]" />}
                  {selectedCategory === 'live-music' && <Music2 className="w-5 h-5 text-[#FF0000]" />}
                  {selectedCategory === 'beach' && <Sun className="w-5 h-5 text-[#FF0000]" />}
                  
                  <h2 className="text-2xl font-bold text-white">
                    {moodCategories.find(mood => mood.id === selectedCategory)?.name || 'Selected Category'}
                  </h2>
                </div>
                <p className="text-white/60">
                  <span className="font-medium text-[#FF0000]">{filteredHotspots.length}</span> venues found that match this vibe
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-white/70">
                  <Sparkles className="w-4 h-4 text-[#FF0000]" />
                  <span className="text-sm">Top venues in this category</span>
                </div>
                
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm text-white transition-colors duration-300 flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  View All Categories
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters and Sort */}
        <div className="sticky top-4 z-30 mb-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#FF0000]/20 rounded-full p-2">
                <Search className="h-5 w-5 text-[#FF0000]" />
              </div>
              <h2 className="text-xl font-bold text-white">Explore All Venues</h2>
              {filteredHotspots.length > 0 && (
                <div className="bg-white/10 px-2.5 py-0.5 rounded-full text-sm text-white/80">
                  {filteredHotspots.length} results
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-black/60 border border-white/10 hover:border-white/20 rounded-lg text-sm text-white flex-grow md:flex-grow-0 transition-all duration-300"
              >
                <Filter className="h-4 w-4 text-[#FF0000]" />
                {showFilters ? 'Hide Filters' : 'Filters'}
                {selectedFeatures.length > 0 && (
                  <span className="ml-1.5 bg-[#FF0000] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedFeatures.length}
                  </span>
                )}
              </motion.button>
              
              <div className="relative flex-grow md:flex-grow-0">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <TrendingUp className="h-4 w-4 text-[#FF0000]" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none pl-10 pr-8 py-2.5 bg-black/60 border border-white/10 hover:border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#FF0000] transition-all duration-300"
                >
                  <option value="popularity">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price">Price: Low to High</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-white/60" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-12 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#FF0000]/5 to-transparent opacity-50" />
              <div className="relative bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-white font-medium mb-3 flex items-center gap-2">
                      <Filter className="w-4 h-4 text-[#FF0000]" />
                      Category
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 bg-black/60 rounded-lg text-white border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent appearance-none transition-all duration-300"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="all">All Categories</option>
                        <option value="nightclub">Nightclubs</option>
                        <option value="restaurant">Restaurants</option>
                        <option value="bar">Bars</option>
                        <option value="live_music">Live Music</option>
                        <option value="beach">Beach Clubs</option>
                        <option value="high-energy">High Energy</option>
                        <option value="chill">Chill Vibes</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-white/60" />
                      </div>
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-white font-medium mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#FF0000]" />
                      Location
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 bg-black/60 rounded-lg text-white border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent appearance-none transition-all duration-300"
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
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-white/60" />
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-white font-medium mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#FF0000]" />
                      Rating
                    </label>
                    <div className="px-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/60">Minimum Rating</span>
                        <span className="text-sm font-medium text-white">{ratingFilter.toFixed(1)}+</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF0000]"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-white/40">0</span>
                        <span className="text-xs text-white/40">5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Features Filter */}
                <div className="mt-8">
                  <label className="block text-white font-medium mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF0000]" />
                    Features
                    {selectedFeatures.length > 0 && (
                      <span className="ml-2 text-sm text-white/60">
                        ({selectedFeatures.length} selected)
                      </span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Live Music', 'VIP Areas', 'Outdoor Seating', 'Private Events', 'Parking', 'Pool', 'Beach Access', 'Live DJs', 'Dance Floor', 'Restaurant'].map((feature) => (
                      <motion.button
                        key={feature}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedFeatures(prev =>
                            prev.includes(feature)
                              ? prev.filter(f => f !== feature)
                              : [...prev, feature]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-all duration-300 ${
                          selectedFeatures.includes(feature)
                            ? 'bg-[#FF0000] text-white font-medium'
                            : 'bg-black/60 border border-white/15 text-white/80 hover:bg-black/80 hover:border-white/30'
                        }`}
                      >
                        {selectedFeatures.includes(feature) && (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        {feature}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Filter actions */}
                <div className="mt-8 flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedLocation('all');
                      setRatingFilter(0);
                      setSelectedFeatures([]);
                      setSortBy('popularity');
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm transition-all duration-300"
                  >
                    Reset All
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/90 text-white rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    Apply Filters
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hotspots Grid */}
        <div className="grid grid-cols-1 gap-8 mb-20">
          {sortedHotspots.length > 0 ? (
            sortedHotspots.map((hotspot, index) => (
              <motion.div
                key={hotspot.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative"
              >
                {/* Spotlight effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF0000]/5 to-transparent rounded-xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden group-hover:border-[#FF0000]/30 transition-all duration-300">
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="md:w-2/5 lg:w-1/3 relative">
                      <div className="relative overflow-hidden aspect-video md:aspect-auto md:h-full">
                        <motion.img
                          src={hotspot.image}
                          alt={hotspot.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 1 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/70 md:bg-gradient-to-l md:from-transparent md:to-black/70" />
                      </div>
                      
                      {/* Rating Badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <Star className="h-4 w-4 text-[#FF0000]" fill="#FF0000" />
                        <span className="text-white font-medium">{hotspot.rating}</span>
                      </div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 bg-[#FF0000]/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <span className="text-white text-xs font-medium">{hotspot.type}</span>
                      </div>
                      
                      {/* Popularity Badge */}
                      {hotspot.popularity > 90 && (
                        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <TrendingUp className="h-3.5 w-3.5 text-[#FF0000]" />
                          <span className="text-white text-xs">{hotspot.popularity}% Popular</span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="md:w-3/5 lg:w-2/3 p-6 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-2xl font-bold text-white group-hover:text-[#FF0000] transition-colors duration-300">{hotspot.name}</h3>
                            
                            {/* ConviviaPass Partner Badge - show on alternating venues */}
                            {index % 2 === 0 && (
                              <div className="bg-gradient-to-r from-[#FF0000] to-purple-600 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-white" />
                                <span className="text-white text-xs font-medium">Partner</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-5 text-white/70">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-[#FF0000] mr-1.5" />
                              <span className="text-sm">{hotspot.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-[#FF0000] mr-1.5" />
                              <span className="text-sm">{hotspot.openingHours}</span>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-2 bg-[#FF0000]/10 rounded-lg">
                          <div className="text-sm text-white/50 mb-1">Price Range</div>
                          <div className="text-[#FF0000] font-medium">{hotspot.price}</div>
                        </div>
                      </div>

                      <p className="text-white/80 mb-6 max-w-3xl">{hotspot.description}</p>

                      {/* Features Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3">
                          <div className="text-xs text-white/50 mb-1">Type</div>
                          <div className="text-white flex items-center gap-1.5">
                            {hotspot.category === 'nightclub' && <Music className="h-4 w-4 text-[#FF0000]" />}
                            {hotspot.category === 'restaurant' && <Utensils className="h-4 w-4 text-[#FF0000]" />}
                            {hotspot.category === 'bar' && <Beer className="h-4 w-4 text-[#FF0000]" />}
                            {hotspot.category === 'live_music' && <Music2 className="h-4 w-4 text-[#FF0000]" />}
                            {hotspot.category === 'beach' && <Sun className="h-4 w-4 text-[#FF0000]" />}
                            {hotspot.category === 'high-energy' && <Zap className="h-4 w-4 text-[#FF0000]" />}
                            {hotspot.category === 'chill' && <Coffee className="h-4 w-4 text-[#FF0000]" />}
                            <span className="text-sm">{hotspot.type}</span>
                          </div>
                        </div>
                        
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3">
                          <div className="text-xs text-white/50 mb-1">Capacity</div>
                          <div className="text-white flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-[#FF0000]" />
                            <span className="text-sm">{hotspot.capacity} people</span>
                          </div>
                        </div>
                        
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3">
                          <div className="text-xs text-white/50 mb-1">Events</div>
                          <div className="text-white flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-[#FF0000]" />
                            <span className="text-sm">{hotspot.eventsCompleted}+ completed</span>
                          </div>
                        </div>
                      </div>

                      {/* Features Tags */}
                      <div className="mb-6">
                        <div className="text-sm text-white/60 mb-2">Highlights</div>
                        <div className="flex flex-wrap gap-2">
                          {hotspot.features.map((feature, idx) => (
                            <motion.span
                              key={`${hotspot.id}-feature-${idx}`}
                              initial={{ scale: 1 }}
                              whileHover={{ scale: 1.05 }}
                              className={`px-3 py-1 rounded-full text-sm ${
                                selectedFeatures.includes(feature)
                                  ? 'bg-[#FF0000]/80 text-white font-medium'
                                  : 'bg-white/10 text-white/80'
                              } transition-colors duration-300`}
                            >
                              {feature}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                      
                      {/* ConviviaPass Benefits - Only for partner venues */}
                      {index % 2 === 0 && (
                        <div className="mb-6 bg-gradient-to-r from-[#FF0000]/10 to-purple-600/10 rounded-lg p-4 border border-[#FF0000]/20">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-5 w-5 text-[#FF0000]" />
                            <h4 className="text-lg font-bold text-white">ConviviaPass Benefits</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {membershipTier === 'standard' && (
                              <>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                  <span className="text-white/90 text-sm">No cover charge on weekdays</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                  <span className="text-white/90 text-sm">Happy hour extended by 1 hour</span>
                                </div>
                              </>
                            )}
                            
                            {membershipTier === 'premium' && (
                              <>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                  <span className="text-white/90 text-sm">No cover charge any night</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                  <span className="text-white/90 text-sm">Complimentary welcome drink</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                  <span className="text-white/90 text-sm">Priority entry on peak nights</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                  <span className="text-white/90 text-sm">10% discount on food & drinks</span>
                                </div>
                              </>
                            )}
                            
                            {membershipTier === 'vip' && (
                              <>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                  <span className="text-white/90 text-sm">Exclusive VIP area access</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                  <span className="text-white/90 text-sm">Dedicated host service</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                  <span className="text-white/90 text-sm">Free valet parking</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                  <span className="text-white/90 text-sm">20% discount on all purchases</span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-white/60 text-xs">
                              Use the Convivia app to redeem benefits
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <div className={`h-2 w-2 rounded-full 
                                ${membershipTier === 'vip' 
                                  ? 'bg-yellow-400' 
                                  : membershipTier === 'premium'
                                  ? 'bg-[#FF0000]'
                                  : 'bg-purple-600'
                                }`} 
                              />
                              <span className={`text-xs font-medium
                                ${membershipTier === 'vip' 
                                  ? 'text-yellow-400' 
                                  : membershipTier === 'premium'
                                  ? 'text-[#FF0000]'
                                  : 'text-purple-600'
                                }`}
                              >
                                {membershipTier === 'vip' ? 'VIP' : membershipTier === 'premium' ? 'Premium' : 'Standard'} Membership
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bottom Actions Bar */}
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 border-t border-white/10">
                        {/* Contact & Social */}
                        <div className="flex items-center gap-4">
                          <a href={`tel:${hotspot.contact.phone}`} className="text-white/60 hover:text-[#FF0000] transition-colors duration-300">
                            <Phone className="h-5 w-5" />
                          </a>
                          <a href={hotspot.contact.website} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#FF0000] transition-colors duration-300">
                            <Globe className="h-5 w-5" />
                          </a>
                          <a href={`mailto:${hotspot.contact.email}`} className="text-white/60 hover:text-[#FF0000] transition-colors duration-300">
                            <Mail className="h-5 w-5" />
                          </a>
                          
                          {/* Social Icons */}
                          <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                            <a href={`https://instagram.com/${hotspot.contact.social.instagram}`} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#FF0000] transition-colors duration-300">
                              <Instagram className="h-4 w-4" />
                            </a>
                            <a href={`https://facebook.com/${hotspot.contact.social.facebook}`} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#FF0000] transition-colors duration-300">
                              <Facebook className="h-4 w-4" />
                            </a>
                            <a href={`https://twitter.com/${hotspot.contact.social.twitter}`} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#FF0000] transition-colors duration-300">
                              <Twitter className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-300"
                          >
                            <Heart className="h-5 w-5" />
                          </motion.button>
                          
                          {/* "Get Points" button for partner venues */}
                          {index % 2 === 0 && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2.5 bg-gradient-to-r from-[#FF0000] to-purple-600 hover:from-[#FF0000]/90 hover:to-purple-600/90 text-white rounded-full text-sm font-medium flex items-center gap-2 transition-all duration-300"
                            >
                              <Sparkles className="h-4 w-4" />
                              Check In (+10 pts)
                            </motion.button>
                          )}
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-5 py-2.5 bg-[#FF0000] hover:bg-[#FF0000]/90 text-white rounded-full text-sm font-medium flex items-center gap-2 transition-colors duration-300"
                          >
                            View Details
                            <ArrowRight className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Featured Indicator */}
                {index === 0 && (
                  <motion.div 
                    className="absolute -top-3 left-6 bg-gradient-to-r from-[#FF0000] to-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: [1, 1.05, 1],
                      opacity: 1
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Award className="w-3.5 h-3.5" />
                    TOP PICK
                  </motion.div>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-16 px-4 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10"
            >
              <div className="max-w-md mx-auto">
                <Search className="w-12 h-12 text-[#FF0000]/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No venues found</h3>
                <p className="text-white/60 mb-6">Try adjusting your filters or search criteria to find what you're looking for.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedLocation('all');
                    setRatingFilter(0);
                    setSelectedFeatures([]);
                    setSortBy('popularity');
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-[#FF0000] hover:bg-[#FF0000]/90 text-white rounded-full text-sm font-medium transition-colors duration-300"
                >
                  Reset All Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Page Footer */}
        <div className="border-t border-white/10 pt-12 pb-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[#FF0000] font-bold text-lg">Lagos Hotspots</span>
              <span className="text-white/40">|</span>
              <span className="text-white/60 text-sm">Updated Monthly</span>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-4">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-full text-sm transition-colors duration-300">
                Suggest a Venue
              </button>
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-full text-sm transition-colors duration-300">
                Nightlife News
              </button>
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-full text-sm transition-colors duration-300">
                Safety Guidelines
              </button>
              <button className="px-4 py-2 bg-[#FF0000]/10 hover:bg-[#FF0000]/20 text-[#FF0000] rounded-full text-sm transition-colors duration-300">
                Advertise with Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hotspots;