import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRightIcon, SparklesIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Collections = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products');
        const productData = response.data.products || [];
        setProducts(productData);
        
        // Generate collections based on real product data
        const categoryStats = productData.reduce((acc, product) => {
          const category = product.category || 'other';
          if (!acc[category]) {
            acc[category] = {
              count: 0,
              minPrice: Infinity,
              maxPrice: 0,
              products: []
            };
          }
          acc[category].count++;
          acc[category].minPrice = Math.min(acc[category].minPrice, product.price || 0);
          acc[category].maxPrice = Math.max(acc[category].maxPrice, product.price || 0);
          acc[category].products.push(product);
          return acc;
        }, {});

        // Create collections array from real data
        const dynamicCollections = Object.entries(categoryStats).map(([category, stats]) => ({
          id: category,
          name: category.charAt(0).toUpperCase() + category.slice(1) + ' Collection',
          description: `Beautiful ${category} pieces crafted with precision`,
          image: stats.products[0]?.images?.[0] 
            ? (typeof stats.products[0].images[0] === 'string' 
                ? `http://localhost:3001${stats.products[0].images[0]}`
                : stats.products[0].images[0].url || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500')
            : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500',
          category: category,
          itemCount: stats.count,
          priceRange: `NPR ${stats.minPrice.toLocaleString()} - NPR ${stats.maxPrice.toLocaleString()}`,
          featured: stats.count > 2 // Featured if more than 2 products
        }));

        setCollections(dynamicCollections);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to static data if API fails
        setCollections([
          {
            id: 1,
            name: 'Bridal Collection',
            description: 'Exquisite pieces for your special day',
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500',
            category: 'bridal',
            itemCount: 45,
            priceRange: 'NPR 15,000 - NPR 2,50,000',
            featured: true
          },
          {
            id: 2,
            name: 'Diamond Elegance',
            description: 'Timeless diamond jewelry that sparkles',
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
            category: 'diamond',
            itemCount: 32,
            priceRange: 'NPR 25,000 - NPR 5,00,000',
            featured: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    { id: 'all', name: 'All Collections', icon: SparklesIcon },
    { id: 'bridal', name: 'Bridal', icon: HeartIcon },
    { id: 'diamond', name: 'Diamond', icon: StarIcon },
    { id: 'gold', name: 'Gold', icon: SparklesIcon },
    { id: 'silver', name: 'Silver', icon: SparklesIcon },
    { id: 'pearl', name: 'Pearl', icon: SparklesIcon },
    { id: 'gemstone', name: 'Gemstone', icon: SparklesIcon },
    { id: 'temple', name: 'Temple', icon: SparklesIcon },
    { id: 'modern', name: 'Modern', icon: SparklesIcon }
  ];

  const filteredCollections = selectedCategory === 'all' 
    ? collections 
    : collections.filter(collection => collection.category === selectedCategory);

  const featuredCollections = collections.filter(collection => collection.featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Minimalist */}
      <section className="relative py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500 font-medium mb-6 block">
              Curated Collections
            </span>
            <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-8 leading-tight">
              Jewelry Collections
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover our carefully curated collections, each piece telling its own unique story of craftsmanship and elegance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500 font-medium mb-4 block">
              Featured
            </span>
            <h2 className="text-3xl font-light text-gray-900">
              Signature Collections
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 mb-20">
            {featuredCollections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative overflow-hidden mb-6">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{collection.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{collection.description}</p>
                  <div className="text-xs text-gray-500 mb-4">
                    {collection.itemCount} pieces • {collection.priceRange}
                  </div>
                  
                  <Link
                    to={`/products?collection=${collection.category}`}
                    className="inline-flex items-center border-b border-gray-900 pb-1 hover:border-gray-500 transition-colors"
                  >
                    <span className="text-sm uppercase tracking-[0.1em] font-medium mr-2">
                      Explore
                    </span>
                    <ChevronRightIcon className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter */}
            {/* Category Filter Section */}
      <section className="py-16 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500 font-medium mb-4 block">
              Browse by
            </span>
            <h2 className="text-3xl font-light text-gray-900">
              Categories
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/products?category=${category.name.toLowerCase()}`}>
                  <div className="relative overflow-hidden mb-4">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-[0.1em]">
                      {category.count} pieces
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
            {/* Call to Action */}
      <section className="py-20 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              Discover Your Perfect Piece
            </h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-2xl mx-auto">
              Let our experts help you find jewelry that tells your unique story
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white text-sm uppercase tracking-[0.1em] font-medium hover:bg-gray-800 transition-colors"
              >
                Browse All Products
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-900 text-gray-900 text-sm uppercase tracking-[0.1em] font-medium hover:bg-gray-900 hover:text-white transition-colors"
              >
                Contact Expert
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Collections;
