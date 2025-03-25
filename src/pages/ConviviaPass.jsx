import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  CheckCircle, 
  Building, 
  Globe, 
  Ticket, 
  Users, 
  Gift, 
  Calendar, 
  CreditCard,
  Zap,
  Clock,
  MapPin,
  Star,
  Percent
} from 'lucide-react';

const ConviviaPass = () => {
  return (
    <div className="bg-gradient-to-b from-black to-purple-900/20 min-h-screen">
      {/* Header Section with Badge */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/30 to-purple-900/30 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-20 z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <Sparkles className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-white">Exclusive Membership</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-400">
                  ConviviaPass
                </span>
              </h1>
              
              <p className="text-xl text-white/80 mb-8 max-w-xl">
                Your exclusive membership for premium experiences at partner venues across Nigeria and the UK.
                Unlock special discounts, VIP access, and exceptional benefits.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-700/30 transition-all duration-300"
                >
                  Join ConviviaPass
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-300"
                >
                  Learn More
                </motion.button>
              </div>
            </div>
            
            <div className="md:w-1/2 max-w-md mx-auto perspective">
              {/* Membership Card */}
              <motion.div
                initial={{ rotateY: 30, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-[1.58/1] shadow-2xl shadow-purple-900/50">
                  {/* Card Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-purple-800">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0)_60%)]"></div>
                      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/10 filter blur-3xl"></div>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-6 right-6">
                      <div className="flex space-x-1">
                        <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-xl"></div>
                        <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-xl"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="relative p-6 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-white">ConviviaPass</h3>
                        <p className="text-white/70 text-sm">Premium Member</p>
                      </div>
                      <div className="rounded-full bg-white/20 backdrop-blur-xl p-2">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      {/* Barcode/Card Number */}
                      <div className="mb-4">
                        <div className="bg-white/10 backdrop-blur-xl p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-1">
                              <div className="h-8 w-1 bg-white/80"></div>
                              <div className="h-8 w-0.5 bg-white/80"></div>
                              <div className="h-8 w-2 bg-white/80"></div>
                              <div className="h-8 w-0.5 bg-white/80"></div>
                              <div className="h-8 w-1 bg-white/80"></div>
                              <div className="h-8 w-2 bg-white/80"></div>
                              <div className="h-8 w-1 bg-white/80"></div>
                              <div className="h-8 w-0.5 bg-white/80"></div>
                            </div>
                            <div className="text-white/80 text-xs">
                              5763 8921 4652 9103
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div>
                          <p className="text-white/60 text-xs mb-1">MEMBER NAME</p>
                          <p className="text-white font-medium">JOHN SMITH</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-xs mb-1">MEMBERSHIP</p>
                          <p className="text-white font-medium">PREMIUM</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-xs mb-1">VALID THROUGH</p>
                          <p className="text-white font-medium">12/26</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Card Reflection */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent opacity-10 transform -scale-y-100 translate-y-full blur-sm"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Benefits of ConviviaPass</h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Enjoy exclusive privileges that elevate your event experiences across Nigeria and the UK.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Percent className="h-10 w-10 text-red-400" />,
              title: "Exclusive Discounts",
              description: "Enjoy up to 30% off at partner venues including premium event spaces, hotels, and restaurants."
            },
            {
              icon: <Ticket className="h-10 w-10 text-red-400" />,
              title: "Priority Access",
              description: "Get early access to events, venue bookings, and limited-time offers before they're available to the public."
            },
            {
              icon: <Star className="h-10 w-10 text-red-400" />,
              title: "VIP Treatment",
              description: "Receive personalized service, complimentary upgrades, and special attention at partner establishments."
            },
            {
              icon: <Calendar className="h-10 w-10 text-red-400" />,
              title: "Special Events",
              description: "Access to exclusive member-only events, tastings, and experiences throughout the year."
            },
            {
              icon: <Globe className="h-10 w-10 text-red-400" />,
              title: "International Recognition",
              description: "Your membership is valid at all partner locations in both Nigeria and the UK."
            },
            {
              icon: <Gift className="h-10 w-10 text-red-400" />,
              title: "Complimentary Perks",
              description: "Enjoy welcome drinks, free services, and special amenities at participating venues."
            }
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-black/60 to-purple-900/40 backdrop-blur-sm p-8 rounded-xl border border-white/10 hover:border-red-500/30 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-red-600/20 to-purple-600/20 rounded-full flex items-center justify-center mb-6">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{benefit.title}</h3>
              <p className="text-white/70">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Membership Tiers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        {/* Background decorations */}
        <div className="absolute top-20 right-0 w-64 h-64 bg-red-500 rounded-full filter blur-3xl opacity-10 -z-10"></div>
        <div className="absolute bottom-20 left-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-10 -z-10"></div>
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Choose Your Membership</h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Select the perfect membership tier that fits your lifestyle and event preferences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Standard Tier */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-black/60 to-purple-900/30 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="p-8">
              <h3 className="text-2xl font-bold text-white mb-2">Standard</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-white">₦25,000</span>
                <span className="text-white/60 ml-2">/ year</span>
              </div>
              <p className="text-white/70 mb-6">Perfect for occasional event-goers who want to enjoy special perks.</p>
              
              <ul className="space-y-3 mb-8">
                {[
                  "10% discount at partner venues",
                  "Access to member-only events",
                  "Early access to venue bookings",
                  "Digital membership card"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-300"
              >
                Select Standard
              </motion.button>
            </div>
          </motion.div>
          
          {/* Premium Tier */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-red-800/30 to-purple-800/40 backdrop-blur-sm rounded-xl border border-red-500/30 overflow-hidden transform md:scale-105 md:-translate-y-2 shadow-lg shadow-purple-900/20"
          >
            <div className="bg-gradient-to-r from-red-600 to-purple-600 text-white text-center py-2 text-sm font-medium">
              MOST POPULAR
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-white">₦45,000</span>
                <span className="text-white/60 ml-2">/ year</span>
              </div>
              <p className="text-white/70 mb-6">Our recommended option for regular event attendees and planners.</p>
              
              <ul className="space-y-3 mb-8">
                {[
                  "20% discount at all partner venues",
                  "Priority access to sold-out events",
                  "Complimentary upgrades when available",
                  "VIP check-in at events",
                  "Physical and digital membership card",
                  "24/7 concierge service"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg shadow-purple-900/20 transition-all duration-300"
              >
                Select Premium
              </motion.button>
            </div>
          </motion.div>
          
          {/* Platinum Tier */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-black/60 to-purple-900/30 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="p-8">
              <h3 className="text-2xl font-bold text-white mb-2">Platinum</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-white">₦85,000</span>
                <span className="text-white/60 ml-2">/ year</span>
              </div>
              <p className="text-white/70 mb-6">The ultimate experience for frequent event hosts and luxury seekers.</p>
              
              <ul className="space-y-3 mb-8">
                {[
                  "30% discount at all partner venues",
                  "Guaranteed reservations at sold-out events",
                  "Dedicated event planning assistance",
                  "Complimentary welcome amenities",
                  "Exclusive international partner benefits",
                  "Luxury metal membership card",
                  "Private events invitation",
                  "Personal relationship manager"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-300"
              >
                Select Platinum
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ConviviaPass;
