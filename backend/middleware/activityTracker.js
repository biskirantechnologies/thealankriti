const User = require('../models/User');

// Middleware to track user activity
const trackUserActivity = async (req, res, next) => {
  // Only track for authenticated users
  if (req.user && req.user.id) {
    try {
      const user = await User.findById(req.user.id);
      
      if (user && user.activity && user.activity.sessionData && user.activity.sessionData.currentSession) {
        // Update last activity
        user.activity.sessionData.currentSession.lastActivity = new Date();
        
        // Increment page views for GET requests
        if (req.method === 'GET') {
          user.activity.sessionData.currentSession.pageViews += 1;
        }
        
        // Track specific actions
        const action = `${req.method} ${req.path}`;
        if (!user.activity.sessionData.currentSession.actions) {
          user.activity.sessionData.currentSession.actions = [];
        }
        
        user.activity.sessionData.currentSession.actions.push(action);
        
        // Keep only last 50 actions to prevent excessive data
        if (user.activity.sessionData.currentSession.actions.length > 50) {
          user.activity.sessionData.currentSession.actions = 
            user.activity.sessionData.currentSession.actions.slice(-50);
        }
        
        // Save activity data (don't block the request if save fails)
        user.save().catch(err => console.error('Activity tracking error:', err));
      }
    } catch (error) {
      console.error('Activity tracking middleware error:', error);
    }
  }
  
  next();
};

// Track specific user actions
const trackUserAction = (actionType) => {
  return async (req, res, next) => {
    if (req.user && req.user.id) {
      try {
        const user = await User.findById(req.user.id);
        
        if (user) {
          // Initialize activity structure if not exists
          if (!user.activity) {
            user.activity = {
              loginCount: 0,
              totalOrders: 0,
              totalSpent: 0,
              averageOrderValue: 0,
              lastViewedProducts: [],
              wishlist: [],
              browsingHistory: [],
              sessionData: {
                currentSession: {
                  startTime: new Date(),
                  lastActivity: new Date(),
                  pageViews: 0,
                  actions: []
                }
              }
            };
          }
          
          // Track the specific action
          const actionData = {
            type: actionType,
            timestamp: new Date(),
            details: {
              path: req.path,
              method: req.method,
              body: req.method === 'POST' ? req.body : undefined,
              query: req.query
            }
          };
          
          if (!user.activity.sessionData.currentSession.actions) {
            user.activity.sessionData.currentSession.actions = [];
          }
          
          user.activity.sessionData.currentSession.actions.push(JSON.stringify(actionData));
          
          // Update last activity
          user.activity.sessionData.currentSession.lastActivity = new Date();
          
          await user.save();
        }
      } catch (error) {
        console.error(`Error tracking ${actionType} action:`, error);
      }
    }
    next();
  };
};

// Track product views
const trackProductView = async (req, res, next) => {
  if (req.user && req.user.id && req.params.id) {
    try {
      const user = await User.findById(req.user.id);
      
      if (user) {
        if (!user.activity) {
          user.activity = {
            lastViewedProducts: []
          };
        }
        
        if (!user.activity.lastViewedProducts) {
          user.activity.lastViewedProducts = [];
        }
        
        // Remove existing view of this product
        user.activity.lastViewedProducts = user.activity.lastViewedProducts.filter(
          item => item.productId.toString() !== req.params.id
        );
        
        // Add new view at the beginning
        user.activity.lastViewedProducts.unshift({
          productId: req.params.id,
          viewedAt: new Date()
        });
        
        // Keep only last 20 viewed products
        if (user.activity.lastViewedProducts.length > 20) {
          user.activity.lastViewedProducts = user.activity.lastViewedProducts.slice(0, 20);
        }
        
        await user.save();
      }
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  }
  
  next();
};

module.exports = {
  trackUserActivity,
  trackUserAction,
  trackProductView
};
