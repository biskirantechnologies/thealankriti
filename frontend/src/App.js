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
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isLoading, isAdmin } = useAuth();
  
  // Debug logging
  console.log('🛡️ AdminRoute check:', { 
    user: user ? { id: user.id, email: user.email, role: user.role } : null, 
    isLoading, 
    isAdmin: isAdmin(), 
    userRole: user?.role,
    timestamp: new Date().toISOString()
  });
  
  if (isLoading) {
    console.log('⏳ AdminRoute: Loading...');
    return <LoadingSpinner />;
  }
  
  if (!user || !isAdmin()) {
    console.log('🚫 AdminRoute: Access denied - redirecting to home');
    console.log('   - User exists:', !!user);
    console.log('   - User role:', user?.role);
    console.log('   - isAdmin():', isAdmin());
    return <Navigate to="/" replace />;
  }
  
  console.log('✅ AdminRoute: Access granted - rendering admin content');
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