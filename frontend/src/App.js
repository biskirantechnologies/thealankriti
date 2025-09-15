import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout/Layout';
import { useAuth } from './contexts/AuthContext';

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
  const { user, loading, isAdmin } = useAuth();
  
  // Enhanced debug logging
  console.log('AdminRoute check:', { 
    user, 
    loading, 
    isAdmin: isAdmin(), 
    userRole: user?.role,
    isAuthenticated: !!user,
    fullUser: JSON.stringify(user)
  });
  
  if (loading) {
    console.log('AdminRoute: Still loading...');
    return <LoadingSpinner />;
  }
  
  if (!user) {
    console.log('AdminRoute: No user - redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  if (!isAdmin()) {
    console.log('AdminRoute: User is not admin - redirecting to home', user);
    return <Navigate to="/" replace />;
  }
  
  console.log('AdminRoute: Access granted - showing admin dashboard');
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

// Simple placeholder components for missing pages
const Cart = React.lazy(() => import('./pages/Cart'));
const Orders = () => <div className="p-8">My Orders - Coming Soon</div>;
const OrderDetail = () => <div className="p-8">Order Detail - Coming Soon</div>;
const TrackOrder = () => <div className="p-8">Track Order - Coming Soon</div>;
const Profile = () => <div className="p-8">Profile Page - Coming Soon</div>;
const NotFound = () => <div className="p-8">404 - Page Not Found</div>;

function App() {
  return (
    <>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
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
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
        <Toaster position="top-right" />
    </>
  );
}

export default App;