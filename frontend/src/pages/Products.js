import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  FunnelIcon, 
  XMarkIcon,
  StarIcon,
  AdjustmentsHorizontalIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext';
import SafeImage from '../components/SafeImage';
import { getImageUrl } from '../utils/urlHelper';
import api from '../services/api';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { addItem } = useCart();

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    subCategory: searchParams.get('subCategory') || '',
    material: '',
    priceRange: '',
    sortBy: 'newest',
    search: searchParams.get('search') || ''
  });

  const categories = [
    { value: 'rings', label: 'Rings' },
    { value: 'earrings', label: 'Earrings' },
    { value: 'necklaces', label: 'Necklaces' },
    { value: 'chains', label: 'Chains' },
    { value: 'pendants', label: 'Pendants' },
    { value: 'bracelets', label: 'Bracelets' },
    { value: 'anklet', label: 'Anklet' },
    { value: 'armcuff', label: 'ArmCuff' },
    { value: 'waist-chain', label: 'Waist Chain' },
    { value: 'hair-accessories', label: 'Hair accessories' },
    { value: 'other-1', label: 'Other Type 1' },
    { value: 'other-2', label: 'Other Type 2' }
  ];

  const types = [
    { value: 'traditional', label: 'Traditional' },
    { value: 'minimalistic', label: 'Minimalistic' },
    { value: 'office-wear', label: 'Office Wear' },
    { value: 'chunky', label: 'Chunky' },
    { value: 'daily-wear', label: 'Daily wear' },
    { value: 'style-1', label: 'Style Type 1' },
    { value: 'style-2', label: 'Style Type 2' }
  ];

  const materials = [
    { value: 'steel', label: 'Steel' },
    { value: 'brass', label: 'Brass' },
    { value: 'german-silver', label: 'German Silver' },
    { value: 'oxidised', label: 'Oxidised' },
    { value: 'pearls', label: 'Pearls' },
    { value: 'material-1', label: 'Material Type 1' },
    { value: 'material-2', label: 'Material Type 2' }
  ];

  const priceRanges = [
    { value: '0-200', label: 'Under 200' },
    { value: '200-500', label: '200-500' },
    { value: '500-1000', label: '500-1000' },
    { value: '1000-5000', label: '1000-5000' },
    { value: '5000+', label: '>5000' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      if (filters.category) params.append('category', filters.category);
      if (filters.subCategory) params.append('subCategory', filters.subCategory);
      if (filters.material) params.append('material', filters.material);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      // Handle price range
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-');
        if (min) params.append('minPrice', min);
        if (max && max !== '+') params.append('maxPrice', max);
      }
      
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products || []);
      setTotalProducts(response.data.totalProducts || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      subCategory: '',
      material: '',
      priceRange: '',
      sortBy: 'newest',
      search: ''
    });
    setSearchParams({});
    setCurrentPage(1);
  };

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

  const totalPages = Math.ceil(totalProducts / 12);

  return (
    <>
      <Helmet>
        <title>{`${filters.search ? `Search: ${filters.search}` : 'Products'} - The Alankriti`}</title>
        <meta name="description" content={`Browse our collection of ${totalProducts} exquisite jewelry pieces. Find rings, necklaces, earrings, and more.`} />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {filters.search ? `Search Results for "${filters.search}"` : 'Our Products'}
          </h1>
          <p className="text-gray-600">
            {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-amber-600 hover:text-amber-700"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-medium mb-3">Category</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category.value} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category.value}
                          checked={filters.category === category.value}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          className="mr-2 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm">{category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Style Filter */}
                <div>
                  <h3 className="font-medium mb-3">Style</h3>
                  <div className="space-y-2">
                    {types.map(type => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="radio"
                          name="subCategory"
                          value={type.value}
                          checked={filters.subCategory === type.value}
                          onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                          className="mr-2 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Material Filter */}
                <div>
                  <h3 className="font-medium mb-3">Material</h3>
                  <div className="space-y-2">
                    {materials.map(material => (
                      <label key={material.value} className="flex items-center">
                        <input
                          type="radio"
                          name="material"
                          value={material.value}
                          checked={filters.material === material.value}
                          onChange={(e) => handleFilterChange('material', e.target.value)}
                          className="mr-2 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm">{material.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="space-y-2">
                    {priceRanges.map(range => (
                      <label key={range.value} className="flex items-center">
                        <input
                          type="radio"
                          name="priceRange"
                          value={range.value}
                          checked={filters.priceRange === range.value}
                          onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                          className="mr-2 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle & Sort */}
            <div className="flex items-center justify-between mb-6 lg:justify-end">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </button>

              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                    <div className="h-64 bg-gray-300 rounded-t-lg"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <AdjustmentsHorizontalIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <div key={product._id} className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <Link to={`/products/${product._id}`}>
                          <SafeImage
                            product={product}
                            alt={product.name}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>
                        <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                          <HeartIcon className="h-5 w-5 text-gray-600" />
                        </button>
                        {product.isOnSale && (
                          <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                            Sale
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <Link to={`/products/${product._id}`}>
                          <h3 className="font-semibold text-gray-900 mb-2 hover:text-amber-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center mb-2">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.rating || 4.5) ? 'fill-current' : ''
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-1">
                            ({product.reviews?.length || 0})
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                          >
                            Add to Cart
                          </button>
                        </div>

                        {/* Product Specifications */}
                        <div className="mt-3 text-xs text-gray-500">
                          {product.specifications?.material && (
                            <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                              {product.specifications.material}
                            </span>
                          )}
                          {product.specifications?.purity && (
                            <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                              {product.specifications.purity}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 border rounded-lg ${
                              currentPage === page
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-amber-600 hover:text-amber-700"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-1"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Same filter content as desktop */}
              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-medium mb-3">Category</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category.value} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category.value}
                          checked={filters.category === category.value}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          className="mr-2 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm">{category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Style Filter */}
                <div>
                  <h3 className="font-medium mb-3">Style</h3>
                  <div className="space-y-2">
                    {types.map(type => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="radio"
                          name="subCategory"
                          value={type.value}
                          checked={filters.subCategory === type.value}
                          onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                          className="mr-2 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Material Filter */}
                <div>
                  <h3 className="font-medium mb-3">Material</h3>
                  <div className="space-y-2">
                    {materials.map(material => (
                      <label key={material.value} className="flex items-center">
                        <input
                          type="radio"
                          name="material"
                          value={material.value}
                          checked={filters.material === material.value}
                          onChange={(e) => handleFilterChange('material', e.target.value)}
                          className="mr-2 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm">{material.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="space-y-2">
                    {priceRanges.map(range => (
                      <label key={range.value} className="flex items-center">
                        <input
                          type="radio"
                          name="priceRange"
                          value={range.value}
                          checked={filters.priceRange === range.value}
                          onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                          className="mr-2 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Products;
