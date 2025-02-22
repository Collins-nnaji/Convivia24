import React from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Heart, 
  Star,
  Calendar,
  GlassWater,
  Users,
  Clock
} from 'lucide-react';

const CulturalSection = () => {
  const ceremonies = [
    {
      title: "Traditional Wedding",
      description: "Complete beverage service for traditional wedding ceremonies",
      features: [
        "Palm wine service",
        "Traditional servers",
        "Ceremonial presentations"
      ],
      icon: <Crown size={32} className="text-red-600" />
    },
    {
      title: "Naming Ceremony",
      description: "Special packages for naming ceremonies and family celebrations",
      features: [
        "Custom drink selections",
        "Traditional elements",
        "Family-focused service"
      ],
      icon: <Heart size={32} className="text-red-600" />
    },
    {
      title: "Cultural Festival",
      description: "Large-scale beverage management for cultural festivals",
      features: [
        "Multiple service points",
        "Traditional beverages",
        "High-volume capacity"
      ],
      icon: <Star size={32} className="text-red-600" />
    }
  ];

  const testimonials = [
    {
      text: "They perfectly understood our traditional requirements and delivered beyond expectations.",
      author: "Chief Ademola",
      event: "Traditional Wedding"
    },
    {
      text: "The palm wine service was exceptional, and they maintained our customs perfectly.",
      author: "Mrs. Okonkwo",
      event: "Naming Ceremony"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Celebrating Our Traditions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Expert beverage service that honors and elevates traditional ceremonies
          </p>
        </div>

        {/* Ceremony Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {ceremonies.map((ceremony, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                {ceremony.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{ceremony.title}</h3>
              <p className="text-gray-600 mb-4">{ceremony.description}</p>
              <ul className="space-y-2">
                {ceremony.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center text-sm text-gray-500">
                    <GlassWater size={16} className="mr-2 text-red-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Service Process */}
        <div className="bg-gray-900 text-white rounded-2xl p-8 mb-20">
          <h3 className="text-2xl font-bold mb-8 text-center">Our Cultural Service Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Calendar size={24} />,
                title: "Consultation",
                text: "Understanding your ceremony's specific requirements"
              },
              {
                icon: <Users size={24} />,
                title: "Custom Planning",
                text: "Tailoring our service to your traditions"
              },
              {
                icon: <GlassWater size={24} />,
                title: "Traditional Setup",
                text: "Culturally appropriate presentation"
              },
              {
                icon: <Clock size={24} />,
                title: "Ceremony Service",
                text: "Professional and respectful execution"
              }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <h4 className="font-bold mb-2">{step.title}</h4>
                <p className="text-gray-400 text-sm">{step.text}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-full h-0.5 bg-red-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-start mb-4">
                <div className="bg-red-50 p-3 rounded-full mr-4">
                  <Star className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.event}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CulturalSection;