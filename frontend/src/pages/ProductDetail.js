import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  ShareIcon, 
  StarIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useUserTracking, useComponentTracking } from '../hooks/useUserTracking';
import toast from 'react-hot-toast';

// Helper function to get proper image URL
const getImageUrl = (image) => {
  if (!image) {
    return 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop';
  }

  // If it's a string (file path)
  if (typeof image === 'string') {
    return image.startsWith('http') 
      ? image 
      : `http://localhost:3001${image}`;
  }
  
  // If it's an object with url property
  if (typeof image === 'object' && image.url) {
    return image.url.startsWith('http') 
      ? image.url 
      : `http://localhost:3001${image.url}`;
  }
  
  // Fallback to placeholder
  return 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop';
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  // User tracking hooks
  const { 
    trackProductView, 
    trackCartAction, 
    trackWishlistAction,
    trackPageView,
    trackAction
  } = useUserTracking();
  const { trackComponentAction } = useComponentTracking('ProductDetail');
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // Mock product data - in real app, this would come from API
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockProduct = {
          id: id,
          name: 'Elegant Diamond Necklace',
          price: 45999,
          originalPrice: 52999,
          discount: 13,
          rating: 4.8,
          reviewsCount: 324,
          sku: 'UJ-DN-001',
          category: 'Necklaces',
          subcategory: 'Diamond Necklaces',
          material: 'White Gold',
          purity: '18K',
          weight: '15.2g',
          gemstone: 'Diamond',
          certification: 'GIA Certified',
          inStock: true,
          stockCount: 5,
          images: [
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
            'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800',
            'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800',
            'https://images.unsplash.com/photo-1596944924591-1aa7b83b7b3d?w=800'
          ],
          sizes: ['16 inches', '18 inches', '20 inches'],
          features: [
            'Handcrafted by expert artisans',
            'Premium diamond quality (VS1-VS2)',
            'Lifetime warranty on gold',
            'Free resizing within 30 days',
            'BIS Hallmark certified'
          ],
          description: 'This exquisite diamond necklace features carefully selected diamonds set in premium 18K white gold. Each piece is handcrafted by our master artisans with attention to every detail. The elegant design makes it perfect for special occasions and can be treasured for generations.',
          specifications: {
            'Material Type': '18K White Gold',
            'Total Weight': '15.2 grams',
            'Diamond Count': '47 pieces',
            'Diamond Weight': '2.5 carats',
            'Diamond Color': 'F-G',
            'Diamond Clarity': 'VS1-VS2',
            'Setting Type': 'Prong Setting',
            'Chain Length': 'Adjustable 16-20 inches'
          },
          care: [
            'Store in a soft jewelry box to prevent scratches',
            'Clean with mild soap and water using a soft brush',
            'Avoid contact with perfumes and chemicals',
            'Remove before swimming or exercising',
            'Professional cleaning recommended every 6 months'
          ]
        };
        setProduct(mockProduct);
        setSelectedSize(mockProduct.sizes[0]);
        setLoading(false);
        
        // Track product view
        trackProductView(id, {
          productName: mockProduct.name,
          price: mockProduct.price,
          category: 'necklace',
          sku: mockProduct.sku
        });
        
        // Track page view
        trackPageView(`product-detail-${id}`, {
          productId: id,
          productName: mockProduct.name,
          price: mockProduct.price
        });
      }, 1000);
    };

    fetchProduct();
  }, [id, trackProductView, trackPageView]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: getImageUrl(product.images?.[0]),
      size: selectedSize,
      quantity: quantity
    };

    addToCart(cartItem);

    // Track cart action
    trackCartAction('add', {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      size: selectedSize
    });

    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    
    // Track buy now action
    trackAction('BUY_NOW', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: quantity,
      size: selectedSize
    });
    
    navigate('/checkout');
  };

  const toggleWishlist = () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    const newWishlistState = !isWishlisted;
    setIsWishlisted(newWishlistState);
    
    // Track wishlist action
    trackWishlistAction(newWishlistState ? 'add' : 'remove', product.id);
    
    toast.success(newWishlistState ? 'Added to wishlist!' : 'Removed from wishlist!');
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this beautiful jewelry piece from The Alankriti`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
            {/* Image skeleton */}
            <div className="flex flex-col-reverse">
              <div className="hidden mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
                <div className="grid grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse" />
            </div>

            {/* Product info skeleton */}
            <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2 mb-4" />
              <div className="h-12 bg-gray-200 rounded animate-pulse mb-8" />
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          <p className="mt-2 text-gray-600">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${product?.name || 'Product'} - The Alankriti`}</title>
        <meta name="description" content={product?.shortDescription || product?.description || 'Beautiful jewelry piece from The Alankriti'} />
        <meta property="og:title" content={`${product?.name || 'Product'} - The Alankriti`} />
        <meta property="og:description" content={product?.shortDescription || product?.description} />
        <meta property="og:image" content={getImageUrl(product?.images?.[0])} />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div className="flex items-center">
                  <button
                    onClick={() => navigate('/')}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    Home
                  </button>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                  <button
                    onClick={() => navigate('/products')}
                    className="ml-4 text-gray-400 hover:text-gray-500"
                  >
                    Products
                  </button>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                  <span className="ml-4 text-gray-500">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
            {/* Image gallery */}
            <div className="flex flex-col-reverse">
              {/* Image selector */}
              <div className="hidden mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
                <div className="grid grid-cols-4 gap-6">
                  {product.images && product.images.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-24 bg-white rounded-lg overflow-hidden cursor-pointer ${
                        index === selectedImage ? 'ring-2 ring-primary-500' : 'ring-1 ring-gray-300'
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Main image */}
              <div className="w-full aspect-square relative">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-full bg-white rounded-lg overflow-hidden group"
                >
                  <img
                    src={getImageUrl(product.images?.[selectedImage])}
                    alt={product.name}
                    className="w-full h-full object-cover object-center cursor-zoom-in"
                    onClick={() => setShowImageZoom(true)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                    <MagnifyingGlassPlusIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  {/* Discount badge */}
                  {product.discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      -{product.discount}%
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Product info */}
            <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    {product.name}
                  </h1>
                  <p className="text-sm text-gray-500 mt-2">SKU: {product.sku}</p>
                </div>
                
                <div className="flex space-x-3 ml-4">
                  <button
                    onClick={toggleWishlist}
                    className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    {isWishlisted ? (
                      <HeartSolidIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={shareProduct}
                    className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    <ShareIcon className="h-6 w-6 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="mt-4 flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarSolidIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="ml-3 text-sm text-gray-900">
                  {product.rating} ({product.reviewsCount} reviews)
                </p>
              </div>

              {/* Price */}
              <div className="mt-6">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-gray-900">
                    NPR {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      NPR {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-green-600 mt-1">
                  You save NPR {(product.originalPrice - product.price).toLocaleString()}
                </p>
              </div>

              {/* Stock status */}
              <div className="mt-4">
                {product.inStock ? (
                  <p className="text-green-600 text-sm flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    In stock ({product.stockCount} left)
                  </p>
                ) : (
                  <p className="text-red-600 text-sm flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Out of stock
                  </p>
                )}
              </div>

              {/* Size selector */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">Size</h3>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-4 border rounded-md text-sm font-medium ${
                        selectedSize === size
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity selector */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">Quantity</h3>
                <div className="mt-4 flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border border-gray-300 rounded-md bg-gray-50 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-8 space-y-4">
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="w-full bg-primary-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full bg-white border border-primary-600 rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
              </div>

              {/* Trust badges */}
              <div className="mt-8 grid grid-cols-3 gap-4 py-6 border-t border-gray-200">
                <div className="flex flex-col items-center text-center">
                  <ShieldCheckIcon className="h-8 w-8 text-green-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Certified Quality</span>
                  <span className="text-xs text-gray-500">BIS Hallmark</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <TruckIcon className="h-8 w-8 text-blue-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Free Shipping</span>
                  <span className="text-xs text-gray-500">On orders above NPR 25,000</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <ArrowsRightLeftIcon className="h-8 w-8 text-purple-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Easy Returns</span>
                  <span className="text-xs text-gray-500">30-day policy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product details tabs */}
          <div className="mt-16">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['description', 'specifications', 'care'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'description' && (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed">{product.description}</p>
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                        <ul className="space-y-2">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'specifications' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-3 border-b border-gray-200">
                          <span className="font-medium text-gray-900">{key}:</span>
                          <span className="text-gray-700">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'care' && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Care Instructions:</h4>
                      <ul className="space-y-3">
                        {product.care.map((instruction, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-gray-700">{instruction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Image zoom modal */}
      <AnimatePresence>
        {showImageZoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageZoom(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImageZoom(false)}
                className="absolute top-4 right-4 text-white text-2xl z-10 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
              >
                ×
              </button>
              <img
                src={getImageUrl(product.images?.[selectedImage])}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {product.images && product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-3 h-3 rounded-full ${
                      index === selectedImage ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductDetail;
