import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon, 
  ShoppingBagIcon, 
  HeartIcon, 
  CogIcon,
  TruckIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || ''
  });

  const tabs = [
    { id: 'orders', name: 'Orders', icon: ShoppingBagIcon },
    { id: 'wishlist', name: 'Wishlist', icon: HeartIcon },
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ];

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setOrders([
          {
            id: 'UJ1703145600000',
            date: '2024-12-21',
            status: 'delivered',
            total: 45999,
            items: [
              {
                id: 1,
                name: 'Elegant Diamond Necklace',
                price: 45999,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'
              }
            ]
          },
          {
            id: 'UJ1703059200000',
            date: '2024-12-20',
            status: 'shipped',
            total: 12999,
            items: [
              {
                id: 2,
                name: 'Gold Pearl Earrings',
                price: 12999,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400'
              }
            ]
          },
          {
            id: 'UJ1702972800000',
            date: '2024-12-19',
            status: 'processing',
            total: 28999,
            items: [
              {
                id: 3,
                name: 'Diamond Tennis Bracelet',
                price: 28999,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400'
              }
            ]
          }
        ]);

        setWishlist([
          {
            id: 4,
            name: 'Emerald Ring Collection',
            price: 35999,
            originalPrice: 42999,
            image: 'https://images.unsplash.com/photo-1596944924591-1aa7b83b7b3d?w=400',
            inStock: true
          },
          {
            id: 5,
            name: 'Ruby Pendant Set',
            price: 22999,
            originalPrice: 26999,
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
            inStock: false
          }
        ]);

        setIsLoading(false);
      }, 1000);
    };

    fetchUserData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'shipped':
        return <TruckIcon className="h-5 w-5" />;
      case 'processing':
        return <div className="h-5 w-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />;
      case 'cancelled':
        return <XMarkIcon className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
      setEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlist(wishlist.filter(item => item.id !== productId));
    toast.success('Removed from wishlist');
  };

  const downloadInvoice = (orderId) => {
    // Simulate invoice download
    toast.success('Invoice downloaded');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-8">
            <div className="animate-pulse">
              <div className="flex space-x-4 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded w-24" />
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-gold-600 px-6 py-8">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-white">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-primary-100">Manage your account and orders</p>
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Orders tab */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Orders</h2>
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-gray-900">Order #{order.id}</h3>
                            <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </span>
                            <div className="flex space-x-2">
                              <button className="text-primary-600 hover:text-primary-500 p-1">
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button 
                                onClick={() => downloadInvoice(order.id)}
                                className="text-primary-600 hover:text-primary-500 p-1"
                              >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-4">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-16 w-16 rounded-md object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">NPR {item.price.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                          <span className="font-medium text-gray-900">Total: NPR {order.total.toLocaleString()}</span>
                          {order.status === 'delivered' && (
                            <button className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                              Leave Review
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Wishlist tab */}
              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Wishlist</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-48 object-cover"
                          />
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                          >
                            <XMarkIcon className="h-4 w-4 text-gray-400" />
                          </button>
                          {!item.inStock && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white font-medium">Out of Stock</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 mb-2">{item.name}</h3>
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-lg font-bold text-gray-900">NPR {item.price.toLocaleString()}</span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">NPR {item.originalPrice.toLocaleString()}</span>
                            )}
                          </div>
                          <button
                            disabled={!item.inStock}
                            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {item.inStock ? 'Add to Cart' : 'Notify When Available'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Profile tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                    <button
                      onClick={() => setEditingProfile(!editingProfile)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                    >
                      {editingProfile ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>

                  {editingProfile ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">First Name</label>
                          <input
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Last Name</label>
                          <input
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone</label>
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                          <input
                            type="date"
                            value={profileData.dateOfBirth}
                            onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Gender</label>
                          <select
                            value={profileData.gender}
                            onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProfile(false)}
                          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <p className="mt-1 text-sm text-gray-900">{user?.firstName || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <p className="mt-1 text-sm text-gray-900">{user?.lastName || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{user?.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Member Since</label>
                        <p className="mt-1 text-sm text-gray-900">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Settings tab */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h2>
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-medium text-gray-900 mb-4">Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Email notifications</p>
                            <p className="text-sm text-gray-500">Receive order updates via email</p>
                          </div>
                          <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">SMS notifications</p>
                            <p className="text-sm text-gray-500">Receive order updates via SMS</p>
                          </div>
                          <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Marketing emails</p>
                            <p className="text-sm text-gray-500">Receive promotional offers and updates</p>
                          </div>
                          <input type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-medium text-gray-900 mb-4">Security</h3>
                      <div className="space-y-4">
                        <button className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                          Change Password
                        </button>
                        <button className="text-primary-600 hover:text-primary-500 text-sm font-medium block">
                          Enable Two-Factor Authentication
                        </button>
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                      <h3 className="font-medium text-red-900 mb-4">Danger Zone</h3>
                      <p className="text-sm text-red-700 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
