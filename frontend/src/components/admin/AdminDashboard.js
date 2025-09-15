import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { 
  ShoppingCartIcon, 
  CurrencyRupeeIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
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

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

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
    } finally {
      setLoading(false);
    }
  };

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
      value: `NPR ${stats.totalRevenue?.toLocaleString() || 0}`,
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
      change: '+24%',
      changeType: 'increase'
    },
    {
      name: 'Products',
      value: stats.totalProducts,
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      change: '+2%',
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening in your store.</p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={period}
                  onChange={(e) => setPeriod(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-gold focus:border-gold"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-md p-2 sm:p-3`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.name}</p>
                  <p className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">{stat.value}</p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center">
                {stat.changeType === 'increase' ? (
                  <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                )}
                <span className={`text-xs sm:text-sm ml-1 ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-xs sm:text-sm text-gray-500 ml-1 hidden sm:inline">vs last period</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders & Top Products */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Recent Orders</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {stats.recentOrders?.length > 0 ? (
                stats.recentOrders.slice(0, 5).map((order) => (
                  <div key={order._id} className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Order #{order.orderNumber || order._id.slice(-6)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {order.user?.firstName} {order.user?.lastName}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          NPR {order.totalAmount}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-500">
                  No recent orders found
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Top Products</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {stats.topProducts?.length > 0 ? (
                stats.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product._id} className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          className="h-8 w-8 sm:h-10 sm:w-10 rounded-md object-cover"
                          src={product.images?.[0] || '/api/placeholder/40/40'}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {product.soldCount || 0} sold
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          NPR {product.price}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Stock: {product.stock?.quantity || product.stockQuantity || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-500">
                  No product data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
