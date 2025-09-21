import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  EyeIcon, 
  ArrowPathIcon,
  FunnelIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import { getImageWithFallback } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updating, setUpdating] = useState({});
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const orderStatuses = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const paymentStatuses = [
    { value: 'all', label: 'All Payments' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const paymentMethods = [
    { value: 'all', label: 'All Methods' },
    { value: 'esewa', label: 'eSewa' },
    { value: 'esewa-qr', label: 'eSewa QR' },
    { value: 'cod', label: 'Cash on Delivery' },
    { value: 'bank-transfer', label: 'Bank Transfer' }
  ];

  const dateFilters = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, statusFilter, paymentFilter, dateFilter]);

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(true); // Silent refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentPage, searchTerm, statusFilter, paymentFilter, dateFilter]);

  const fetchOrders = async (silent = false) => {
    try {
      setLoading(!silent);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        paymentStatus: paymentFilter !== 'all' ? paymentFilter : undefined,
        dateFilter: dateFilter !== 'all' ? dateFilter : undefined
      };
      
      const response = await adminAPI.getOrders(params);
      const newOrders = response.data.orders || [];
      const newTotalOrders = response.data.pagination?.totalOrders || 0;
      
      // Check for new orders
      if (orders.length > 0 && newTotalOrders > totalOrders && silent) {
        const newOrderCount = newTotalOrders - totalOrders;
        toast.success(`${newOrderCount} new order${newOrderCount > 1 ? 's' : ''} received!`, {
          duration: 5000,
          icon: '🔔'
        });
      }
      
      setOrders(newOrders);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalOrders(newTotalOrders);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (!silent) {
        toast.error('Failed to fetch orders');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [orderId]: true }));
      
      // Make sure to pass status in the correct format
      const response = await adminAPI.updateOrderStatus(orderId, newStatus);
      console.log('Order status update response:', response);
      
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update order status';
      toast.error(errorMessage);
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) {
      toast.error('Please select an action and orders');
      return;
    }

    try {
      setLoading(true);
      for (const orderId of selectedOrders) {
        await adminAPI.updateOrderStatus(orderId, bulkAction);
      }
      toast.success(`Updated ${selectedOrders.length} orders to ${bulkAction}`);
      setSelectedOrders([]);
      setBulkAction('');
      fetchOrders();
    } catch (error) {
      console.error('Error with bulk action:', error);
      toast.error('Failed to perform bulk action');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order._id));
    }
  };

  const exportOrders = async () => {
    try {
      const response = await adminAPI.exportOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        paymentStatus: paymentFilter !== 'all' ? paymentFilter : undefined,
        dateFilter: dateFilter !== 'all' ? dateFilter : undefined
      });
      
      // Create and download file
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Orders exported successfully');
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Failed to export orders');
    }
  };

  const sendOrderEmail = async (orderId) => {
    try {
      const response = await adminAPI.sendOrderEmail(orderId);
      if (response.data.warning) {
        toast(response.data.message, {
          icon: '⚠️',
          duration: 6000,
          style: {
            background: '#f59e0b',
            color: 'white',
          },
        });
      } else {
        toast.success('Order email sent successfully');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send email';
      
      // Don't show error for email service configuration issues
      if (!errorMessage.includes('not configured')) {
        toast.error(errorMessage);
      }
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await adminAPI.getOrderById(orderId);
      setSelectedOrder(response.data);
      setShowOrderModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order Management</h1>
                <p className="text-sm sm:text-base text-gray-600">Manage all customer orders and their status</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    Total: {totalOrders} orders
                  </div>
                  {lastUpdated && (
                    <div className="text-xs text-gray-400">
                      Updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                  )}
                </div>
                <button
                  onClick={fetchOrders}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold disabled:opacity-50"
                  title="Refresh orders"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="ml-2 hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 sm:top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-gold focus:border-gold"
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-gold focus:border-gold"
                >
                  {orderStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{order.orderNumber || order._id.slice(-6)}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {order.items?.length || 0} items
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate max-w-32 sm:max-w-none">
                            {order.customerInfo?.email}
                          </div>
                          {order.customerInfo?.phone && (
                            <div className="text-xs text-gray-400">
                              {order.customerInfo.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        NPR {order.totalAmount?.toLocaleString() || 0}
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            order.payment?.method === 'cod' 
                              ? 'bg-orange-100 text-orange-800' 
                              : order.payment?.method === 'esewa' || order.payment?.method === 'esewa-qr'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.payment?.method === 'cod' 
                              ? 'COD' 
                              : order.payment?.method === 'esewa-qr'
                              ? 'eSewa QR'
                              : order.payment?.method || 'N/A'}
                          </span>
                          <span className={`text-xs mt-1 ${
                            order.payment?.status === 'completed' ? 'text-green-600' :
                            order.payment?.status === 'pending' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {order.payment?.status || 'pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={updating[order._id]}
                          className={`text-xs sm:text-sm rounded-full px-2 sm:px-3 py-1 font-medium border-none ${getStatusColor(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewOrderDetails(order._id)}
                          className="text-gold hover:text-gold-dark"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs sm:text-sm text-gray-700 self-center">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-3 sm:px-4 py-2 border text-sm font-medium ${
                              pageNum === currentPage
                                ? 'z-10 bg-gold border-gold text-white'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-4 sm:top-20 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-medium text-gray-900">
                  Order #{selectedOrder.orderNumber || selectedOrder._id.slice(-6)}
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Customer Info */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <strong>Name:</strong> {selectedOrder.customerInfo?.firstName} {selectedOrder.customerInfo?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 break-all">
                      <strong>Email:</strong> {selectedOrder.customerInfo?.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Phone:</strong> {selectedOrder.customerInfo?.phone || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>User ID:</strong> {selectedOrder.customerInfo?.userId || selectedOrder.customer}
                    </p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <strong>Name:</strong> {selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Address:</strong> {selectedOrder.shippingAddress?.street}
                      {selectedOrder.shippingAddress?.apartment && `, ${selectedOrder.shippingAddress.apartment}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>City:</strong> {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Country:</strong> {selectedOrder.shippingAddress?.country}
                    </p>
                    {selectedOrder.shippingAddress?.landmark && (
                      <p className="text-sm text-gray-600">
                        <strong>Landmark:</strong> {selectedOrder.shippingAddress.landmark}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}
                    </p>
                  </div>
                </div>

                {/* Order Info */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Order Information</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Status:</strong> 
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Total:</strong> NPR {selectedOrder.totalAmount?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-4 sm:mt-6">
                <h4 className="font-medium text-gray-900 mb-3 sm:mb-4">Order Items</h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.items?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-md object-cover"
                                  src={getImageWithFallback(item.productSnapshot?.image || item.product?.images?.[0], 'Product')}
                                  alt={item.productSnapshot?.name || item.product?.name || 'Product'}
                                />
                                <div className="ml-2 sm:ml-4">
                                  <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-32 sm:max-w-none">
                                    {item.productSnapshot?.name || item.product?.name || 'Unknown Product'}
                                  </div>
                                  {item.productSnapshot?.sku && (
                                    <div className="text-xs text-gray-500">
                                      SKU: {item.productSnapshot.sku}
                                    </div>
                                  )}
                                  {item.variant && (
                                    <div className="text-xs text-gray-500">
                                      {item.variant.name}: {item.variant.value}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              NPR {item.price?.toLocaleString() || 0}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              NPR {((item.price || 0) * (item.quantity || 0)).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-4 sm:mt-6 bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>NPR {selectedOrder.pricing?.subtotal?.toLocaleString() || selectedOrder.subtotal?.toLocaleString() || 0}</span>
                  </div>
                  {selectedOrder.pricing?.shipping > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Shipping:</span>
                      <span>NPR {selectedOrder.pricing.shipping.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedOrder.pricing?.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>NPR {selectedOrder.pricing.tax.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedOrder.pricing?.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-NPR {selectedOrder.pricing.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-base font-medium">
                      <span>Total:</span>
                      <span>NPR {selectedOrder.pricing?.total?.toLocaleString() || selectedOrder.totalAmount?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                  {selectedOrder.payment && (
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span>Payment Method:</span>
                        <span className={`capitalize font-medium ${
                          selectedOrder.payment.method === 'cod' 
                            ? 'text-orange-600 bg-orange-100 px-2 py-1 rounded text-xs' 
                            : selectedOrder.payment.method === 'esewa' || selectedOrder.payment.method === 'esewa-qr'
                            ? 'text-green-600'
                            : 'text-gray-700'
                        }`}>
                          {selectedOrder.payment.method === 'cod' 
                            ? 'Cash on Delivery' 
                            : selectedOrder.payment.method === 'esewa-qr'
                            ? 'eSewa QR'
                            : selectedOrder.payment.method}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Payment Status:</span>
                        <span className={`capitalize ${selectedOrder.payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {selectedOrder.payment.status}
                        </span>
                      </div>
                      {selectedOrder.payment.transactionId && (
                        <div className="flex justify-between text-sm">
                          <span>Transaction ID:</span>
                          <span className="font-mono text-xs">{selectedOrder.payment.transactionId}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
