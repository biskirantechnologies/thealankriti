import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, setAuthToken } from '../services/api';
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

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = Cookies.get('token');
      
      if (token) {
        dispatch({ type: AuthActionTypes.LOAD_USER_START });
        setAuthToken(token);
        
        try {
          const response = await authAPI.getCurrentUser();
          dispatch({
            type: AuthActionTypes.LOAD_USER_SUCCESS,
            payload: response.data.user,
          });
        } catch (error) {
          console.error('Failed to load user:', error);
          // Clear invalid token
          Cookies.remove('token');
          setAuthToken(null);
          dispatch({
            type: AuthActionTypes.LOAD_USER_FAILURE,
            payload: 'Failed to authenticate user',
          });
        }
      } else {
        dispatch({
          type: AuthActionTypes.LOAD_USER_FAILURE,
          payload: null,
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (credentials, isAdmin = false) => {
    dispatch({ type: AuthActionTypes.LOGIN_START });
    
    try {
      const endpoint = isAdmin ? authAPI.adminLogin : authAPI.login;
      const response = await endpoint(credentials);
      
      const { user, token } = response.data;
      
      // Store token
      setAuthToken(token);
      
      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: { user, token },
      });
      
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
      } catch (trackingError) {
        console.error('Error initializing user tracking:', trackingError);
        // Don't fail login if tracking fails
      }
      
      return { success: true, user };
    } catch (error) {
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

  // Logout function
  const logout = () => {
    // Clear token
    setAuthToken(null);
    
    // Clear user data from localStorage if any
    localStorage.removeItem('user');
    
    dispatch({ type: AuthActionTypes.LOGOUT });
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
