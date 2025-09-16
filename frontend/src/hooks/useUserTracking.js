import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userDataService from '../services/userDataService';

// Custom hook for user data tracking
export const useUserTracking = () => {
  const { isAuthenticated, user } = useAuth();

  // Track page navigation
  const trackPageView = useCallback((pageName, additionalData = {}) => {
    if (isAuthenticated) {
      userDataService.trackPageNavigation(pageName);
      
      // Track additional page-specific data
      if (additionalData) {
        userDataService.trackUserAction('PAGE_VIEW_DATA', {
          page: pageName,
          ...additionalData
        });
      }
    }
  }, [isAuthenticated]);

  // Track product interactions
  const trackProductView = useCallback(async (productId, productData = {}) => {
    if (isAuthenticated) {
      await userDataService.trackProductView(productId, productData);
    }
  }, [isAuthenticated]);

  // Track user actions
  const trackAction = useCallback((actionType, data = {}) => {
    if (isAuthenticated) {
      userDataService.trackUserAction(actionType, {
        userId: user?.id,
        timestamp: new Date(),
        ...data
      });
    }
  }, [isAuthenticated, user?.id]);

  // Track cart actions
  const trackCartAction = useCallback((action, product = {}) => {
    if (isAuthenticated) {
      trackAction('CART_ACTION', {
        action, // 'add', 'remove', 'update_quantity'
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: product.quantity
      });
    }
  }, [isAuthenticated, trackAction]);

  // Track search actions
  const trackSearch = useCallback((searchTerm, resultsCount = 0) => {
    if (isAuthenticated) {
      trackAction('SEARCH', {
        searchTerm,
        resultsCount,
        timestamp: new Date()
      });
    }
  }, [isAuthenticated, trackAction]);

  // Track filter usage
  const trackFilter = useCallback((filterType, filterValue) => {
    if (isAuthenticated) {
      trackAction('FILTER_USAGE', {
        filterType,
        filterValue,
        timestamp: new Date()
      });
    }
  }, [isAuthenticated, trackAction]);

  // Track wishlist actions
  const trackWishlistAction = useCallback((action, productId) => {
    if (isAuthenticated) {
      trackAction('WISHLIST_ACTION', {
        action, // 'add', 'remove'
        productId,
        timestamp: new Date()
      });
    }
  }, [isAuthenticated, trackAction]);

  // Track order-related actions
  const trackOrderAction = useCallback((action, orderData = {}) => {
    if (isAuthenticated) {
      trackAction('ORDER_ACTION', {
        action, // 'initiate', 'complete', 'cancel'
        orderId: orderData.orderId,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        timestamp: new Date()
      });
    }
  }, [isAuthenticated, trackAction]);

  // Update user preferences
  const updatePreferences = useCallback(async (preferences) => {
    if (isAuthenticated) {
      try {
        await userDataService.updatePreferences(preferences);
        trackAction('PREFERENCES_UPDATE', { preferences });
      } catch (error) {
        console.error('Error updating preferences:', error);
      }
    }
  }, [isAuthenticated, trackAction]);

  // Get user profile with all data
  const getUserProfile = useCallback(async () => {
    if (isAuthenticated) {
      try {
        return await userDataService.getUserProfile();
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    }
    return null;
  }, [isAuthenticated]);

  // Track time spent on page
  useEffect(() => {
    let startTime = new Date();
    
    return () => {
      if (isAuthenticated) {
        const timeSpent = Math.round((new Date() - startTime) / 1000);
        trackAction('PAGE_TIME', {
          timeSpent,
          page: window.location.pathname
        });
      }
    };
  }, [isAuthenticated, trackAction]);

  return {
    trackPageView,
    trackProductView,
    trackAction,
    trackCartAction,
    trackSearch,
    trackFilter,
    trackWishlistAction,
    trackOrderAction,
    updatePreferences,
    getUserProfile,
    isTrackingEnabled: isAuthenticated
  };
};

// Hook for tracking specific components
export const useComponentTracking = (componentName) => {
  const { trackAction, isTrackingEnabled } = useUserTracking();

  useEffect(() => {
    if (isTrackingEnabled) {
      trackAction('COMPONENT_MOUNT', { componentName });
      
      return () => {
        trackAction('COMPONENT_UNMOUNT', { componentName });
      };
    }
  }, [componentName, trackAction, isTrackingEnabled]);

  const trackComponentAction = useCallback((action, data = {}) => {
    if (isTrackingEnabled) {
      trackAction('COMPONENT_ACTION', {
        componentName,
        action,
        ...data
      });
    }
  }, [componentName, trackAction, isTrackingEnabled]);

  return {
    trackComponentAction,
    isTrackingEnabled
  };
};

// Hook for tracking form interactions
export const useFormTracking = (formName) => {
  const { trackAction, isTrackingEnabled } = useUserTracking();

  const trackFormStart = useCallback(() => {
    if (isTrackingEnabled) {
      trackAction('FORM_START', { formName });
    }
  }, [formName, trackAction, isTrackingEnabled]);

  const trackFormSubmit = useCallback((success = true, errors = []) => {
    if (isTrackingEnabled) {
      trackAction('FORM_SUBMIT', {
        formName,
        success,
        errors: errors.length > 0 ? errors : undefined
      });
    }
  }, [formName, trackAction, isTrackingEnabled]);

  const trackFormField = useCallback((fieldName, action = 'focus') => {
    if (isTrackingEnabled) {
      trackAction('FORM_FIELD_INTERACTION', {
        formName,
        fieldName,
        action // 'focus', 'blur', 'change'
      });
    }
  }, [formName, trackAction, isTrackingEnabled]);

  const trackFormError = useCallback((fieldName, error) => {
    if (isTrackingEnabled) {
      trackAction('FORM_ERROR', {
        formName,
        fieldName,
        error
      });
    }
  }, [formName, trackAction, isTrackingEnabled]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFormField,
    trackFormError,
    isTrackingEnabled
  };
};

export default useUserTracking;
