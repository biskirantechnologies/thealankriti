import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://thealankriti-backendd.onrender.com/api'),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Network error (no response)
    if (!response) {
      console.error('Network Error:', error.message);
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your connection.');
      } else if (error.message.includes('Network Error')) {
        toast.error('Unable to connect to server. Please check your internet connection.');
      } else {
        toast.error('Network error. Please try again.');
      }
      return Promise.reject(error);
    }
    
    if (response?.status === 401) {
      // Check if it's a token expired error
      const errorMessage = response?.data?.message || '';
      const isTokenExpired = errorMessage.includes('Token expired') || errorMessage.includes('expired');
      
      // Unauthorized - clear token and redirect to appropriate login
      Cookies.remove('token');
      localStorage.removeItem('user');
      localStorage.removeItem('authState');
      
      // Determine redirect based on current path
      const currentPath = window.location.pathname;
      const isAdminPath = currentPath.includes('/admin');
      
      // Only show toast and redirect if not already on login page
      if (!currentPath.includes('/login') && !currentPath.includes('/admin-login')) {
        if (isTokenExpired) {
          toast.error('Your session has expired. Please login again.');
        } else {
          toast.error('Authentication required. Please login.');
        }
        
        // Redirect to appropriate login page
        if (isAdminPath) {
          window.location.href = '/#/admin-login';
        } else {
          window.location.href = '/#/login';
        }
      }
    } else if (response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  adminLogin: (credentials) => api.post('/auth/admin-login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// Products API
export const productsAPI = {
  getProducts: (params = {}) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: (limit = 8) => api.get(`/products/featured?limit=${limit}`),
  getTrendingProducts: (limit = 8) => api.get(`/products/trending?limit=${limit}`),
  getCategories: () => api.get('/products/categories'),
  getFilters: () => api.get('/products/filters'),
  addReview: (productId, reviewData) => api.post(`/products/${productId}/reviews`, reviewData),
  
  // Admin only
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Orders API
// Order APIs
export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (params = {}) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  trackOrder: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
};

// User Profile APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  getDashboard: () => api.get('/users/dashboard'),
  
  // Address management
  addAddress: (addressData) => api.post('/users/addresses', addressData),
  updateAddress: (addressId, addressData) => api.put(`/users/addresses/${addressId}`, addressData),
  deleteAddress: (addressId) => api.delete(`/users/addresses/${addressId}`),
  
  // User orders
  getUserOrders: (params = {}) => api.get('/users/orders', { params }),
  getOrders: (params = {}) => api.get('/users/orders', { params }),
  
  // Wishlist management
  addToWishlist: (productId) => api.post('/users/wishlist', { productId }),
  removeFromWishlist: (productId) => api.delete(`/users/wishlist/${productId}`),
  getWishlist: () => api.get('/users/wishlist'),
  
  // Recently viewed
  addToRecentlyViewed: (productId) => api.post('/users/recently-viewed', { productId }),
  getRecentlyViewed: () => api.get('/users/recently-viewed'),
};

// Payment API
export const paymentAPI = {
  generateQR: (orderId) => api.post('/payment/generate-qr', { orderId }),
  verifyPayment: (orderId, transactionId) => api.post('/payment/verify', { orderId, transactionId }),
  getPaymentMethods: () => api.get('/payment/methods'),
  getEsewaInfo: () => api.get('/payment/esewa-info'),
  getEsewaApps: () => api.get('/payment/esewa-apps'),
};

// Admin API
export const adminAPI = {
  getDashboard: (period = 30) => api.get(`/admin/dashboard?period=${period}`),
  getOrders: (params = {}) => api.get('/admin/orders', { params }),
  getOrder: (id) => api.get(`/admin/orders/${id}`),
  getOrderById: (id) => api.get(`/admin/orders/${id}`),
  getOrderStats: () => api.get('/admin/orders/stats'),
  updateOrderStatus: (id, statusData) => {
    // Handle both direct status string and status object
    const requestData = typeof statusData === 'string' 
      ? { status: statusData } 
      : statusData;
    return api.put(`/admin/orders/${id}/status`, requestData);
  },
  cancelOrder: (id, reason) => api.put(`/admin/orders/${id}/cancel`, { reason }),
  getProducts: (params = {}) => api.get('/admin/products', { params }),
  getProduct: (id) => api.get(`/admin/products/${id}`),
  createProduct: (productData) => api.post('/admin/products', productData),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  updateStock: (id, stockData) => api.put(`/admin/products/${id}/stock`, stockData),
  getCustomers: (params = {}) => api.get('/admin/customers', { params }),
  getCustomer: (id) => api.get(`/admin/customers/${id}`),
  getAnalytics: (params = {}) => api.get('/admin/analytics', { params }),
  exportOrders: (params = {}) => api.get('/admin/orders/export', { params, responseType: 'blob' }),
  sendOrderEmail: (orderId, data = {}) => api.post(`/admin/orders/${orderId}/email`, data),
  // Bulk update orders
  bulkUpdateOrders: (data) => api.put('/admin/orders/bulk-update', data),

  // Customer management
  getCustomerById: (id) => api.get(`/admin/customers/${id}`),
  getCustomerStats: () => api.get('/admin/customers/stats'),
  createCustomer: (data) => api.post('/admin/customers', data),
  updateCustomer: (id, data) => api.put(`/admin/customers/${id}`, data),
  updateCustomerStatus: (id, data) => api.put(`/admin/customers/${id}/status`, data),
  deleteCustomer: (id) => api.delete(`/admin/customers/${id}`),
  
  getStats: () => api.get('/admin/stats'),
};

// Utility functions
export const handleAPIError = (error, defaultMessage = 'Something went wrong') => {
  const message = error.response?.data?.message || error.message || defaultMessage;
  toast.error(message);
  return message;
};

export const setAuthToken = (token) => {
  if (token) {
    // Set cookie with extended expiration and secure settings
    const cookieOptions = { 
      expires: 30, // 30 days instead of 7
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax' // Better security
    };
    Cookies.set('token', token, cookieOptions);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Store comprehensive auth data
    const authData = {
      token: token,
      setTime: new Date().getTime(),
      userAgent: navigator.userAgent,
      sessionId: Math.random().toString(36).substr(2, 9)
    };
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('tokenSetTime', authData.setTime.toString());
    localStorage.setItem('authData', JSON.stringify(authData));
    
    console.log('🔐 Token stored successfully:', { 
      tokenLength: token.length, 
      expiresIn: '30 days',
      timestamp: new Date().toISOString() 
    });
  } else {
    console.log('🧹 Clearing all authentication data...');
    Cookies.remove('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenSetTime');
    localStorage.removeItem('authState');
    localStorage.removeItem('authData');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Enhanced token validation helper
export const isTokenValid = () => {
  const token = Cookies.get('token') || localStorage.getItem('authToken');
  const tokenSetTime = localStorage.getItem('tokenSetTime');
  
  if (!token || !tokenSetTime) {
    console.log('❌ Token validation failed: No token or timestamp found');
    return false;
  }
  
  // Check token format
  if (token === 'undefined' || token === 'null' || token.length < 50) {
    console.log('❌ Token validation failed: Invalid token format');
    return false;
  }
  
  // For now, assume tokens are valid for 30 days from our enhanced system
  // This provides compatibility with both old and new backend versions
  const tokenAge = new Date().getTime() - parseInt(tokenSetTime);
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  
  const isValid = tokenAge < thirtyDaysInMs;
  
  if (!isValid) {
    console.log('⏰ Token validation failed: Token expired', {
      tokenAge: Math.floor(tokenAge / (24 * 60 * 60 * 1000)) + ' days',
      maxAge: '30 days'
    });
  } else {
    const daysOld = Math.floor(tokenAge / (24 * 60 * 60 * 1000));
    console.log('✅ Token is valid:', {
      age: daysOld + ' days old',
      remaining: (30 - daysOld) + ' days left'
    });
  }
  
  return isValid;
};

// Add token refresh helper
export const refreshAuthState = () => {
  const token = Cookies.get('token') || localStorage.getItem('authToken');
  
  if (token && isTokenValid()) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return token;
  } else {
    // Clear invalid token
    setAuthToken(null);
    return null;
  }
};

export default api;
