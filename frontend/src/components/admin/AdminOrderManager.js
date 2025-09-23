import React, { useState, useEffect, useCallback } from 'react';
import { 
  EyeIcon, 
  CheckIcon, 
  XMarkIcon,
  TruckIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  EnvelopeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet-async';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminOrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState({});
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [currentScreenshotUrl, setCurrentScreenshotUrl] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0
  });

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  // Enhanced error handling
  const handleAPIError = useCallback((error, operation) => {
    console.error(`❌ ${operation} Error:`, error);
    
    let errorMessage = 'Unknown error occurred';

    if (error.response) {
      // Server responded with error
      errorMessage = error.response.data?.message || `Server error (${error.response.status})`;
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error - cannot reach server';
    } else {
      // Other error
      errorMessage = error.message;
    }

    setError(`${operation}: ${errorMessage}`);
    
    return { errorMessage };
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, dateFilter]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        dateFilter: dateFilter !== 'all' ? dateFilter : undefined
      };
      
      console.log('🔄 Fetching orders with params:', params);
      console.log('🔍 Current filters - Status:', statusFilter, 'Date:', dateFilter, 'Page:', currentPage);
      
      const response = await adminAPI.getOrders(params);
      console.log('✅ Orders response:', response.data);
      
      // Debug product data specifically
      if (response.data.orders?.length > 0) {
        const firstOrder = response.data.orders[0];
        console.log('🔍 First order items:', firstOrder.items);
        if (firstOrder.items?.length > 0) {
          const firstItem = firstOrder.items[0];
          console.log('🔍 First item productSnapshot:', firstItem.productSnapshot);
          console.log('🔍 First item name fallbacks:', {
            productSnapshotName: firstItem.productSnapshot?.name,
            itemName: firstItem.name,
            fallback: 'Unknown Product'
          });
        }
      }
      
      setOrders(response.data.orders || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      
      if (response.data.orders?.length === 0) {
        console.log('⚠️ No orders found - this might be normal if no orders exist');
      }
      
    } catch (error) {
      handleAPIError(error, 'Fetch Orders');
      setOrders([]);
      
      // Show user-friendly message
      if (error.response?.status === 401) {
        toast.error('Admin authentication required. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to view orders.');
      } else if (!error.response) {
        toast.error('Cannot connect to server. Please check your internet connection.');
      } else {
        toast.error('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, dateFilter, handleAPIError]);

  const fetchOrderStats = useCallback(async () => {
    try {
      console.log('🔄 Fetching order stats...');
      const response = await adminAPI.getOrderStats();
      console.log('✅ Stats response:', response.data);
      
      setStats(response.data || {});
      
    } catch (error) {
      handleAPIError(error, 'Fetch Order Stats');
      // Don't show toast for stats failure as it's secondary
      console.warn('Stats loading failed, using defaults');
    }
  }, [handleAPIError]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [orderId]: true }));
      
      console.log('🔄 Updating order status:', { orderId, newStatus });
      const response = await adminAPI.updateOrderStatus(orderId, newStatus);
      console.log('✅ Status update response:', response.data);
      
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      ));
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrderStats(); // Refresh stats
      
    } catch (error) {
      const { errorMessage } = handleAPIError(error, 'Update Order Status');
      toast.error(errorMessage);
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      console.log('🔄 Fetching order details for:', orderId);
      const response = await adminAPI.getOrderById(orderId);
      console.log('✅ Order details response:', response.data);
      
      setSelectedOrder(response.data);
      setShowOrderModal(true);
      
    } catch (error) {
      handleAPIError(error, 'Fetch Order Details');
      toast.error('Failed to fetch order details');
    }
  };

  // Helper function to get static file URL
  const getStaticFileUrl = (filePath) => {
    // Get base URL without /api suffix for static files
    const apiUrl = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://thealankriti-backendd.onrender.com/api');
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/${filePath}`;
  };

  const viewPaymentScreenshot = (screenshot) => {
    console.log('🔍 viewPaymentScreenshot called with:', screenshot);
    console.log('🔍 Screenshot type:', typeof screenshot);
    console.log('🔍 Screenshot stringified:', JSON.stringify(screenshot, null, 2));
    console.log('🔍 Screenshot keys:', Object.keys(screenshot || {}));
    
    if (!screenshot) {
      console.log('❌ No screenshot object provided');
      toast.error('Screenshot not available');
      return;
    }

    // Check for different path structures and log them
    let screenshotPath = null;
    
    // Method 1: Direct path
    if (screenshot.path) {
      screenshotPath = screenshot.path;
      console.log('✅ Found path in screenshot.path:', screenshotPath);
    } 
    // Method 2: Construct from filename
    else if (screenshot.filename) {
      screenshotPath = `uploads/payment-screenshots/${screenshot.filename}`;
      console.log('✅ Constructed path from filename:', screenshotPath);
    }
    // Method 3: Check nested structures (from old data)
    else if (screenshot.screenshot?.path) {
      screenshotPath = screenshot.screenshot.path;
      console.log('✅ Found path in screenshot.screenshot.path:', screenshotPath);
    }
    else if (screenshot.screenshot?.filename) {
      screenshotPath = `uploads/payment-screenshots/${screenshot.screenshot.filename}`;
      console.log('✅ Constructed path from screenshot.screenshot.filename:', screenshotPath);
    }
    else {
      console.log('❌ No valid path found in screenshot object:', {
        'screenshot.path': screenshot.path,
        'screenshot.filename': screenshot.filename,
        'screenshot.screenshot': screenshot.screenshot,
        'fullObject': screenshot
      });
      
      // Check if it's just a status-only object (incomplete screenshot data)
      if (screenshot.status && Object.keys(screenshot).length === 1) {
        toast.error(`Screenshot file missing - only status available (${screenshot.status}). This may be from an older order with incomplete data.`);
      } else if (screenshot.status && !screenshot.filename && !screenshot.path) {
        toast.error(`Screenshot uploaded but file information missing (${screenshot.status}). Please contact support.`);
      } else {
        toast.error('Screenshot path not available');
      }
      return;
    }

    console.log('📁 Using screenshot path:', screenshotPath);

    // Ensure path doesn't start with slash (for relative paths)
    if (screenshotPath.startsWith('/')) {
      screenshotPath = screenshotPath.substring(1);
      console.log('📁 Removed leading slash, path now:', screenshotPath);
    }

    // Construct the full URL using the helper function
    const screenshotUrl = screenshotPath.startsWith('http') 
      ? screenshotPath 
      : getStaticFileUrl(screenshotPath);
      
    console.log('🔗 Final screenshot URL:', screenshotUrl);
    
    // Test the URL accessibility
    fetch(screenshotUrl, { method: 'HEAD' })
      .then(response => {
        console.log('🌐 URL accessibility test:', response.status, response.statusText);
        if (!response.ok) {
          console.warn('⚠️ Screenshot URL returned non-OK status:', response.status);
          toast.error(`Screenshot file not found (${response.status})`);
        } else {
          // Open screenshot in modal instead of new window
          setCurrentScreenshotUrl(screenshotUrl);
          setShowScreenshotModal(true);
        }
      })
      .catch(error => {
        console.warn('⚠️ Failed to test screenshot URL accessibility:', error);
        // Still try to show it in modal even if test fails
        setCurrentScreenshotUrl(screenshotUrl);
        setShowScreenshotModal(true);
      });
  };

  const exportOrders = async () => {
    try {
      toast.loading('Exporting orders...');
      await adminAPI.exportOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        dateFilter: dateFilter !== 'all' ? dateFilter : undefined
      });
      toast.success('Orders exported successfully');
    } catch (error) {
      handleAPIError(error, 'Export Orders');
      toast.error('Failed to export orders');
    }
  };

  const sendOrderEmail = async (orderId, emailType = 'confirmation') => {
    try {
      setUpdating(prev => ({ ...prev, [`email_${orderId}`]: true }));
      await adminAPI.sendOrderEmail(orderId, { emailType });
      toast.success('Email sent successfully');
    } catch (error) {
      handleAPIError(error, 'Send Order Email');
      toast.error('Failed to send email');
    } finally {
      setUpdating(prev => ({ ...prev, [`email_${orderId}`]: false }));
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      setUpdating(prev => ({ ...prev, [`delete_${orderId}`]: true }));
      await adminAPI.deleteOrder(orderId);
      
      // Remove order from local state
      setOrders(prev => prev.filter(order => order._id !== orderId));
      
      toast.success('Order deleted successfully');
      fetchOrderStats(); // Refresh stats
      
    } catch (error) {
      const { errorMessage } = handleAPIError(error, 'Delete Order');
      toast.error(errorMessage);
    } finally {
      setUpdating(prev => ({ ...prev, [`delete_${orderId}`]: false }));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin orders...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Order Management - Admin Panel | TheAlankriti</title>
        <meta name="description" content="Order management for TheAlankriti" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                <p className="text-sm text-gray-600">Manage customer orders and track sales</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    console.log('🔄 Manual refresh triggered');
                    fetchOrders();
                    fetchOrderStats();
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  Refresh
                </button>
                <button
                  onClick={exportOrders}
                  className="bg-gold text-white px-4 py-2 rounded-lg hover:bg-gold-dark transition-colors flex items-center"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                  Export Orders
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  <button 
                    onClick={() => {
                      setError(null);
                      fetchOrders();
                      fetchOrderStats();
                    }}
                    className="mt-2 text-red-600 hover:text-red-500 underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CurrencyRupeeIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pending || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Confirmed</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.confirmed || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <TruckIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Shipped</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.shipped || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Delivered</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.delivered || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <XMarkIcon className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Cancelled</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.cancelled || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gold-light rounded-full flex items-center justify-center">
                    <CurrencyRupeeIcon className="w-5 h-5 text-gold" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Revenue</p>
                  <p className="text-lg font-semibold text-gray-900">{formatPrice(stats.totalRevenue || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              >
                {dateOptions.map(date => (
                  <option key={date.value} value={date.value}>
                    {date.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {orders.length === 0 && !loading ? (
              <div className="text-center py-12">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {error ? 'There was an error loading orders.' : 'Get started by creating your first order.'}
                </p>
                {error && (
                  <button 
                    onClick={() => {
                      setError(null);
                      fetchOrders();
                    }}
                    className="mt-3 bg-gold text-white px-4 py-2 rounded-lg hover:bg-gold-dark"
                  >
                    Retry Loading Orders
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.orderNumber || order._id?.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.shippingAddress?.fullName || 
                             order.customerInfo?.firstName + ' ' + order.customerInfo?.lastName ||
                             order.customerInfo?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.shippingAddress?.email || order.customerInfo?.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-2">
                            {order.items?.map((item, index) => (
                              <div key={index} className="border-l-2 border-gold-light pl-2">
                                <div className="flex items-start space-x-3">
                                  {/* Product Image */}
                                  {item.productSnapshot?.images?.[0] && (
                                    <div className="flex-shrink-0">
                                      <img
                                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${item.productSnapshot.images[0]}`}
                                        alt={item.productSnapshot.name || 'Product'}
                                        className="w-12 h-12 object-cover rounded border border-gray-200"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                  
                                  {/* Product Details */}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                      {item.productSnapshot?.name || item.name || 'Unknown Product'}
                                    </div>
                                    <div className="text-xs text-gray-500 space-y-1">
                                      <div>Qty: {item.quantity || 1} | Price: NPR {item.productSnapshot?.price || item.price || 0}</div>
                                      {item.productSnapshot?.sku && (
                                        <div>SKU: {item.productSnapshot.sku}</div>
                                      )}
                                      {item.productSnapshot?.specifications && (
                                        <div className="text-gray-400">
                                          {item.productSnapshot.specifications.metal && 
                                            `${item.productSnapshot.specifications.metal}`}
                                          {item.productSnapshot.specifications.purity && 
                                            ` ${item.productSnapshot.specifications.purity}`}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )) || (
                              <span className="text-gray-500">No items</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {order.payment?.method === 'esewa' ? 'eSewa' : 
                               order.payment?.method === 'cod' ? 'Cash on Delivery' : 
                               order.payment?.method || 'Unknown'}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                              order.payment?.screenshot?.status === 'verified' ? 'bg-green-100 text-green-800' :
                              order.payment?.screenshot?.status === 'pending_verification' ? 'bg-amber-100 text-amber-800' :
                              order.payment?.screenshot?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.payment?.screenshot?.status === 'verified' ? '✓ Verified' :
                               order.payment?.screenshot?.status === 'pending_verification' ? '⏳ Pending' :
                               order.payment?.screenshot?.status === 'rejected' ? '✗ Rejected' :
                               order.payment?.status || 'No Screenshot'}
                            </div>
                            {order.payment?.screenshot && (
                              <div className="mt-1">
                                {(order.payment.screenshot.filename || order.payment.screenshot.path) ? (
                                  <button
                                    onClick={() => viewPaymentScreenshot(order.payment.screenshot)}
                                    className="text-blue-600 hover:text-blue-800 text-xs underline"
                                  >
                                    View Screenshot
                                  </button>
                                ) : (
                                  <div className="text-xs text-amber-600">
                                    📷 Screenshot data incomplete
                                    <div className="text-gray-500">
                                      Status: {order.payment.screenshot.status}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatPrice(order.pricing?.total || order.totalAmount || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            disabled={updating[order._id]}
                            className={`px-2 py-1 text-xs font-medium rounded-full border-0 focus:ring-2 focus:ring-gold ${getStatusColor(order.status)}`}
                          >
                            {statusOptions.slice(1).map(status => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewOrderDetails(order._id)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => sendOrderEmail(order._id)}
                              disabled={updating[`email_${order._id}`]}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                              title="Send Email"
                            >
                              <EnvelopeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteOrder(order._id)}
                              disabled={updating[`delete_${order._id}`]}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Delete Order"
                            >
                              {updating[`delete_${order._id}`] ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <TrashIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-gold border-gold text-white'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowOrderModal(false)}></div>
              <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order #{selectedOrder.orderNumber || selectedOrder._id?.slice(-8)}
                  </h2>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Order details content - simplified for debug */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Order Information</h3>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                      {JSON.stringify(selectedOrder, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => sendOrderEmail(selectedOrder._id, 'invoice')}
                    disabled={updating[`email_${selectedOrder._id}`]}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    <PrinterIcon className="w-4 h-4 mr-2" />
                    Send Invoice
                  </button>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Screenshot Modal */}
        {showScreenshotModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Screenshot
                </h3>
                <button
                  onClick={() => setShowScreenshotModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-4">
                <div className="flex justify-center">
                  <img
                    src={currentScreenshotUrl}
                    alt="Payment Screenshot"
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                    onError={(e) => {
                      console.log('❌ Failed to load screenshot image');
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div 
                    className="hidden text-center py-8 text-gray-500"
                    style={{ display: 'none' }}
                  >
                    <div className="text-lg mb-2">📷</div>
                    <div>Failed to load screenshot</div>
                    <div className="text-sm mt-2">
                      <a 
                        href={currentScreenshotUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Try opening in new tab
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="flex justify-between items-center p-4 border-t bg-gray-50">
                <a 
                  href={currentScreenshotUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  Open in new tab
                </a>
                <button
                  onClick={() => setShowScreenshotModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminOrderManager;