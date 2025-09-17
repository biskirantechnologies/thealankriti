import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, setAuthToken, isTokenValid, refreshAuthState } from '../services/api';
import userDataService from '../services/userDataService';
import Cookies from 'js-cookie';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AuthActionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN_START:
    case AuthActionTypes.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AuthActionTypes.LOAD_USER_SUCCESS:
    case AuthActionTypes.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AuthActionTypes.LOGIN_FAILURE:
    case AuthActionTypes.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AuthActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start with improved token handling
  useEffect(() => {
    const loadUser = async () => {
      console.log('🔄 AuthContext: Loading user on app start...');
      
      // Try to refresh auth state first
      const token = refreshAuthState();
      
      if (token && isTokenValid()) {
        dispatch({ type: AuthActionTypes.LOAD_USER_START });
        console.log('🎫 Valid token found, loading user...');
        
        try {
          const response = await authAPI.getCurrentUser();
          console.log('✅ User loaded successfully:', response.data.user);
          
          // Store auth state for persistence
          localStorage.setItem('authState', JSON.stringify({
            user: response.data.user,
            loginTime: new Date().getTime()
          }));
          
          dispatch({
            type: AuthActionTypes.LOAD_USER_SUCCESS,
            payload: response.data.user,
          });
        } catch (error) {
          console.error('❌ Failed to load user:', error);
          console.log('🧹 Clearing invalid authentication...');
          
          // Clear all auth data
          setAuthToken(null);
          dispatch({
            type: AuthActionTypes.LOAD_USER_FAILURE,
            payload: 'Session expired. Please login again.',
          });
        }
      } else {
        console.log('🚫 No valid token found');
        // Try to restore from localStorage if available
        const savedAuthState = localStorage.getItem('authState');
        
        if (savedAuthState) {
          try {
            const authData = JSON.parse(savedAuthState);
            const loginTime = authData.loginTime;
            const currentTime = new Date().getTime();
            const timeDiff = currentTime - loginTime;
            
            // If login was within last 30 days, try to restore session
            if (timeDiff < (30 * 24 * 60 * 60 * 1000)) {
              console.log('🔄 Attempting to restore session from localStorage...');
              
              dispatch({
                type: AuthActionTypes.LOAD_USER_SUCCESS,
                payload: authData.user,
              });
              return;
            }
          } catch (e) {
            console.error('Error parsing saved auth state:', e);
          }
        }
        
        dispatch({
          type: AuthActionTypes.LOAD_USER_FAILURE,
          payload: null,
        });
      }
    };

    loadUser();
    
    // Set up periodic token validation (every 5 minutes)
    const tokenCheckInterval = setInterval(() => {
      const currentToken = Cookies.get('token') || localStorage.getItem('authToken');
      if (currentToken && !isTokenValid()) {
        console.log('⏰ Token expired, clearing session...');
        setAuthToken(null);
        dispatch({ type: AuthActionTypes.LOGOUT });
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(tokenCheckInterval);
  }, []);

  // Enhanced login function with better session management
  const login = async (credentials, isAdmin = false) => {
    console.log(`🔑 AuthContext login started - isAdmin: ${isAdmin}`);
    dispatch({ type: AuthActionTypes.LOGIN_START });
    
    try {
      const endpoint = isAdmin ? authAPI.adminLogin : authAPI.login;
      console.log('📡 Calling API endpoint:', isAdmin ? 'adminLogin' : 'login');
      
      const response = await endpoint(credentials);
      console.log('📥 API response received:', response.data);
      
      const { user, token } = response.data;
      console.log('👤 User data:', user);
      console.log('🎫 Token received:', token ? 'YES' : 'NO');
      
      // Store token with enhanced persistence
      setAuthToken(token);
      
      // Store comprehensive auth state
      const authState = {
        user,
        loginTime: new Date().getTime(),
        isAdmin,
        userAgent: navigator.userAgent,
        sessionId: Math.random().toString(36).substr(2, 9)
      };
      localStorage.setItem('authState', JSON.stringify(authState));
      
      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: { user, token },
      });
      
      console.log('✅ Auth context updated successfully with enhanced session');
      
      // Initialize user data tracking after successful login
      try {
        await userDataService.initializeSession(user);
        await userDataService.trackLogin({
          userId: user.id,
          loginMethod: isAdmin ? 'admin' : 'customer',
          timestamp: new Date()
        });
        
        // Initialize tracking systems
        userDataService.initializeTracking();
        console.log('📊 User tracking initialized');
      } catch (trackingError) {
        console.error('Error initializing user tracking:', trackingError);
        // Don't fail login if tracking fails
      }
      
      return { success: true, user };
    } catch (error) {
      console.error('💥 AuthContext login error:', error);
      console.error('📄 Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AuthActionTypes.LOGIN_START });
    
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data;
      
      // Store token
      setAuthToken(token);
      
      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: { user, token },
      });
      
      // Initialize user data tracking after successful registration
      try {
        await userDataService.initializeSession(user);
        await userDataService.trackLogin({
          userId: user.id,
          loginMethod: 'registration',
          timestamp: new Date()
        });
        
        // Initialize tracking systems
        userDataService.initializeTracking();
      } catch (trackingError) {
        console.error('Error initializing user tracking after registration:', trackingError);
        // Don't fail registration if tracking fails
      }
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Enhanced logout function
  const logout = () => {
    console.log('🚪 Logging out user...');
    
    // Clear all authentication data
    setAuthToken(null);
    
    // Clear all stored data
    localStorage.removeItem('user');
    localStorage.removeItem('authState');
    
    // Clear user tracking session
    try {
      userDataService.clearSession();
    } catch (error) {
      console.error('Error clearing user session:', error);
    }
    
    dispatch({ type: AuthActionTypes.LOGOUT });
    console.log('✅ Logout completed');
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      
      dispatch({
        type: AuthActionTypes.UPDATE_USER,
        payload: response.data.user,
      });
      
      return { success: true, user: response.data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin') || hasRole('super_admin');
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    hasRole,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
