import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowUpIcon,
  ArrowDownIcon,
  PhotoIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet-async';
import { adminAPI } from '../../services/api';
import { getApiUrl } from '../../utils/api';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

const AdminProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updating, setUpdating] = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'rings', label: 'Rings' },
    { value: 'necklaces', label: 'Necklaces' },
    { value: 'earrings', label: 'Earrings' },
    { value: 'bracelets', label: 'Bracelets' },
    { value: 'pendants', label: 'Pendants' },
    { value: 'sets', label: 'Sets' },
    { value: 'watches', label: 'Watches' },
    { value: 'chains', label: 'Chains' }
  ];

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: 'rings',
    subCategory: '',
    price: '',
    originalPrice: '',
    discount: 0,
    sku: '',
    weight: '',
    material: '',
    purity: '',
    stockQuantity: '',
    featured: false,
    tags: '',
    images: []
  });

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, categoryFilter, sortBy, sortOrder, productsPerPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: productsPerPage,
        search: searchTerm,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        sortBy: sortBy,
        sortOrder: sortOrder
      };
      
      const response = await adminAPI.getProducts(params);
      
      setProducts(response.data.products || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalProducts(response.data.pagination?.totalProducts || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Image handling functions
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imageFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreview[index]);
    
    setImageFiles(newFiles);
    setImagePreview(newPreviews);
  };

  const uploadImages = async (productId) => {
    if (imageFiles.length === 0) {
      return [];
    }
    
    try {
      setUploadingImages(true);
      const uploadedImages = [];
      
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('productId', productId);
        
        // Upload to a simple image storage endpoint
        const response = await fetch(getApiUrl('/api/admin/upload-image'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Cookies.get('token')}`
          },
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          uploadedImages.push(data.imageUrl);
        } else {
          const errorText = await response.text();
          console.error('Failed to upload image:', file.name, 'Status:', response.status, 'Error:', errorText);
        }
      }
      
      return uploadedImages;
    } catch (error) {
      console.error('Error uploading images:', error);
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  // Helper function to get image URL
  const getImageUrlForProduct = (product) => {
    if (!product.images || !product.images.length) {
      return null;
    }

    const firstImage = product.images[0];
    
    // Direct URL construction
    let imagePath = '';
    if (typeof firstImage === 'string') {
      imagePath = firstImage;
    } else if (firstImage && firstImage.url) {
      imagePath = firstImage.url;
    } else {
      return null;
    }
    
    // Ensure path starts with /uploads
    if (!imagePath.startsWith('/uploads')) {
      imagePath = `/uploads/${imagePath}`;
    }
    
    // Build complete URL with cache buster
    const fullUrl = `http://localhost:5000${imagePath}?cache=${Date.now()}`;
    return fullUrl;
  };

  const resetImageState = () => {
    // Revoke all preview URLs
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImagePreview([]);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate required fields
      if (!productForm.name || !productForm.description || !productForm.price || !productForm.stockQuantity) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Clean up specifications - only include fields that have values
      const specifications = {};
      if (productForm.material) specifications.metal = productForm.material;
      if (productForm.purity) specifications.purity = productForm.purity;
      if (productForm.weight) {
        specifications.weight = {
          value: parseFloat(productForm.weight),
          unit: 'grams'
        };
      }

      const productData = {
        name: productForm.name,
        description: productForm.description,
        shortDescription: productForm.shortDescription || '',
        category: productForm.category,
        subCategory: productForm.subCategory || '',
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
        discount: productForm.discount || 0,
        sku: productForm.sku || `PROD_${Date.now()}`,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        stock: {
          quantity: parseInt(productForm.stockQuantity) || 0
        },
        tags: productForm.tags ? productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        featured: productForm.featured || false,
        images: productForm.images || []
      };
      
      const response = await adminAPI.createProduct(productData);
      
      // Upload images if any
      if (imageFiles.length > 0) {
        const uploadedImageUrls = await uploadImages(response.data.product._id);
        
        if (uploadedImageUrls.length > 0) {
          // Convert URLs to proper image objects
          const imageObjects = uploadedImageUrls.map((url, index) => ({
            url: url,
            alt: `${productData.name} - Image ${index + 1}`,
            isPrimary: index === 0
          }));
          
          // Update product with image objects
          await adminAPI.updateProduct(response.data.product._id, {
            images: imageObjects
          });
        }
      }
      
      toast.success('Product added successfully');
      setShowAddModal(false);
      resetForm();
      resetImageState();
      fetchProducts();
    } catch (error) {
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add product';
      console.error('Final error message:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      console.log('=== ADD PRODUCT DEBUG END ===');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Clean up specifications - only include fields that have values
      const specifications = {};
      if (productForm.material) specifications.metal = productForm.material;
      if (productForm.purity) specifications.purity = productForm.purity;
      if (productForm.weight) {
        specifications.weight = {
          value: parseFloat(productForm.weight),
          unit: 'grams'
        };
      }

      const productData = {
        name: productForm.name,
        description: productForm.description,
        shortDescription: productForm.shortDescription || '',
        category: productForm.category,
        subCategory: productForm.subCategory || '',
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
        discount: productForm.discount || 0,
        sku: productForm.sku,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        stock: {
          quantity: parseInt(productForm.stockQuantity) || 0
        },
        tags: productForm.tags ? productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        featured: productForm.featured || false,
        images: productForm.images || []
      };
      
      await adminAPI.updateProduct(selectedProduct._id, productData);
      toast.success('Product updated successfully');
      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      setUpdating(prev => ({ ...prev, [productId]: true }));
      
      await adminAPI.deleteProduct(productId);
      
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete product';
      toast.error(`Failed to delete product: ${errorMessage}`);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleStockUpdate = async (productId, newStock) => {
    try {
      setUpdating(prev => ({ ...prev, [productId]: true }));
      await adminAPI.updateStock(productId, { stockQuantity: newStock });
      setProducts(prev => prev.map(product => 
        product._id === productId 
          ? { ...product, stockQuantity: newStock }
          : product
      ));
      toast.success('Stock updated successfully');
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      category: product.category || 'rings',
      subCategory: product.subCategory || '',
      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      discount: product.discount || 0,
      sku: product.sku || '',
      weight: product.specifications?.weight?.value?.toString() || product.weight?.toString() || '',
      material: product.specifications?.metal || product.material || '',
      purity: product.specifications?.purity || product.purity || '',
      stockQuantity: (product.stock?.quantity || product.stockQuantity || 0).toString(),
      featured: product.featured || false,
      tags: product.tags?.join(', ') || '',
      images: product.images || []
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      shortDescription: '',
      category: 'rings',
      subCategory: '',
      price: '',
      originalPrice: '',
      discount: 0,
      sku: '',
      weight: '',
      material: '',
      purity: '',
      stockQuantity: '',
      featured: false,
      tags: '',
      images: []
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Product Management - Admin Panel | TheAlankriti</title>
        <meta name="description" content="Manage jewelry products, inventory, and pricing for TheAlankriti" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                <p className="text-sm text-gray-600">Manage your jewelry inventory</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gold text-white px-4 py-2 rounded-lg hover:bg-gold-dark transition-colors flex items-center"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="stockQuantity">Sort by Stock</option>
                <option value="createdAt">Sort by Date</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
              >
                {sortOrder === 'asc' ? <ArrowUpIcon className="w-5 h-5" /> : <ArrowDownIcon className="w-5 h-5" />}
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </button>

              <select
                value={productsPerPage}
                onChange={(e) => {
                  setProductsPerPage(parseInt(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing page size
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              >
                <option value={6}>6 per page</option>
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={48}>48 per page</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {products.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  {(() => {
                    const imageUrl = getImageUrlForProduct(product);
                    return imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm rounded-t-lg">
                        <div className="text-center">
                          <div>📷</div>
                          <div className="text-xs mt-1">No Image</div>
                        </div>
                      </div>
                    );
                  })()}
                  {product.featured && (
                    <div className="absolute top-2 left-2 bg-gold text-white px-2 py-1 rounded text-xs font-medium">
                      Featured
                    </div>
                  )}
                  {product.discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      -{product.discount}%
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 truncate" title={product.name}>
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {product.shortDescription || product.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      (product.stock?.quantity || product.stockQuantity || 0) > 10 
                        ? 'bg-green-100 text-green-800'
                        : (product.stock?.quantity || product.stockQuantity || 0) > 0 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      Stock: {product.stock?.quantity || product.stockQuantity || 0}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="number"
                      min="0"
                      value={product.stock?.quantity || product.stockQuantity || 0}
                      onChange={(e) => handleStockUpdate(product._id, parseInt(e.target.value) || 0)}
                      disabled={updating[product._id]}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-gold focus:border-gold"
                      title="Update Stock"
                    />
                    <span className="text-xs text-gray-500">units</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Product"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id, product.name)}
                        disabled={updating[product._id]}
                        className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        title="Delete Product"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">
                      SKU: {product.sku}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  First
                </button>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page Numbers - Smart Display */}
                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                  
                  // Adjust start if we're near the end
                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }
                  
                  // Show first page and ellipsis if needed
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => setCurrentPage(1)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis1" className="px-2 py-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                  }
                  
                  // Show current range
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-4 py-2 border rounded-lg ${
                          currentPage === i
                            ? 'bg-gold text-white border-gold'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  
                  // Show last page and ellipsis if needed
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="ellipsis2" className="px-2 py-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  
                  return pages;
                })()}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowAddModal(false)}></div>
              <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
                <h2 className="text-xl font-bold mb-4">Add New Product</h2>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                      required
                    />
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                      required
                    >
                      {categories.slice(1).map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <textarea
                    placeholder="Product Description"
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                    rows={3}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="number"
                      placeholder="Price"
                      value={productForm.price}
                      onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                      required
                      min="0"
                      step="0.01"
                    />
                    <input
                      type="number"
                      placeholder="Original Price (optional)"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                      min="0"
                      step="0.01"
                    />
                    <input
                      type="number"
                      placeholder="Stock Quantity"
                      value={productForm.stockQuantity}
                      onChange={(e) => setProductForm(prev => ({ ...prev, stockQuantity: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                      required
                      min="0"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="SKU (optional)"
                      value={productForm.sku}
                      onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                    />
                    <input
                      type="text"
                      placeholder="Material (e.g., Gold, Silver)"
                      value={productForm.material}
                      onChange={(e) => setProductForm(prev => ({ ...prev, material: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                    />
                    <input
                      type="text"
                      placeholder="Purity (e.g., 22K, 925)"
                      value={productForm.purity}
                      onChange={(e) => setProductForm(prev => ({ ...prev, purity: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Weight (grams)"
                      value={productForm.weight}
                      onChange={(e) => setProductForm(prev => ({ ...prev, weight: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                      min="0"
                      step="0.01"
                    />
                    <input
                      type="text"
                      placeholder="Tags (comma separated)"
                      value={productForm.tags}
                      onChange={(e) => setProductForm(prev => ({ ...prev, tags: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Product Images (Max 5)
                    </label>
                    
                    {/* Image Upload Input */}
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <PhotoIcon className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB each)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </label>
                    </div>

                    {/* Image Previews */}
                    {imagePreview.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {imagePreview.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {uploadingImages && (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold"></div>
                        <span className="text-sm text-gray-600">Uploading images...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={productForm.featured}
                      onChange={(e) => setProductForm(prev => ({ ...prev, featured: e.target.checked }))}
                      className="h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                      Featured Product
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gold text-white px-6 py-2 rounded-lg hover:bg-gold-dark disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && selectedProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowEditModal(false)}></div>
              <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
                <h2 className="text-xl font-bold mb-4">Edit Product</h2>
                <form onSubmit={handleEditProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                      required
                    />
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                      required
                    >
                      {categories.slice(1).map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <textarea
                    placeholder="Product Description"
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                    rows={3}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="number"
                      placeholder="Price"
                      value={productForm.price}
                      onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Original Price (optional)"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                    />
                    <input
                      type="number"
                      placeholder="Stock Quantity"
                      value={productForm.stockQuantity}
                      onChange={(e) => setProductForm(prev => ({ ...prev, stockQuantity: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gold text-white px-6 py-2 rounded-lg hover:bg-gold-dark disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminProductManager;
