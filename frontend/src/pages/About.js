import React from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  HeartIcon, 
  ShieldCheckIcon, 
  GlobeAltIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const About = () => {
  const values = [
    {
      icon: HeartIcon,
      title: 'Crafted with Love',
      description: 'Every piece is meticulously handcrafted by our skilled artisans with passion and dedication.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Quality Assured',
      description: 'We use only the finest materials and follow strict quality standards to ensure lasting beauty.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Ethically Sourced',
      description: 'Our gemstones and materials are responsibly sourced from trusted suppliers worldwide.'
    },
    {
      icon: AcademicCapIcon,
      title: 'Expert Knowledge',
      description: 'Our team combines traditional techniques with modern innovation for exceptional results.'
    }
  ];

  const stats = [
    { number: '3+', label: 'Years of Excellence' },
    { number: '2,500+', label: 'Happy Customers' },
    { number: '200+', label: 'Unique Designs' },
    { number: '100%', label: 'Quality Assured' }
  ];

  const team = [
    {
      name: 'Ankita Thakur',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=300',
      description: 'Entrepreneur and jewelry enthusiast from Lalitpur, passionate about making beautiful jewelry accessible to every woman.'
    },
    {
      name: 'Priya Sharma',
      role: 'Head Designer',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
      description: 'Creative designer who brings contemporary aesthetics to traditional jewelry concepts.'
    },
    {
      name: 'Raj Kumar',
      role: 'Quality Specialist',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
      description: 'Ensures every piece meets our highest standards of quality and craftsmanship.'
    }
  ];

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
              About The Alankriti
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-amber-100">
              Founded by Ankita Thakur in Lalitpur - Where passion meets craftsmanship
            </p>
            <div className="flex items-center justify-center space-x-2 text-amber-200">
              <SparklesIcon className="h-6 w-6" />
              <span className="text-lg">Celebrating Individual Beauty</span>
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
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Ankita's Journey</h2>
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  The Alankriti was born from Ankita Thakur's passion for jewelry and her 
                  entrepreneurial spirit. Starting as a young dreamer with an eye for beautiful 
                  accessories, Ankita transformed her love for jewelry into a thriving business 
                  based in the heart of Balumari, Lalitpur.
                </p>
                <p>
                  "Jewelry isn't just an accessory—it's a form of self-expression, a way to celebrate 
                  life's special moments," says Ankita. Her vision was to make exquisite, affordable 
                  jewelry accessible to everyone, combining traditional craftsmanship with modern 
                  designs that resonate with today's fashion-conscious women.
                </p>
                <p>
                  What began as a small venture has grown into The Alankriti, where every piece 
                  reflects Ankita's commitment to quality, authenticity, and the belief that every 
                  woman deserves to feel beautiful and confident. From her base in Lalitpur, 
                  Ankita continues to curate collections that celebrate individuality and timeless elegance.
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
                <TrophyIcon className="h-8 w-8 mb-2" />
                <p className="font-bold">Award Winning</p>
                <p className="text-sm">Excellence in Craftsmanship</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Values</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              The principles that guide everything we do, from design to delivery
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center group"
              >
                <div className="bg-gradient-to-r from-amber-500 to-rose-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-rose-600 text-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Our Achievements</h2>
            <p className="text-xl opacity-90">
              Numbers that reflect our commitment to excellence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
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
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              The passionate artisans and designers behind every masterpiece
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
                  <p className="text-amber-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </div>
              </motion.div>
            ))}
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
                  <ClockIcon className="h-6 w-6 text-amber-500" />
                  <span className="text-gray-600">Timeless designs for modern life</span>
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
