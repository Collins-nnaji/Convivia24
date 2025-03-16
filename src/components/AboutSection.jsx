import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Users, 
  Globe, 
  Calendar,
  Heart,
  MapPin
} from 'lucide-react';

const AboutSection = () => {
  const stats = [
    { icon: <Users className="h-6 w-6 text-red-600" />, value: "15,000+", label: "Community Members" },
    { icon: <Calendar className="h-6 w-6 text-red-600" />, value: "750+", label: "Events Monthly" },
    { icon: <Globe className="h-6 w-6 text-red-600" />, value: "25+", label: "Cities Covered" },
    { icon: <Heart className="h-6 w-6 text-red-600" />, value: "98%", label: "Client Satisfaction" }
  ];

  const locations = [
    { country: "Nigeria", cities: "Lagos, Abuja, Port Harcourt, Benin, Enugu, Ibadan", flagEmoji: "🇳🇬" },
    { country: "United Kingdom", cities: "London, Manchester, Birmingham, Leeds, Liverpool", flagEmoji: "🇬🇧" }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Image Column */}
          <div className="lg:w-1/2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-red-600 rounded-tl-3xl z-0"></div>
              <img 
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                alt="Celebration Event" 
                className="rounded-lg shadow-xl relative z-10 w-full"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-600 rounded-br-3xl z-0"></div>
            </motion.div>
          </div>
          
          {/* Content Column */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                About Convivia24
              </h2>
              
              <div className="bg-red-600 h-1 w-20 mb-6"></div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                Convivia24 is a comprehensive celebration platform that brings together communities, event services, and entertainment options in one place. We help you organize, plan, and execute memorable celebrations that honor your cultural heritage while embracing modern conveniences.
              </p>
              
              <p className="text-gray-700 mb-8 leading-relaxed">
                Our platform connects you with local communities and groups that share your interests and celebration styles. Whether you're planning a traditional ceremony, a modern wedding, or a corporate event, Convivia24 provides the tools, resources, and connections you need to make it exceptional.
              </p>
              
              <div className="flex items-center mb-8">
                <Award className="h-10 w-10 text-red-600 mr-4" />
                <div>
                  <h3 className="font-bold text-lg">Location-Based Services</h3>
                  <p className="text-gray-600">Tailored content and services for each region we serve</p>
                </div>
              </div>
              
              <div className="mb-8 space-y-4">
                {locations.map((location, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow border-l-4 border-red-600">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{location.flagEmoji}</span>
                      <h3 className="font-bold">{location.country}</h3>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{location.cities}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      {stat.icon}
                    </div>
                    <div className="font-bold text-2xl text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection; 