import React from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  UserIcon
} from '@heroicons/react/24/outline';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-amber-900 via-amber-800 to-rose-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-200 to-rose-200 bg-clip-text text-transparent">
              About Ukriti Jewells
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-amber-100">
              From homemaker to entrepreneur - Creating beautiful, affordable jewelry with passion and purpose
            </p>
            <div className="flex items-center justify-center space-x-2 text-amber-200">
              <SparklesIcon className="h-6 w-6" />
              <span className="text-lg">Where Dreams Meet Affordability</span>
              <SparklesIcon className="h-6 w-6" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-6">My Story</h2>
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  Hello, I am Ankita Thakur, a proud homemaker turned entrepreneur.
                  In 2024, I decided to take a bold step and start my own online business with a dream to create something meaningful while managing my home.
                </p>
                <p>
                  What began as a small initiative has now grown into a brand that offers high-quality imitation jewellery at the most affordable prices. As a woman, I've always loved jewellery, but I also knew how expensive it could be to own good designs. I wanted to make beautiful, durable jewellery accessible to everyone—without the hefty price tags.
                </p>
                <p>
                  My USP is simple yet powerful: ✨ We offer jewellery that is at least 40% more affordable than similar quality products available in the market. ✨ Every piece is carefully chosen and crafted from brass, oxidised metals, stainless steel, and other fine materials, ensuring style meets durability.
                </p>
                <p>
                  Right now, I run a small but growing business. While my online sales form the foundation, my biggest success comes from local expos and events, where I personally connect with customers and share the love I put into every piece.
                </p>
                <p>
                  This is just the beginning. My dream is to scale this business and create opportunities for other housewives like me, empowering them to achieve financial independence while balancing their families. Together, we can build a community where passion meets purpose.
                </p>
                <p className="italic font-medium text-amber-600">
                  Every time you wear one of my pieces, you're not just buying jewellery—you're becoming a part of my story. Thank you for supporting my dream and helping me grow.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600"
                alt="Jewelry crafting"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-amber-500 text-white p-6 rounded-2xl shadow-lg">
                <SparklesIcon className="h-8 w-8 mb-2" />
                <p className="font-bold">Quality Crafted</p>
                <p className="text-sm">Excellence in Every Piece</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Founder</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              The passionate entrepreneur behind Ukriti Jewells
            </p>
          </motion.div>

          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group max-w-md"
            >
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <UserIcon className="h-24 w-24 text-white" />
                <div className="absolute bottom-4 left-4 text-white text-sm">
                  (Picture will be updated later)
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Ankita Thakur</h3>
                <p className="text-amber-600 font-semibold mb-3">Cofounder</p>
                <p className="text-gray-600">
                  A passionate homemaker turned entrepreneur, dedicated to making beautiful jewelry 
                  accessible to everyone while empowering other women to pursue their dreams.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-8">Our Mission</h2>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  "To create jewelry that not only adorns but also empowers, celebrating the unique 
                  beauty of every individual while preserving the timeless art of traditional craftsmanship."
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <SparklesIcon className="h-6 w-6 text-amber-500" />
                  <span className="text-gray-600">Affordable luxury for everyone</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Coming Soon Notice */}
      <section className="py-16 bg-gradient-to-r from-rose-500 to-amber-500 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
          >
            <SparklesIcon className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">More Content Coming Soon!</h3>
            <p className="text-lg opacity-90">
              We're continuously expanding our story. Stay tuned for more insights into our journey, 
              behind-the-scenes content, and exclusive features.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
