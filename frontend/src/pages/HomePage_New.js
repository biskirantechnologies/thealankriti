import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon,
  CheckIcon,
  ShieldCheckIcon,
  TruckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';
import SafeImage from '../components/SafeImage';
import api from '../services/api';

const Homepage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  const heroSlides = [
    {
      id: 1,
      title: "Timeless Elegance",
      subtitle: "Handcrafted Perfection",
      description: "Discover jewelry that tells your story",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      cta: "Explore Collection",
      link: "/collections"
    },
    {
      id: 2,
      title: "Diamond Dreams",
      subtitle: "Unmatched Brilliance", 
      description: "Where luxury meets artistry",
      image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      cta: "Shop Diamonds",
      link: "/products?category=diamond"
    },
    {
      id: 3,
      title: "Modern Minimalism",
      subtitle: "Sophisticated Simplicity",
      description: "Clean lines, stunning impact",
      image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      cta: "Discover More",
      link: "/products"
    }
  ];

  const features = [
    {
      icon: ShieldCheckIcon,
      title: "Certified Quality",
      description: "Every piece is certified and authenticated"
    },
    {
      icon: TruckIcon,
      title: "Free Shipping",
      description: "Complimentary shipping on all orders"
    },
    {
      icon: SparklesIcon,
      title: "Lifetime Warranty",
      description: "Comprehensive coverage for peace of mind"
    }
  ];

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/products?featured=true&limit=4');
        setFeaturedProducts(response.data.products || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        // Mock data for development
        setFeaturedProducts([
          {
            _id: '1',
            name: 'Diamond Eternity Ring',
            price: 45000,
            images: [{ url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400' }],
            category: 'rings'
          },
          {
            _id: '2', 
            name: 'Gold Pearl Necklace',
            price: 28000,
            images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400' }],
            category: 'necklaces'
          },
          {
            _id: '3',
            name: 'Silver Bracelet Set',
            price: 12000,
            images: [{ url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400' }],
            category: 'bracelets'
          },
          {
            _id: '4',
            name: 'Emerald Earrings',
            price: 35000,
            images: [{ url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400' }],
            category: 'earrings'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = (product) => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: getImageUrl(product),
      quantity: 1
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Minimalist Split Design */}
      <section className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative h-full flex">
              {/* Left Content */}
              <div className="w-1/2 flex items-center justify-center bg-gray-50">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="max-w-md px-8"
                >
                  <div className="mb-4">
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-500 font-medium">
                      {slide.subtitle}
                    </span>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    {slide.description}
                  </p>
                  
                  <Link
                    to={slide.link}
                    className="group inline-flex items-center border-b border-black pb-1 hover:border-gray-500 transition-colors"
                  >
                    <span className="text-sm uppercase tracking-[0.1em] font-medium mr-3">
                      {slide.cta}
                    </span>
                    <ArrowRightIcon className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
              
              {/* Right Image */}
              <div className="w-1/2 relative">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        ))}
        
        {/* Minimalist Slide Indicators */}
        <div className="absolute bottom-12 left-8 flex flex-col space-y-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-0.5 h-8 transition-colors ${
                index === currentSlide ? 'bg-black' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section - Clean & Minimal */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="mb-6">
                    <IconComponent className="h-8 w-8 mx-auto text-gray-900" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products - Minimal Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500 font-medium mb-4 block">
              Curated Selection
            </span>
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900">
              Featured Pieces
            </h2>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 animate-pulse">
                  <div className="bg-gray-200 aspect-square mb-4"></div>
                  <div className="bg-gray-200 h-4 mb-2"></div>
                  <div className="bg-gray-200 h-4 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group bg-white hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative overflow-hidden">
                    <SafeImage
                      product={product}
                      alt={product.name}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {formatPrice(product.price)}
                    </p>
                    
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full text-center text-sm uppercase tracking-[0.1em] border border-gray-900 py-3 hover:bg-gray-900 hover:text-white transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center border-b border-black pb-1 hover:border-gray-500 transition-colors"
            >
              <span className="text-sm uppercase tracking-[0.1em] font-medium mr-3">
                View All Products
              </span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action - Minimal */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-light mb-6">
              Craft Your Story
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Discover jewelry that reflects your unique style and celebrates your precious moments.
            </p>
            <Link
              to="/collections"
              className="inline-flex items-center bg-white text-gray-900 px-8 py-4 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm uppercase tracking-[0.1em] font-medium mr-3">
                Explore Collections
              </span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
