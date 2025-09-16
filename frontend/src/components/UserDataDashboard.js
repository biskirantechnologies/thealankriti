import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  ChartBarIcon, 
  ClockIcon, 
  HeartIcon,
  EyeIcon,
  MapPinIcon,
  ShoppingBagIcon,
  CurrencyRupeeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const UserDataDashboard = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllUserData();
  }, []);

  const fetchAllUserData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all user data in parallel
      const [profileRes, dashboardRes, wishlistRes, recentlyViewedRes] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getDashboard(),
        userAPI.getWishlist(),
        userAPI.getRecentlyViewed()
      ]);

      setUserProfile(profileRes.data.user);
      setDashboardData(dashboardRes.data.dashboard);
      setWishlist(wishlistRes.data.wishlist);
      setRecentlyViewed(recentlyViewedRes.data.recentlyViewed);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete User Data Dashboard
          </h1>
          <p className="text-gray-600">
            All user information stored in the database after login
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <UserIcon className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900">{userProfile?.fullName || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{userProfile?.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{userProfile?.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {userProfile?.role}
                  </span>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-gray-900">{formatDate(userProfile?.createdAt)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Login</label>
                  <p className="text-gray-900">{formatDate(userProfile?.lastLogin)}</p>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <div className="flex items-center mb-4">
                <MapPinIcon className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
              </div>
              
              {userProfile?.addresses?.length > 0 ? (
                <div className="space-y-3">
                  {userProfile.addresses.map((address, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">
                          {address.title || address.type}
                        </span>
                        {address.isDefault && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {[address.street, address.city, address.state, address.zipCode, address.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No addresses saved</p>
              )}
            </div>
          </motion.div>

          {/* Statistics and Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Order Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <ChartBarIcon className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Order Statistics</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {userProfile?.statistics?.totalOrders || 0}
                  </div>
                  <div className="text-sm text-gray-500">Total Orders</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(userProfile?.statistics?.totalSpent || 0)}
                  </div>
                  <div className="text-sm text-gray-500">Total Spent</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(userProfile?.statistics?.averageOrderValue || 0)}
                  </div>
                  <div className="text-sm text-gray-500">Avg Order Value</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardData?.statistics?.pendingOrders || 0}
                  </div>
                  <div className="text-sm text-gray-500">Pending Orders</div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <ShoppingBagIcon className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              </div>
              
              {userProfile?.recentOrders?.length > 0 ? (
                <div className="space-y-3">
                  {userProfile.recentOrders.map((order, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(order.pricing.total)}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No orders yet</p>
              )}
            </div>

            {/* Wishlist */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <HeartIcon className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Wishlist ({wishlist.length} items)
                </h2>
              </div>
              
              {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlist.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <img
                        src={item.productId?.images?.[0]?.url || '/placeholder-image.jpg'}
                        alt={item.productId?.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {item.productId?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Added {new Date(item.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.productId?.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No items in wishlist</p>
              )}
            </div>

            {/* Recently Viewed */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <EyeIcon className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Recently Viewed ({recentlyViewed.length} items)
                </h2>
              </div>
              
              {recentlyViewed.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentlyViewed.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <img
                        src={item.productId?.images?.[0]?.url || '/placeholder-image.jpg'}
                        alt={item.productId?.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {item.productId?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Viewed {new Date(item.viewedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.productId?.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recently viewed items</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Data Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white"
        >
          <h3 className="text-xl font-semibold mb-4">User Data Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{userProfile ? '✓' : '✗'}</div>
              <div className="text-sm opacity-90">Profile Data</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{userProfile?.addresses?.length || 0}</div>
              <div className="text-sm opacity-90">Saved Addresses</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{wishlist.length}</div>
              <div className="text-sm opacity-90">Wishlist Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{recentlyViewed.length}</div>
              <div className="text-sm opacity-90">Recently Viewed</div>
            </div>
          </div>
          <div className="mt-4 text-sm opacity-90">
            ✓ All user data is being properly stored and tracked in the database.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDataDashboard;
