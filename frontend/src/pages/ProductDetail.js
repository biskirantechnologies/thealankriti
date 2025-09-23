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
import { useUserTracking } from '../hooks/useUserTracking';
import { getImageUrl, getImageWithFallback } from '../utils/api';
import { productsAPI, userAPI } from '../services/api';
import SafeImage from '../components/SafeImage';
import toast from 'react-hot-toast';

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
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // Fetch product data from backend
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        // Fetch product data from backend
        const response = await productsAPI.getProduct(id);
        const productData = response.data;
        
        if (!productData) {
          setProduct(null);
          return;
        }

        // Transform backend data to frontend format
        // Build specifications object dynamically - only include fields with data
        const specs = {};
        
        // Add specifications only if they have meaningful values
        if (productData.specifications?.metal) {
          specs['Metal Type'] = productData.specifications.metal.charAt(0).toUpperCase() + 
                               productData.specifications.metal.slice(1).replace('-', ' ');
        }
        
        if (productData.specifications?.purity) {
          specs['Purity'] = productData.specifications.purity.toUpperCase();
        }
        
        if (productData.specifications?.weight?.value) {
          specs['Weight'] = `${productData.specifications.weight.value} ${productData.specifications.weight.unit || 'grams'}`;
        }
        
        if (productData.specifications?.gemstone && productData.specifications.gemstone !== 'none') {
          specs['Gemstone'] = productData.specifications.gemstone.charAt(0).toUpperCase() + 
                             productData.specifications.gemstone.slice(1);
        }
        
        // Always show these essential fields
        specs['Category'] = productData.category.charAt(0).toUpperCase() + productData.category.slice(1);
        specs['SKU'] = productData.sku;
        
        // Show stock status with better formatting
        const stockStatus = productData.stock?.status || 'unknown';
        specs['Stock Status'] = stockStatus.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');

        const transformedProduct = {
          id: productData._id,
          name: productData.name,
          price: productData.price,
          originalPrice: productData.originalPrice || null,
          description: productData.description,
          shortDescription: productData.shortDescription || '',
          specifications: specs,
          images: productData.images || [],
          sizes: productData.variants?.map(variant => variant.value) || [],
          // Stock information from backend
          inStock: productData.stock?.status === 'in-stock' || productData.stock?.status === 'low-stock',
          stockCount: productData.stock?.quantity || 0,
          stockStatus: productData.stock?.status || 'out-of-stock',
          lowStockThreshold: productData.stock?.lowStockThreshold || 5,
          features: [
            'Handcrafted with precision and care',
            'Premium quality materials',
            'Elegant and timeless design',
            'Perfect for special occasions',
            'Comes with authenticity certificate'
          ], // Default features
          care: [
            'Store in a soft jewelry box to prevent scratches',
            'Clean with mild soap and water using a soft brush',
            'Avoid contact with perfumes and chemicals',
            'Remove before swimming or exercising',
            'Professional cleaning recommended every 6 months'
          ] // Default care instructions
        };
        
        setProduct(transformedProduct);
        
        // Set default selected size
        if (transformedProduct.sizes?.length > 0) {
          setSelectedSize(transformedProduct.sizes[0]);
        }
        
        // Track product view
        trackProductView(id, {
          productName: transformedProduct.name,
          price: transformedProduct.price,
          category: transformedProduct.category,
          sku: transformedProduct.sku
        });
        
        // Track page view
        trackPageView(`product-detail-${id}`, {
          productId: id,
          productName: transformedProduct.name,
          price: transformedProduct.price
        });
        
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
        toast.error('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, trackProductView, trackPageView]);

  const handleAddToCart = () => {
    // Only require size selection if there are multiple sizes
    if (product.sizes && product.sizes.length > 1 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    // Pass the full product object with variant information
    const variant = selectedSize && selectedSize !== 'One Size' ? { size: selectedSize } : null;

    addToCart(product, quantity, variant);

    // Track cart action
    trackCartAction('add', {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      size: selectedSize || 'One Size'
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
      size: selectedSize || 'One Size'
    });
    
    navigate('/checkout');
  };

  // Check if product is in wishlist on load
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user && product) {
        try {
          const response = await userAPI.getWishlist();
          const wishlistItems = response.data || [];
          const isInWishlist = wishlistItems.some(item => item.product?._id === product.id || item.product === product.id);
          setIsWishlisted(isInWishlist);
        } catch (error) {
          console.error('Error checking wishlist status:', error);
          // Don't show error toast for wishlist check failures
        }
      }
    };

    if (user && product) {
      checkWishlistStatus();
    }
  }, [user, product]);

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    if (!product) return;

    try {
      const newWishlistState = !isWishlisted;
      
      if (newWishlistState) {
        await userAPI.addToWishlist(product.id);
        toast.success('Added to wishlist!');
      } else {
        await userAPI.removeFromWishlist(product.id);
        toast.success('Removed from wishlist!');
      }
      
      setIsWishlisted(newWishlistState);
      
      // Track wishlist action
      trackWishlistAction(newWishlistState ? 'add' : 'remove', product.id);
      
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist. Please try again.');
    }
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this beautiful jewelry piece from TheAlankriti`,
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
        <title>{`${product?.name || 'Product'} - TheAlankriti`}</title>
        <meta name="description" content={product?.shortDescription || product?.description || 'Beautiful jewelry piece from TheAlankriti'} />
        <meta property="og:title" content={`${product?.name || 'Product'} - TheAlankriti`} />
        <meta property="og:description" content={product?.shortDescription || product?.description} />
        <meta property="og:image" content={getImageUrl(product?.images?.[0]) || getImageWithFallback(null, product?.name)} />
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
                  {product.images && product.images.length > 0 && product.images.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-24 bg-white rounded-lg overflow-hidden cursor-pointer ${
                        index === selectedImage ? 'ring-2 ring-primary-500' : 'ring-1 ring-gray-300'
                      }`}
                    >
                      <SafeImage
                        src={getImageUrl(image?.url)}
                        alt={image?.alt || `${product.name} ${index + 1}`}
                        className="w-full h-full object-cover object-center"
                        fallbackType="jewelry"
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
                  <SafeImage
                    src={getImageUrl(product.images?.[selectedImage]?.url)}
                    alt={product.images?.[selectedImage]?.alt || product.name}
                    className="w-full h-full object-cover object-center cursor-zoom-in"
                    onClick={() => setShowImageZoom(true)}
                    fallbackType="jewelry"
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
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xl text-gray-500 line-through">
                      NPR {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-sm text-green-600 mt-1">
                    You save NPR {(product.originalPrice - product.price).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Stock status */}
              <div className="mt-4">
                {product.stockStatus === 'in-stock' ? (
                  <p className="text-green-600 text-sm flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    In stock ({product.stockCount} available)
                  </p>
                ) : product.stockStatus === 'low-stock' ? (
                  <p className="text-yellow-600 text-sm flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Low stock - Only {product.stockCount} left!
                  </p>
                ) : (
                  <p className="text-red-600 text-sm flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Out of stock
                  </p>
                )}
              </div>

              {/* Size selector - only show if there are multiple sizes */}
              {product.sizes && product.sizes.length > 1 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">Size</h3>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {(product.sizes || []).map((size) => (
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
              )}

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
                  disabled={product.stockStatus === 'out-of-stock'}
                  className="w-full bg-primary-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.stockStatus === 'out-of-stock' ? 'Out of Stock' : 'Buy Now'}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stockStatus === 'out-of-stock'}
                  className="w-full bg-white border border-primary-600 rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.stockStatus === 'out-of-stock' ? 'Out of Stock' : 'Add to Cart'}
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
                          {(product.features || []).map((feature, index) => (
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
                      {Object.keys(product.specifications).length > 0 ? (
                        Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-3 border-b border-gray-200">
                            <span className="font-medium text-gray-900">{key}:</span>
                            <span className="text-gray-700">{value}</span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8">
                          <div className="text-gray-400 mb-2">
                            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-gray-500">No detailed specifications available for this product.</p>
                          <p className="text-sm text-gray-400 mt-1">Please contact us for more information.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'care' && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Care Instructions:</h4>
                      <ul className="space-y-3">
                        {(product.care || []).map((instruction, index) => (
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
              <SafeImage
                src={getImageUrl(product.images?.[selectedImage]?.url)}
                alt={product.images?.[selectedImage]?.alt || product.name}
                className="max-w-full max-h-full object-contain"
                fallbackType="jewelry"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {product.images && product.images.length > 0 && product.images.map((_, index) => (
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
