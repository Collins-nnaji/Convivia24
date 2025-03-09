import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Users, 
  Globe, 
  Calendar,
  Heart
} from 'lucide-react';

const AboutSection = () => {
  const stats = [
    { icon: <Users className="h-6 w-6 text-red-600" />, value: "10,000+", label: "Celebrations Served" },
    { icon: <Calendar className="h-6 w-6 text-red-600" />, value: "500+", label: "Events Monthly" },
    { icon: <Globe className="h-6 w-6 text-red-600" />, value: "20+", label: "Cities Covered" },
    { icon: <Heart className="h-6 w-6 text-red-600" />, value: "98%", label: "Client Satisfaction" }
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
                Convivia24 is Nigeria's premier celebration service provider, specializing in beverage services for all types of events. 
                From traditional ceremonies to modern celebrations, we bring expertise, quality, and cultural understanding to every event.
              </p>
              
              <p className="text-gray-700 mb-8 leading-relaxed">
                Founded in 2020, we've quickly grown to become the trusted partner for thousands of celebrations across Nigeria. 
                Our mission is to elevate every celebration with exceptional service, authentic cultural experiences, and premium beverage options.
              </p>
              
              <div className="flex items-center mb-8">
                <Award className="h-10 w-10 text-red-600 mr-4" />
                <div>
                  <h3 className="font-bold text-lg">Award-Winning Service</h3>
                  <p className="text-gray-600">Recognized for excellence in event services</p>
                </div>
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