import React, { useState, useEffect } from 'react';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ShoppingCartIcon,
  CurrencyRupeeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet-async';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminCustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [updating, setUpdating] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0,
    totalOrders: 0,
    totalSpent: 0
  });

  const statusOptions = [
    { value: 'all', label: 'All Customers' },
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
    { value: 'blocked', label: 'Blocked', color: 'bg-red-100 text-red-800' }
  ];

  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    status: 'active'
  });

  useEffect(() => {
    fetchCustomers();
    fetchCustomerStats();
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy: sortBy,
        sortOrder: sortOrder
      };
      
      const response = await adminAPI.getCustomers(params);
      setCustomers(response.data.customers || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerStats = async () => {
    try {
      const response = await adminAPI.getCustomerStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Error fetching customer stats:', error);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await adminAPI.getCustomerById(customerId);
      setSelectedCustomer(response.data);
      setShowCustomerModal(true);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast.error('Failed to fetch customer details');
    }
  };

  const updateCustomerStatus = async (customerId, newStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [customerId]: true }));
      await adminAPI.updateCustomerStatus(customerId, { status: newStatus });
      
      setCustomers(prev => prev.map(customer => 
        customer._id === customerId 
          ? { ...customer, status: newStatus, updatedAt: new Date().toISOString() }
          : customer
      ));
      
      toast.success(`Customer status updated to ${newStatus}`);
      fetchCustomerStats(); // Refresh stats
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('Failed to update customer status');
    } finally {
      setUpdating(prev => ({ ...prev, [customerId]: false }));
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const customerData = {
        ...customerForm,
        phone: customerForm.phone || undefined
      };
      
      await adminAPI.createCustomer(customerData);
      toast.success('Customer added successfully');
      setShowAddModal(false);
      resetForm();
      fetchCustomers();
      fetchCustomerStats();
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error(error.response?.data?.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId, customerName) => {
    if (!window.confirm(`Are you sure you want to delete customer "${customerName}"?`)) {
      return;
    }

    try {
      setUpdating(prev => ({ ...prev, [customerId]: true }));
      await adminAPI.deleteCustomer(customerId);
      toast.success('Customer deleted successfully');
      fetchCustomers();
      fetchCustomerStats();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    } finally {
      setUpdating(prev => ({ ...prev, [customerId]: false }));
    }
  };

  const resetForm = () => {
    setCustomerForm({
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      status: 'active'
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  if (loading && customers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Customer Management - Admin Panel | TheAlankriti</title>
        <meta name="description" content="Manage customers and track customer analytics for TheAlankriti" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
                <p className="text-sm text-gray-600">Manage customer accounts and analytics</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gold text-white px-4 py-2 rounded-lg hover:bg-gold-dark transition-colors flex items-center"
              >
                <UserPlusIcon className="w-5 h-5 mr-2" />
                Add Customer
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Customers</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.active || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <XCircleIcon className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Inactive</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.inactive || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">New This Month</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.newThisMonth || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <ShoppingCartIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders || 0}</p>
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
                  <p className="text-sm font-medium text-gray-500">Total Spent</p>
                  <p className="text-lg font-semibold text-gray-900">{formatPrice(stats.totalSpent || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>
              
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
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              >
                <option value="createdAt">Sort by Join Date</option>
                <option value="name">Sort by Name</option>
                <option value="email">Sort by Email</option>
                <option value="totalOrders">Sort by Orders</option>
                <option value="totalSpent">Sort by Spending</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
              >
                {sortOrder === 'asc' ? <ArrowUpIcon className="w-5 h-5" /> : <ArrowDownIcon className="w-5 h-5" />}
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>

          {/* Customers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {customers.map(customer => (
              <div key={customer._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gold-light rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gold" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate" title={customer.name}>
                        {customer.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate" title={customer.email}>
                        {customer.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {customer.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        {customer.phone}
                      </div>
                    )}
                    
                    {customer.address?.city && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        {customer.address.city}, {customer.address.state}
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Joined {formatDate(customer.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {customer.totalOrders || 0} orders
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(customer.totalSpent || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <select
                      value={customer.status}
                      onChange={(e) => updateCustomerStatus(customer._id, e.target.value)}
                      disabled={updating[customer._id]}
                      className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-gold focus:border-gold"
                    >
                      {statusOptions.slice(1).map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => fetchCustomerDetails(customer._id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer._id, customer.name)}
                        disabled={updating[customer._id]}
                        className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        title="Delete Customer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
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
                          ? 'bg-gold text-white border-gold'
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
        </div>

        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowAddModal(false)}></div>
              <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
                <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
                <form onSubmit={handleAddCustomer} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                    />
                    <select
                      value={customerForm.status}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, status: e.target.value }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                    >
                      {statusOptions.slice(1).map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder="Street Address"
                    value={customerForm.address.street}
                    onChange={(e) => setCustomerForm(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={customerForm.address.city}
                      onChange={(e) => setCustomerForm(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={customerForm.address.state}
                      onChange={(e) => setCustomerForm(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, state: e.target.value }
                      }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={customerForm.address.pincode}
                      onChange={(e) => setCustomerForm(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, pincode: e.target.value }
                      }))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"
                    />
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
                      {loading ? 'Adding...' : 'Add Customer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Customer Details Modal */}
        {showCustomerModal && selectedCustomer && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowCustomerModal(false)}></div>
              <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
                  <button
                    onClick={() => setShowCustomerModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <UserIcon className="w-5 h-5 mr-2" />
                      Customer Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-gray-900">{selectedCustomer.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-gray-900">{selectedCustomer.email}</p>
                      </div>
                      {selectedCustomer.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <p className="text-gray-900">{selectedCustomer.phone}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedCustomer.status)}`}>
                          {selectedCustomer.status}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Join Date</label>
                        <p className="text-gray-900">{formatDate(selectedCustomer.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <MapPinIcon className="w-5 h-5 mr-2" />
                      Address Information
                    </h3>
                    {selectedCustomer.address ? (
                      <div className="space-y-1">
                        <p>{selectedCustomer.address.street}</p>
                        <p>{selectedCustomer.address.city}, {selectedCustomer.address.state}</p>
                        <p>{selectedCustomer.address.pincode}</p>
                        <p>{selectedCustomer.address.country}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No address information available</p>
                    )}
                  </div>
                </div>

                {/* Order History */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Order History</h3>
                  {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedCustomer.orders.map((order, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                #{order.orderNumber || order._id?.slice(-8)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {formatDate(order.createdAt)}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {formatPrice(order.totalAmount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-lg">
                      <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                      <p className="mt-1 text-sm text-gray-500">This customer hasn't placed any orders.</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowCustomerModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Close
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

export default AdminCustomerManager;
