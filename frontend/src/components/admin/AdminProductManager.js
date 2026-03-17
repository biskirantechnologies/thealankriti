import React, { useState, useEffect, useCallback } from 'react';
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
import { getApiUrl, getImageUrl } from '../../utils/api';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

const normalizeImageEntry = (image, fallbackName = 'Product', index = 0) => {
  const rawPath = typeof image === 'string'
    ? image
    : image?.url || image?.path || image?.image || image?.src || '';

  if (typeof rawPath !== 'string') {
    return null;
  }

  const cleanedPath = rawPath.trim();
  if (!cleanedPath) {
    return null;
  }

  // Do not store local preview/data URLs in DB
  if (cleanedPath.startsWith('blob:') || cleanedPath.startsWith('data:')) {
    return null;
  }

  const validPath =
    cleanedPath.startsWith('http://') ||
    cleanedPath.startsWith('https://') ||
    cleanedPath.startsWith('/uploads/') ||
    cleanedPath.startsWith('uploads/');

  if (!validPath) {
    return null;
  }

  return {
    url: cleanedPath,
    alt: image?.alt || `${fallbackName} - Image ${index + 1}`,
    isPrimary: Boolean(image?.isPrimary) || index === 0
  };
};

const normalizeVideoEntry = (video, fallbackName = 'Product', index = 0) => {
  const rawPath = typeof video === 'string'
    ? video
    : video?.url || video?.path || video?.video || video?.src || '';

  if (typeof rawPath !== 'string') {
    return null;
  }

  const cleanedPath = rawPath.trim();
  if (!cleanedPath) {
    return null;
  }

  if (cleanedPath.startsWith('blob:') || cleanedPath.startsWith('data:')) {
    return null;
  }

  const validPath =
    cleanedPath.startsWith('http://') ||
    cleanedPath.startsWith('https://') ||
    cleanedPath.startsWith('/uploads/') ||
    cleanedPath.startsWith('uploads/');

  if (!validPath) {
    return null;
  }

  return {
    url: cleanedPath,
    title: video?.title || `${fallbackName} - Video ${index + 1}`,
    isPrimary: Boolean(video?.isPrimary) || index === 0
  };
};

const AdminProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updating, setUpdating] = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [videoPreview, setVideoPreview] = useState([]);

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
    images: [],
    videos: []
  });

  const fetchProducts = useCallback(async () => {
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
  }, [currentPage, productsPerPage, searchTerm, categoryFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + videoFiles.length > 5) {
      toast.error('Maximum 5 videos allowed');
      return;
    }

    setVideoFiles(prev => [...prev, ...files]);

    const previews = files.map(file => ({
      name: file.name,
      size: file.size
    }));
    setVideoPreview(prev => [...prev, ...previews]);
  };

  const removeVideo = (index) => {
    const newFiles = videoFiles.filter((_, i) => i !== index);
    const newPreviews = videoPreview.filter((_, i) => i !== index);

    setVideoFiles(newFiles);
    setVideoPreview(newPreviews);
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
        const response = await fetch(getApiUrl('/admin/upload-image'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Cookies.get('token')}`
          },
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          if (!data?.imageUrl) {
            throw new Error(`Upload succeeded but image URL missing for ${file.name}`);
          }
          uploadedImages.push(data.imageUrl);
        } else {
          const errorText = await response.text();
          throw new Error(`Failed to upload ${file.name} (Status: ${response.status}) ${errorText}`);
        }
      }
      
      return uploadedImages;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  const uploadVideos = async (productId) => {
    if (videoFiles.length === 0) {
      return [];
    }

    try {
      setUploadingVideos(true);
      const uploadedVideos = [];

      for (const file of videoFiles) {
        const formData = new FormData();
        formData.append('video', file);
        formData.append('productId', productId);

        const response = await fetch(getApiUrl('/admin/upload-video'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Cookies.get('token')}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          if (!data?.videoUrl) {
            throw new Error(`Upload succeeded but video URL missing for ${file.name}`);
          }
          uploadedVideos.push(data.videoUrl);
        } else {
          const errorText = await response.text();
          throw new Error(`Failed to upload ${file.name} (Status: ${response.status}) ${errorText}`);
        }
      }

      return uploadedVideos;
    } catch (error) {
      console.error('Error uploading videos:', error);
      throw error;
    } finally {
      setUploadingVideos(false);
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

    return getImageUrl(imagePath);
  };

  const resetImageState = () => {
    // Revoke all preview URLs
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImagePreview([]);
    setVideoFiles([]);
    setVideoPreview([]);
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
        images: (productForm.images || [])
          .map((image, index) => normalizeImageEntry(image, productForm.name, index))
          .filter(Boolean),
        videos: (productForm.videos || [])
          .map((video, index) => normalizeVideoEntry(video, productForm.name, index))
          .filter(Boolean)
      };
      
      const response = await adminAPI.createProduct(productData);
      
      const updatePayload = {};

      if (imageFiles.length > 0) {
        const uploadedImageUrls = await uploadImages(response.data.product._id);

        if (uploadedImageUrls.length > 0) {
          updatePayload.images = uploadedImageUrls.map((url, index) => ({
            url: url,
            alt: `${productData.name} - Image ${index + 1}`,
            isPrimary: index === 0
          }));
        } else {
          toast.error('Image upload failed. Product was created without images. Please edit product and upload again.');
        }
      }

      if (videoFiles.length > 0) {
        const uploadedVideoUrls = await uploadVideos(response.data.product._id);

        if (uploadedVideoUrls.length > 0) {
          updatePayload.videos = uploadedVideoUrls.map((url, index) => ({
            url: url,
            title: `${productData.name} - Video ${index + 1}`,
            isPrimary: index === 0
          }));
        } else {
          toast.error('Video upload failed. Product was created without videos. Please edit product and upload again.');
        }
      }

      if (Object.keys(updatePayload).length > 0) {
        await adminAPI.updateProduct(response.data.product._id, updatePayload);
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

      let updatedImages = (productForm.images || [])
        .map((image, index) => normalizeImageEntry(image, productForm.name, index))
        .filter(Boolean);
      let updatedVideos = (productForm.videos || [])
        .map((video, index) => normalizeVideoEntry(video, productForm.name, index))
        .filter(Boolean);
      
      // Upload new images if any
      if (imageFiles.length > 0) {
        const uploadedImageUrls = await uploadImages(selectedProduct._id);
        
        if (uploadedImageUrls.length > 0) {
          // Convert URLs to proper image objects
          const newImageObjects = uploadedImageUrls.map((url, index) => ({
            url: url,
            alt: `${productForm.name} - Image ${updatedImages.length + index + 1}`,
            isPrimary: updatedImages.length === 0 && index === 0
          }));
          
          updatedImages = [...updatedImages, ...newImageObjects];
        } else {
          toast.error('Image upload failed. Existing images were kept unchanged.');
        }
      }

      if (videoFiles.length > 0) {
        const uploadedVideoUrls = await uploadVideos(selectedProduct._id);

        if (uploadedVideoUrls.length > 0) {
          const newVideoObjects = uploadedVideoUrls.map((url, index) => ({
            url: url,
            title: `${productForm.name} - Video ${updatedVideos.length + index + 1}`,
            isPrimary: updatedVideos.length === 0 && index === 0
          }));

          updatedVideos = [...updatedVideos, ...newVideoObjects];
        } else {
          toast.error('Video upload failed. Existing videos were kept unchanged.');
        }
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
        images: updatedImages,
        videos: updatedVideos
      };
      
      await adminAPI.updateProduct(selectedProduct._id, productData);
      toast.success('Product updated successfully');
      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
      resetImageState();
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

  const openEditModal = async (product) => {
    setSelectedProduct(product);
    resetImageState();
    setShowEditModal(true);

    const populate = (p) => {
      setProductForm({
        name: p.name || '',
        description: p.description || '',
        shortDescription: p.shortDescription || '',
        category: p.category || 'rings',
        subCategory: p.subCategory || '',
        price: p.price?.toString() || '',
        originalPrice: p.originalPrice?.toString() || '',
        discount: p.discount || 0,
        sku: p.sku || '',
        weight: p.specifications?.weight?.value?.toString() || p.weight?.toString() || '',
        material: p.specifications?.metal || p.material || '',
        purity: p.specifications?.purity || p.purity || '',
        stockQuantity: (p.stock?.quantity ?? p.stockQuantity ?? 0).toString(),
        featured: p.featured || false,
        tags: p.tags?.join(', ') || '',
        images: p.images || [],
        videos: p.videos || []
      });
    };

    // Populate immediately with list data so modal opens fast
    populate(product);

    try {
      // Then fetch fresh full data from backend
      const response = await adminAPI.getProduct(product._id);
      const fresh = response.data?.product || response.data || product;
      populate(fresh);
    } catch (err) {
      console.warn('Could not fetch fresh product data, using list data:', err.message);
    }
  };

  const removeExistingImage = (index) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeExistingVideo = (index) => {
    setProductForm(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
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
      images: [],
      videos: []
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
                <option value="createdAt">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="stockQuantity">Sort by Stock</option>
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

                    <label className="block text-sm font-medium text-gray-700">
                      Product Videos (Max 5)
                    </label>

                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <PhotoIcon className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload videos</span>
                          </p>
                          <p className="text-xs text-gray-500">MP4, MOV, WebM, AVI (MAX. 25MB each)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="video/*"
                          onChange={handleVideoSelect}
                        />
                      </label>
                    </div>

                    {videoPreview.length > 0 && (
                      <div className="space-y-2">
                        {videoPreview.map((preview, index) => (
                          <div key={index} className="relative flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2">
                            <div className="text-sm text-gray-700 truncate pr-8">
                              {preview.name}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVideo(index)}
                              className="text-red-500 hover:text-red-700 text-lg leading-none"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {uploadingVideos && (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold"></div>
                        <span className="text-sm text-gray-600">Uploading videos...</span>
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
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
              <div className="fixed inset-0 bg-black opacity-50" onClick={() => { setShowEditModal(false); resetImageState(); }}></div>
              <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Edit Product</h2>
                  <button type="button" onClick={() => { setShowEditModal(false); resetImageState(); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleEditProduct} className="space-y-4">

                  {/* Name & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Product Name *</label>
                      <input type="text" value={productForm.name}
                        onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Category *</label>
                      <select value={productForm.category}
                        onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold" required>
                        {categories.slice(1).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Short Description & Sub Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Short Description</label>
                      <input type="text" value={productForm.shortDescription}
                        onChange={(e) => setProductForm(prev => ({ ...prev, shortDescription: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Sub Category</label>
                      <input type="text" value={productForm.subCategory}
                        onChange={(e) => setProductForm(prev => ({ ...prev, subCategory: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold" />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description *</label>
                    <textarea value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold" rows={3} required />
                  </div>

                  {/* Price, Original Price, Stock */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Price (NPR) *</label>
                      <input type="number" value={productForm.price} min="0" step="0.01"
                        onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Original Price</label>
                      <input type="number" value={productForm.originalPrice} min="0" step="0.01"
                        onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Stock Quantity *</label>
                      <input type="number" value={productForm.stockQuantity} min="0"
                        onChange={(e) => setProductForm(prev => ({ ...prev, stockQuantity: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold" required />
                    </div>
                  </div>

                  {/* Discount & SKU */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Discount (%)</label>
                      <input type="number" value={productForm.discount} min="0" max="100"
                        onChange={(e) => setProductForm(prev => ({ ...prev, discount: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">SKU</label>
                      <input type="text" value={productForm.sku}
                        onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold" />
                    </div>
                  </div>

                  {/* Material, Purity, Weight */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Material</label>
                      <input type="text" placeholder="e.g. Gold, Silver" value={productForm.material}
                        onChange={(e) => setProductForm(prev => ({ ...prev, material: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Purity</label>
                      <input type="text" placeholder="e.g. 22K, 925" value={productForm.purity}
                        onChange={(e) => setProductForm(prev => ({ ...prev, purity: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Weight (grams)</label>
                      <input type="number" value={productForm.weight} min="0" step="0.01"
                        onChange={(e) => setProductForm(prev => ({ ...prev, weight: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold" />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tags (comma separated)</label>
                    <input type="text" value={productForm.tags} placeholder="e.g. necklace, gold, gift"
                      onChange={(e) => setProductForm(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold" />
                  </div>

                  {/* Featured */}
                  <div className="flex items-center">
                    <input type="checkbox" id="edit-featured" checked={productForm.featured}
                      onChange={(e) => setProductForm(prev => ({ ...prev, featured: e.target.checked }))}
                      className="h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded" />
                    <label htmlFor="edit-featured" className="ml-2 block text-sm text-gray-900">Featured Product</label>
                  </div>

                  {/* Existing Images */}
                  {productForm.images && productForm.images.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
                      <div className="grid grid-cols-4 gap-3">
                        {productForm.images.map((img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={getImageUrl(img)}
                              alt={`Image ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-300"
                            />
                            <button type="button" onClick={() => removeExistingImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload New Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add New Images (Max 5)</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center">
                          <PhotoIcon className="w-6 h-6 mb-1 text-gray-500" />
                          <p className="text-xs text-gray-500"><span className="font-semibold">Click to upload</span> PNG, JPG (MAX 5MB each)</p>
                        </div>
                        <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageSelect} />
                      </label>
                    </div>
                    {imagePreview.length > 0 && (
                      <div className="grid grid-cols-4 gap-3 mt-3">
                        {imagePreview.map((preview, index) => (
                          <div key={index} className="relative">
                            <img src={preview} alt={`New ${index + 1}`} className="w-full h-20 object-cover rounded-lg border border-gray-300" />
                            <button type="button" onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">&times;</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {uploadingImages && (
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold"></div>
                        <span className="text-sm text-gray-600">Uploading images...</span>
                      </div>
                    )}
                  </div>

                  {/* Existing Videos */}
                  {productForm.videos && productForm.videos.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Videos</label>
                      <div className="space-y-2">
                        {productForm.videos.map((vid, index) => (
                          <div key={index} className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2">
                            <span className="text-sm text-gray-700 truncate pr-4">{vid?.title || vid?.url || `Video ${index + 1}`}</span>
                            <button type="button" onClick={() => removeExistingVideo(index)}
                              className="text-red-500 hover:text-red-700 text-lg leading-none flex-shrink-0">&times;</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload New Videos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add New Videos (Max 5)</label>
                    <input type="file" multiple accept="video/*" onChange={handleVideoSelect}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                    {videoPreview.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {videoPreview.map((preview, index) => (
                          <div key={index} className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2">
                            <span className="text-sm text-gray-700 truncate pr-4">{preview.name}</span>
                            <button type="button" onClick={() => removeVideo(index)}
                              className="text-red-500 hover:text-red-700 text-lg leading-none flex-shrink-0">&times;</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {uploadingVideos && (
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold"></div>
                        <span className="text-sm text-gray-600">Uploading videos...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4 pt-2">
                    <button type="button" onClick={() => { setShowEditModal(false); resetImageState(); }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={loading}
                      className="bg-gold text-white px-6 py-2 rounded-lg hover:bg-gold-dark disabled:opacity-50">
                      {loading ? 'Saving...' : 'Save Changes'}
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
