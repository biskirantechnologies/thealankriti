import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { getApiUrl } from '../../utils/api';
import emergencyAuth from '../../services/emergencyAuth';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAdmin } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  const from = location.state?.from?.pathname || '/admin';

  // Monitor auth context for successful admin login - simplified
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin' || isAdmin()) && !isLoading) {
      console.log('🎯 AdminLogin: Auth context has admin user, redirecting...');
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate]);

  // Enhanced connection check and session restoration
  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(getApiUrl('/health'));
        if (response.ok) {
          const healthData = await response.json();
          console.log('🏥 Backend health:', healthData);
          setConnectionStatus('connected');
          
          // Check if enhanced auth system is available
          if (healthData.features && healthData.features.includes('30-day-tokens')) {
            console.log('✅ Enhanced auth system detected');
          } else {
            console.log('⚠️ Legacy auth system detected');
          }
        } else {
          setConnectionStatus('disconnected');
        }
      } catch (error) {
        console.error('❌ Health check failed:', error);
        setConnectionStatus('disconnected');
      }
    };

    // Check for existing valid session
    const checkExistingSession = async () => {
      console.log('🔍 Checking for existing admin session...');
      const sessionValid = await emergencyAuth.validateSession();
      
      if (sessionValid) {
        const sessionInfo = emergencyAuth.getSessionInfo();
        if (sessionInfo && sessionInfo.isAdmin) {
          console.log('✅ Valid admin session found, redirecting...');
          toast.success('Welcome back! Restoring your admin session...');
          setTimeout(() => {
            navigate('/admin', { replace: true });
          }, 1000);
        }
      }
    };

    checkConnection();
    checkExistingSession();
    
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('� Starting ENHANCED admin login process...');
      console.log('📧 Login credentials:', { email: formData.email, hasPassword: !!formData.password });
      
      // Use standard auth system - more reliable and direct
      const result = await login(formData, true);
      
      console.log('📊 Final login result:', result);
      
      if (result && result.success) {
        console.log('✅ Admin login successful, user role:', result.user?.role);
        toast.success('Admin login successful! Session extended to 30 days.');
        
        // Store additional session info
        localStorage.setItem('adminLoginSuccess', new Date().toISOString());
        localStorage.setItem('sessionType', 'admin');
        
        // Direct navigation - the useEffect will handle this automatically
        // when the auth context updates, no complex async logic needed
        console.log('⏳ Auth context will handle navigation...');
      } else {
        console.error('❌ All login methods failed:', result);
        throw new Error(result?.error || 'Login failed');
      }
    } catch (error) {
      console.error('💥 Admin login error:', error);
      
      // Simplified error handling
      if (error.message && error.message.includes('not authorized')) {
        toast.error('Access denied: Admin privileges required');
      } else if (error.message && error.message.includes('not found')) {
        toast.error('Account not found. Please contact system administrator.');
      } else {
        toast.error(error.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Backend Connected';
      case 'disconnected': return 'Backend Offline';
      default: return 'Connecting...';
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - Ukriti Jewells</title>
        <meta name="description" content="Secure admin access to Ukriti Jewells management system" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Admin Portal
            </h2>
            <p className="text-gray-400 text-sm">
              Secure access to management system
            </p>
            
            {/* Connection Status */}
            <div className={`mt-4 flex items-center justify-center text-xs ${getConnectionStatusColor()}`}>
              <ComputerDesktopIcon className="h-4 w-4 mr-1" />
              {getConnectionStatusText()}
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 shadow-xl">
              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Administrator Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-600 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all duration-200"
                    placeholder="admin@ukritijewells.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Secure Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-600 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all duration-200"
                      placeholder="Enter admin password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || connectionStatus === 'disconnected'}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200 mt-6 ${
                  isLoading || connectionStatus === 'disconnected'
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </div>
                ) : connectionStatus === 'disconnected' ? (
                  'Backend Offline'
                ) : (
                  <>
                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    Access Admin Panel
                  </>
                )}
              </button>
            </div>
          </motion.form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Link
              to="/"
              className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
            >
              ← Back to Store
            </Link>
            
            {/* Security Notice */}
            <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400">
                <span className="text-yellow-400">⚠️ Security Notice:</span> This is a protected admin area. 
                All access attempts are logged and monitored.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
