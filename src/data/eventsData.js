// src/data/eventsData.js
// Centralized store for all events data

// Categories for events
export const eventCategories = [
  "All Events",
  "Club Nights",
  "Gigs",
  "Fun Things",
  "Food & Drink",
  "Festivals",
  "Business & Conferences",
  "Dating",
  "Comedy",
  "Arts & Performance",
  "Classes",
  "Sports & Fitness"
];

// Base events data
const eventsData = [
  {
    id: 1,
    title: "Raver Tots Outdoor Festival Richmond 2025",
    venue: "Old Deer Park Car Park",
    location: "Richmond",
    date: "Sun 31st Aug",
    time: "1:00pm",
    category: "Festivals",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6a3?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
    price: "£5 - £35",
    description: "Raver Tots presents the UK's biggest family friendly outdoor festival! Join us for a day of music, dancing and family fun, with world-class DJs.",
    interests: ["Electronic Music", "Family Activities", "Festivals", "Dancing"],
    attendees: {
      count: 342,
      mutual: 5,
      profiles: [
        { id: 1, name: "Emma Wilson", image: "https://randomuser.me/api/portraits/women/12.jpg", mutual: true },
        { id: 2, name: "James Chen", image: "https://randomuser.me/api/portraits/men/32.jpg", mutual: true },
        { id: 3, name: "Sophie Martin", image: "https://randomuser.me/api/portraits/women/23.jpg", mutual: true },
        { id: 4, name: "David Thompson", image: "https://randomuser.me/api/portraits/men/45.jpg", mutual: false }
      ]
    }
  },
  {
    id: 2,
    title: "Raver Tots Outdoor Festival Reading 2025",
    venue: "Prospect Park",
    location: "Reading",
    date: "Sun 20th Jul",
    time: "1:00pm",
    category: "Festivals",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
    price: "£5 - £40",
    description: "Raver Tots comes to Reading with an incredible outdoor festival featuring top DJs and fun activities for the whole family.",
    interests: ["Electronic Music", "Family Activities", "Festivals", "Dancing"],
    attendees: {
      count: 287,
      mutual: 2,
      profiles: [
        { id: 5, name: "Alex Morgan", image: "https://randomuser.me/api/portraits/men/22.jpg", mutual: false },
        { id: 6, name: "Leila Patel", image: "https://randomuser.me/api/portraits/women/31.jpg", mutual: false },
        { id: 7, name: "Tom Jackson", image: "https://randomuser.me/api/portraits/men/67.jpg", mutual: false },
        { id: 8, name: "Sarah Johnson", image: "https://randomuser.me/api/portraits/women/67.jpg", mutual: true }
      ]
    }
  },
  {
    id: 3,
    title: "Raver Tots Outdoor Festival Kent 2025",
    venue: "Mote Park",
    location: "Maidstone",
    date: "Mon 26th May",
    time: "12:00pm",
    category: "Festivals",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
    price: "£5 - £40",
    description: "The ultimate family-friendly festival comes to Kent, with dance music, entertainment and activities designed for parents and children alike.",
    interests: ["Electronic Music", "Family Activities", "Festivals", "Dancing"],
    attendees: {
      count: 215,
      mutual: 1,
      profiles: [
        { id: 9, name: "Maya Rodriguez", image: "https://randomuser.me/api/portraits/women/44.jpg", mutual: true },
        { id: 10, name: "Michael Roberts", image: "https://randomuser.me/api/portraits/men/59.jpg", mutual: false },
        { id: 11, name: "Anya Singh", image: "https://randomuser.me/api/portraits/women/39.jpg", mutual: false },
        { id: 12, name: "Chris Lee", image: "https://randomuser.me/api/portraits/men/17.jpg", mutual: false }
      ]
    }
  },
  {
    id: 4,
    title: "Summer Ball 2025 | Imperial College Union",
    venue: "Imperial College London",
    location: "London",
    date: "Sat 21st Jun",
    time: "2:00pm",
    category: "Arts & Performance",
    image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
    price: "£45 - £180",
    description: "Imperial College London's annual Summer Ball featuring live music, performances, and an unforgettable night of entertainment for students and alumni.",
    interests: ["Live Music", "Dancing", "Networking", "Student Events"],
    attendees: {
      count: 618,
      mutual: 12,
      profiles: [
        { id: 13, name: "Emma Wilson", image: "https://randomuser.me/api/portraits/women/44.jpg", mutual: true },
        { id: 14, name: "James Chen", image: "https://randomuser.me/api/portraits/men/22.jpg", mutual: true },
        { id: 15, name: "Sophie Martin", image: "https://randomuser.me/api/portraits/women/67.jpg", mutual: true },
        { id: 16, name: "David Thompson", image: "https://randomuser.me/api/portraits/men/59.jpg", mutual: false }
      ]
    }
  },
  {
    id: 5,
    title: "Raver Tots Outdoor Festival Barnet 2025",
    venue: "Barnet Stadium",
    location: "Barnet",
    date: "Sat 28th Jun",
    time: "2:00pm",
    category: "Festivals",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
    price: "£10 - £45",
    description: "Raver Tots brings its unique family-friendly festival to Barnet with top DJs, entertainment, and activities for all ages.",
    interests: ["Electronic Music", "Family Activities", "Festivals", "Dancing"],
    attendees: {
      count: 189,
      mutual: 3,
      profiles: [
        { id: 17, name: "Michael Roberts", image: "https://randomuser.me/api/portraits/men/81.jpg", mutual: false },
        { id: 18, name: "Leila Patel", image: "https://randomuser.me/api/portraits/women/39.jpg", mutual: true },
        { id: 19, name: "Tom Jackson", image: "https://randomuser.me/api/portraits/men/17.jpg", mutual: false },
        { id: 20, name: "Sarah Johnson", image: "https://randomuser.me/api/portraits/women/55.jpg", mutual: true }
      ]
    }
  },
  {
    id: 6,
    title: "DULCE SOL / VOL XX",
    venue: "Secret Location",
    location: "London",
    date: "Mon 9th Jun",
    time: "2:00pm",
    category: "Club Nights",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
    price: "£20 - £60",
    description: "The twentieth edition of London's most exclusive underground electronic music event at a secret location revealed only to ticket holders.",
    interests: ["Electronic Music", "Underground Scene", "Club Nights", "Dancing"],
    attendees: {
      count: 204,
      mutual: 3,
      profiles: [
        { id: 21, name: "Michael Roberts", image: "https://randomuser.me/api/portraits/men/81.jpg", mutual: false },
        { id: 22, name: "Leila Patel", image: "https://randomuser.me/api/portraits/women/39.jpg", mutual: true },
        { id: 23, name: "Tom Jackson", image: "https://randomuser.me/api/portraits/men/17.jpg", mutual: false },
        { id: 24, name: "Sarah Johnson", image: "https://randomuser.me/api/portraits/women/55.jpg", mutual: true }
      ]
    }
  },
  {
    id: 7,
    title: "The Halal Food Festival Manchester 2025",
    venue: "Trafford Centre",
    location: "Manchester",
    date: "Sat 23rd Aug",
    time: "12:00pm",
    category: "Food & Drink",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
    price: "£8 - £15",
    description: "The UK's largest celebration of halal food culture with international cuisines, cooking demonstrations, and food stalls from around the world.",
    interests: ["Food", "Cultural Events", "Halal", "Culinary"],
    attendees: {
      count: 175,
      mutual: 2,
      profiles: [
        { id: 25, name: "Michael Roberts", image: "https://randomuser.me/api/portraits/women/72.jpg", mutual: false },
        { id: 26, name: "Leila Patel", image: "https://randomuser.me/api/portraits/men/29.jpg", mutual: true },
        { id: 27, name: "Tom Jackson", image: "https://randomuser.me/api/portraits/women/51.jpg", mutual: false },
        { id: 28, name: "Sarah Johnson", image: "https://randomuser.me/api/portraits/men/64.jpg", mutual: true }
      ]
    }
  },
  {
    id: 8,
    title: "Sounds From The Other City 2025",
    venue: "Multiple Venues",
    location: "Manchester",
    date: "Sun 4th May",
    time: "2:00pm",
    category: "Arts & Performance",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&auto=format&fit=crop&q=80",
    price: "£30 - £85",
    description: "A celebration of new music and performance across multiple venues in Manchester, showcasing emerging artists and experimental sounds.",
    interests: ["Live Music", "Indie", "Arts", "Alternative"],
    attendees: {
      count: 248,
      mutual: 4,
      profiles: [
        { id: 29, name: "Michael Roberts", image: "https://randomuser.me/api/portraits/women/29.jpg", mutual: true },
        { id: 30, name: "Leila Patel", image: "https://randomuser.me/api/portraits/men/31.jpg", mutual: true },
        { id: 31, name: "Tom Jackson", image: "https://randomuser.me/api/portraits/women/37.jpg", mutual: false },
        { id: 32, name: "Sarah Johnson", image: "https://randomuser.me/api/portraits/men/94.jpg", mutual: true }
      ]
    }
  }
];

export default eventsData; 