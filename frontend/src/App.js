import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout/Layout';
import { useAuth } from './contexts/AuthContext';
import SessionManager from './components/SessionManager';

// Simple components for missing imports
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isLoading, isAdmin } = useAuth();
  const [waitingForAuth, setWaitingForAuth] = React.useState(true);
  
  // Give auth context time to load after admin login
  React.useEffect(() => {
    const timer = setTimeout(() => {
      console.log('⏰ AdminRoute: Wait period ended');
      setWaitingForAuth(false);
    }, 2000); // Increased to 2 seconds for more stability
    
    return () => clearTimeout(timer);
  }, []);
  
  // Enhanced debug logging
  console.log('🛡️ AdminRoute check:', { 
    user: user ? { id: user.id, email: user.email, role: user.role } : null, 
    isLoading, 
    isAdmin: typeof isAdmin === 'function' ? isAdmin() : 'NOT_FUNCTION',
    userRole: user?.role,
    waitingForAuth,
    authState: {
      hasToken: !!localStorage.getItem('authToken'),
      hasUser: !!localStorage.getItem('user'),
      hasAuthState: !!localStorage.getItem('authState')
    },
    timestamp: new Date().toISOString()
  });
  
  if (isLoading || waitingForAuth) {
    console.log('⏳ AdminRoute: Loading... (isLoading:', isLoading, ', waitingForAuth:', waitingForAuth, ')');
    return <LoadingSpinner />;
  }
  
  // Check for admin role - prioritize AuthContext over localStorage
  let isUserAdmin = false;
  
  // Primary check: AuthContext user (most reliable)
  if (user && (user.role === 'admin' || user.role === 'super_admin' || (typeof isAdmin === 'function' && isAdmin()))) {
    isUserAdmin = true;
  }
  
  // Only use localStorage backup if user exists but role check failed
  // This prevents logout issues by not overriding auth context
  if (!isUserAdmin && user) {
    try {
      const storedUser = localStorage.getItem('user');
      const storedAuthState = localStorage.getItem('authState');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.role === 'admin' || userData.role === 'super_admin') {
          isUserAdmin = true;
          console.log('✅ AdminRoute: Access granted via localStorage backup check');
        }
      }
      
      if (!isUserAdmin && storedAuthState) {
        const authData = JSON.parse(storedAuthState);
        if (authData.user && (authData.user.role === 'admin' || authData.user.role === 'super_admin')) {
          isUserAdmin = true;
          console.log('✅ AdminRoute: Access granted via authState backup check');
        }
      }
    } catch (error) {
      console.error('Error checking localStorage for admin status:', error);
    }
  }
  
  if (!isUserAdmin) {
    console.error('🚫 AdminRoute: Access DENIED - redirecting to admin login');
    console.error('   - User exists:', !!user);
    console.error('   - User role:', user?.role);
    console.error('   - isAdmin() result:', typeof isAdmin === 'function' ? isAdmin() : 'NOT_FUNCTION');
    console.error('   - localStorage checks failed');
    
    return <Navigate to="/admin-login" replace />;
  }
  
  console.log('✅ AdminRoute: Access GRANTED - rendering admin content');
  return children;
};

const ScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
};

// Lazy load components
const HomePage = React.lazy(() => import('./pages/HomePage'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const OrderSuccess = React.lazy(() => import('./pages/OrderSuccess'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Collections = React.lazy(() => import('./pages/Collections'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));

// Auth pages
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const AdminLogin = React.lazy(() => import('./pages/auth/AdminLogin'));

// Admin components
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard2'));
const AdminProducts = React.lazy(() => import('./components/admin/AdminProducts'));
const AdminOrders = React.lazy(() => import('./components/admin/AdminOrders'));
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));

// Simple placeholder components for missing pages
const Cart = React.lazy(() => import('./pages/Cart'));
const Orders = () => <div className="p-8">My Orders - Coming Soon</div>;
const OrderDetail = () => <div className="p-8">Order Detail - Coming Soon</div>;
const TrackOrder = () => <div className="p-8">Track Order - Coming Soon</div>;
const Profile = () => <div className="p-8">Profile Page - Coming Soon</div>;
const NotFound = () => <div className="p-8">404 - Page Not Found</div>;
const AdminCustomers = () => <div className="p-8">Admin Customers - Coming Soon</div>;
const AdminAnalytics = () => <div className="p-8">Admin Analytics - Coming Soon</div>;

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Admin Routes - Use AdminLayout instead of regular Layout */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          } />
          
          {/* All other routes use regular Layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/track-order" element={<TrackOrder />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                
                {/* Protected Routes */}
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/order-success/:orderId" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Suspense>
      <Toaster position="top-right" />
      <SessionManager />
    </>
  );
}

export default App;