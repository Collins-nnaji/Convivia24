import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  Medal,
  SlidersHorizontal,
  SearchX,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// Simple HotspotCard component for displaying venues
const HotspotCard = ({ hotspot, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden relative mb-6 shadow-lg hover:shadow-xl hover:border-[#FF0000]/20 transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row">
        {/* Venue Image */}
        <div className="md:w-1/3 h-60 md:h-auto relative overflow-hidden">
          <motion.img 
            src={hotspot.image} 
            alt={hotspot.name}
            className="w-full h-full object-cover"
            animate={{ 
              scale: isHovered ? 1.05 : 1
            }}
            transition={{ duration: 0.4 }}
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"
            animate={{
              opacity: isHovered ? 0.7 : 0.5
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.div 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white"
          >
            {hotspot.location.includes('Nigeria') ? '🇳🇬' : '🇬🇧'} {hotspot.type}
          </motion.div>
        </div>
        
        {/* Venue Info */}
        <div className="md:w-2/3 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
            <div>
              <motion.h3 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.1 }}
                className="text-xl font-bold text-white mb-2"
              >
                {hotspot.name}
              </motion.h3>
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="flex items-center gap-2 text-white/70 text-sm mb-1"
              >
                <MapPin className="h-4 w-4 text-[#FF0000]" />
                <span>{hotspot.location}</span>
              </motion.div>
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="flex items-center gap-2 text-white/70 text-sm"
              >
                <Clock className="h-4 w-4 text-[#FF0000]" />
                <span>{hotspot.openingHours}</span>
              </motion.div>
            </div>
            
            <div className="flex flex-col items-end">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                className="flex items-center gap-1.5 mb-2"
              >
                <span className="text-white font-bold">{hotspot.rating}</span>
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              </motion.div>
              <motion.div 
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                className="text-white/70 text-sm"
              >
                {hotspot.price}
              </motion.div>
            </div>
          </div>
          
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            className="text-white/70 mb-5"
          >
            {hotspot.description}
          </motion.p>
          
          {/* Features Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {hotspot.features.map((feature, idx) => (
              <motion.span 
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 + idx * 0.05 + 0.5 }}
                whileHover={{ 
                  scale: 1.1, 
                  backgroundColor: "rgba(255, 0, 0, 0.2)"
                }}
                className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-white/90 cursor-default"
              >
                {feature}
              </motion.span>
            ))}
          </div>
          
          {/* Bottom Actions Bar */}
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.7 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 border-t border-white/10"
          >
            {/* Contact & Social */}
            <div className="flex items-center gap-4">
              <motion.a 
                whileHover={{ y: -4, color: "#FF0000" }}
                whileTap={{ scale: 0.95 }}
                href={`tel:${hotspot.contact.phone}`} 
                className="text-white/60 hover:text-[#FF0000] transition-colors duration-300"
              >
                <Phone className="h-5 w-5" />
              </motion.a>
              <motion.a 
                whileHover={{ y: -4, color: "#FF0000" }}
                whileTap={{ scale: 0.95 }}
                href={`https://${hotspot.contact.website}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/60 hover:text-[#FF0000] transition-colors duration-300"
              >
                <Globe className="h-5 w-5" />
              </motion.a>
              <motion.a 
                whileHover={{ y: -4, color: "#FF0000" }}
                whileTap={{ scale: 0.95 }}
                href={`mailto:${hotspot.contact.email}`} 
                className="text-white/60 hover:text-[#FF0000] transition-colors duration-300"
              >
                <Mail className="h-5 w-5" />
              </motion.a>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-300"
              >
                <Heart className="h-5 w-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#CC0000" }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 bg-[#FF0000] hover:bg-[#FF0000]/90 text-white rounded-full text-sm font-medium flex items-center gap-2 transition-colors duration-300"
              >
                <span>View Details</span>
                <motion.div
                  animate={{ x: isHovered ? 4 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

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
  
  // For scroll animations
  const [scrollY, setScrollY] = useState(0);
  
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
      image: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1430&q=80',
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
      image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjR8fGdhcmRlbiUyMHJlc3RhdXJhbnR8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
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
      image: 'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cm9vZnRvcCUyMGJhcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
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
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8amF6eiUyMGNsdWJ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
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
      image: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9f16?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fGJlYWNoJTIwY2x1YnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
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
      image: 'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTR8fGJlYWNoJTIwcmVzb3J0JTIwbmlnZXJpYXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
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
      image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHN1bnNldCUyMGJlYWNofGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
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
      id: 9,
      name: 'The Cozy Corner',
      category: 'chill',
      type: 'Lounge & Cafe',
      location: 'Ikoyi, Lagos',
      image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8Y29yZmZlZSUyMHNob3B8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
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
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8amF6eiUyMGJhcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
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
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8bmlnaHRjbHVifGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
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
      image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8emVuJTIwZ2FyZGVufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
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

  // Scroll position tracking for animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Page transition
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-black via-[#0A0A0A] to-[#121212] text-white pb-20"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
    >
      {/* Top Spotlight Section */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Top Spotlight</h2>
            <p className="text-white/70">Featured venues you'll love</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={() => handleManualNavigation(currentTopSpot === 0 ? topHotspots.length - 1 : currentTopSpot - 1)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => handleManualNavigation((currentTopSpot + 1) % topHotspots.length)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
        
        <div className="relative h-[600px] overflow-hidden rounded-2xl">
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="flex h-full"
              animate={spotlightControls}
              style={{ width: `${topHotspots.length * 100}%` }}
            >
              {topHotspots.map((hotspot, idx) => (
                <div
                  key={idx}
                  className="relative h-full w-full"
                  style={{ flex: `0 0 ${100 / topHotspots.length}%` }}
                >
                  <div className="relative h-full overflow-hidden rounded-xl">
                    {/* Background Image with Parallax Effect */}
                    <motion.div
                      animate={{ 
                        scale: currentTopSpot === idx ? 1.1 : 1,
                        translateX: currentTopSpot === idx ? '2%' : '0%'
                      }}
                      transition={{ duration: 6, ease: 'easeInOut' }}
                      className="absolute inset-0"
                    >
                      <img
                        src={hotspot.image}
                        alt={hotspot.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    </motion.div>
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ 
                          opacity: currentTopSpot === idx ? 1 : 0,
                          y: currentTopSpot === idx ? 0 : 30
                        }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="max-w-3xl"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <span className="bg-[#FF0000] text-white text-xs font-bold px-3 py-1 rounded-full">FEATURED</span>
                          <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">{hotspot.type}</span>
                        </div>
                        
                        <h3 className="text-3xl md:text-5xl font-bold mb-3">{hotspot.name}</h3>
                        
                        <div className="flex items-center gap-4 mb-3 text-sm md:text-base">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-[#FF0000]" />
                            <span>{hotspot.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span>{hotspot.rating} Rating</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-[#FF0000]" />
                            <span>{hotspot.openingHours}</span>
                          </div>
                        </div>
                        
                        <p className="text-white/80 mb-6 max-w-2xl">{hotspot.description}</p>
                        
                        <div className="flex flex-wrap gap-3 mb-6">
                          {hotspot.features.map((feature, idx) => (
                            <motion.span 
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * idx + 0.5 }}
                              className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-white/90"
                            >
                              {feature}
                            </motion.span>
                          ))}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                          <motion.button 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-gradient-to-r from-[#FF0000] to-red-700 hover:from-[#FF0000]/90 hover:to-red-700/90 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                          >
                            View Details
                            <ArrowRight className="h-4 w-4" />
                          </motion.button>
                          <motion.button 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                          >
                            Save for Later
                            <Heart className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Promo Tag */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ 
                      opacity: currentTopSpot === idx ? 1 : 0,
                      x: currentTopSpot === idx ? 0 : 20
                    }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-6 right-6 bg-gradient-to-r from-[#FF0000] to-red-700 px-4 py-2 rounded-full flex items-center gap-2"
                  >
                    <Award className="h-4 w-4 text-white" />
                    <span className="text-white font-bold text-sm">{hotspot.promoMessage || 'Top Pick'}</span>
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>
          
          {/* Carousel Controls */}
          <div className="absolute bottom-6 right-6 flex items-center gap-3">
            {topHotspots.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleManualNavigation(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentTopSpot === idx ? 'w-8 bg-[#FF0000]' : 'w-2.5 bg-white/30'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Discover Categories Section */}
      <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Discover Hotspots</h2>
            <p className="text-white/70">Browse popular venues in your area</p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
              <input
                type="text"
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 text-white border border-white/10 rounded-full pl-10 pr-4 py-2 w-60 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF0000]/50 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors duration-300"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Category Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-10">
          {moodCategories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 ${
                category.id === selectedCategory
                  ? 'bg-[#FF0000]/70 text-white'
                  : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              {category.icon}
              <span className="mt-2 text-sm">{category.name}</span>
            </button>
          ))}
        </div>
        
        {/* Hotspots Listing */}
        <div className="grid grid-cols-1 gap-8">
          {sortedHotspots.length > 0 ? (
            sortedHotspots.map((hotspot, index) => (
              <HotspotCard key={index} hotspot={hotspot} index={index} />
            ))
          ) : (
            <div className="text-center py-16">
              <SearchX className="h-16 w-16 mx-auto text-white/40 mb-4" />
              <h3 className="text-2xl font-bold mb-2">No venues found</h3>
              <p className="text-white/70 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setRatingFilter(0);
                  setSortBy('popularity');
                  setSelectedFeatures([]);
                }}
                className="px-6 py-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors duration-300 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default Hotspots;