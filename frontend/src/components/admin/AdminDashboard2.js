import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Helmet } from 'react-helmet-async';
import AdminProductManager from './AdminProductManager';
import AdminOrderManager from './AdminOrderManager';
import AdminCustomerManager from './AdminCustomerManager';
import { 
  ShoppingCartIcon, 
  CurrencyRupeeIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HomeIcon,
  CubeIcon,
  DocumentTextIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  const navigationTabs = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'products', name: 'Products', icon: CubeIcon },
    { id: 'orders', name: 'Orders', icon: ShoppingCartIcon },
    { id: 'customers', name: 'Customers', icon: UsersIcon },
    { id: 'reports', name: 'Reports', icon: DocumentTextIcon }
  ];

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    }
  }, [period, activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard(period);
      const data = response.data;
      
      // Map backend response to expected structure
      setStats({
        totalOrders: data.summary?.totalOrders || 0,
        totalRevenue: data.summary?.totalRevenue || 0,
        totalCustomers: data.summary?.totalCustomers || 0,
        totalProducts: data.summary?.totalProducts || 0,
        recentOrders: data.recentOrders || [],
        topProducts: data.topProducts || []
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <AdminProductManager />;
      case 'orders':
        return <AdminOrderManager />;
      case 'customers':
        return <AdminCustomerManager />;
      case 'reports':
        return (
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Reports & Analytics</h2>
              <p className="text-gray-600">Advanced reporting features coming soon!</p>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => {
    const statCards = [
      {
        name: 'Total Orders',
        value: stats.totalOrders,
        icon: ShoppingCartIcon,
        color: 'bg-blue-500',
        change: '+12%',
        changeType: 'increase'
      },
      {
        name: 'Revenue',
        value: formatPrice(stats.totalRevenue),
        icon: CurrencyRupeeIcon,
        color: 'bg-green-500',
        change: '+8%',
        changeType: 'increase'
      },
      {
        name: 'Customers',
        value: stats.totalCustomers,
        icon: UserGroupIcon,
        color: 'bg-purple-500',
        change: '+15%',
        changeType: 'increase'
      },
      {
        name: 'Products',
        value: stats.totalProducts,
        icon: CubeIcon,
        color: 'bg-orange-500',
        change: '+3%',
        changeType: 'increase'
      }
    ];

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
        </div>
      );
    }

    return (
      <>
        <Helmet>
          <title>Admin Dashboard | The Alankriti</title>
          <meta name="description" content="Admin dashboard for managing The Alankriti e-commerce platform" />
        </Helmet>

        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">Welcome to The Alankriti Admin Panel</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold focus:border-transparent"
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 3 months</option>
                    <option value={365}>Last year</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 ${stat.color} rounded-md flex items-center justify-center`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stat.value}
                          </div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.changeType === 'increase' ? (
                              <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                            )}
                            <span className="sr-only">
                              {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                            </span>
                            {stat.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
                </div>
                <div className="p-6">
                  {stats.recentOrders && stats.recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentOrders.slice(0, 5).map((order, index) => (
                        <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`w-2 h-2 rounded-full ${
                                order.status === 'delivered' ? 'bg-green-400' :
                                order.status === 'shipped' ? 'bg-blue-400' :
                                order.status === 'processing' ? 'bg-yellow-400' :
                                'bg-gray-400'
                              }`}></div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                #{order.orderNumber || order._id?.slice(-8)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.customerInfo?.name || order.shippingAddress?.fullName || 'Customer'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatPrice(order.totalAmount)}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {order.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Orders will appear here when customers make purchases.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
                </div>
                <div className="p-6">
                  {stats.topProducts && stats.topProducts.length > 0 ? (
                    <div className="space-y-4">
                      {stats.topProducts.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={product.images?.[0]?.url || '/api/placeholder/40/40'}
                                alt={product.name}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                {product.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Stock: {product.stock?.quantity || product.stockQuantity || 0}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatPrice(product.price)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {product.salesCount || 0} sold
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No products yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Add products to start tracking sales data.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white shadow">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 mb-6">
                <h1 className="text-xl font-bold text-gray-900">The Alankriti</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigationTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'bg-gold text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`}
                  >
                    <tab.icon
                      className={`${
                        activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile menu button */}
        <div className="md:hidden">
          <div className="bg-white shadow px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                {navigationTabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
