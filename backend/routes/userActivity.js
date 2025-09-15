const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
// const { trackUserAction } = require('../middleware/activityTracker');

// @route   PUT /api/user/activity
// @desc    Update user activity and preferences
// @access  Private
router.put('/activity', auth, async (req, res) => {
  try {
    // Track the activity update action
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (user && user.activity && user.activity.sessionData && user.activity.sessionData.currentSession) {
        if (!user.activity.sessionData.currentSession.actions) {
          user.activity.sessionData.currentSession.actions = [];
        }
        user.activity.sessionData.currentSession.actions.push(`UPDATE_ACTIVITY ${new Date().toISOString()}`);
      }
    }
    
    const {
      browsingData,
      preferences,
      deviceInfo,
      location
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize activity if not exists
    if (!user.activity) {
      user.activity = {
        loginCount: 0,
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        lastViewedProducts: [],
        wishlist: [],
        browsingHistory: [],
        sessionData: {}
      };
    }

    // Update browsing history
    if (browsingData) {
      if (!user.activity.browsingHistory) {
        user.activity.browsingHistory = [];
      }
      
      user.activity.browsingHistory.unshift({
        page: browsingData.page,
        timestamp: new Date(),
        duration: browsingData.duration || 0
      });
      
      // Keep only last 100 browsing records
      if (user.activity.browsingHistory.length > 100) {
        user.activity.browsingHistory = user.activity.browsingHistory.slice(0, 100);
      }
    }

    // Update preferences
    if (preferences) {
      if (!user.activity.sessionData) {
        user.activity.sessionData = {};
      }
      
      if (!user.activity.sessionData.preferences) {
        user.activity.sessionData.preferences = {
          currency: 'NPR',
          language: 'en',
          notifications: {
            email: true,
            sms: false,
            push: true
          }
        };
      }
      
      // Update preferences
      if (preferences.currency) {
        user.activity.sessionData.preferences.currency = preferences.currency;
      }
      
      if (preferences.language) {
        user.activity.sessionData.preferences.language = preferences.language;
      }
      
      if (preferences.notifications) {
        user.activity.sessionData.preferences.notifications = {
          ...user.activity.sessionData.preferences.notifications,
          ...preferences.notifications
        };
      }
    }

    // Store device info
    if (deviceInfo) {
      user.activity.deviceInfo = {
        ...user.activity.deviceInfo,
        lastUsed: new Date(),
        ...deviceInfo
      };
    }

    // Store location data (if provided and user consents)
    if (location) {
      user.activity.locationData = {
        ...user.activity.locationData,
        lastKnown: {
          ...location,
          timestamp: new Date()
        }
      };
    }

    await user.save();

    res.json({
      message: 'User activity updated successfully',
      user: {
        id: user._id,
        activity: user.activity
      }
    });
  } catch (error) {
    console.error('Activity update error:', error);
    res.status(500).json({ message: 'Server error updating activity' });
  }
});

// @route   GET /api/user/profile
// @desc    Get complete user profile with all data
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('activity.lastViewedProducts.productId', 'name price images')
      .populate('activity.wishlist.productId', 'name price images')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: user,
      summary: {
        totalLogins: user.activity?.loginCount || 0,
        totalOrders: user.activity?.totalOrders || 0,
        totalSpent: user.activity?.totalSpent || 0,
        lastLogin: user.activity?.lastLogin,
        recentProducts: user.activity?.lastViewedProducts?.slice(0, 5) || [],
        wishlistCount: user.activity?.wishlist?.length || 0,
        memberSince: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// @route   POST /api/user/track-product-view
// @desc    Track when user views a product
// @access  Private
router.post('/track-product-view', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize activity if not exists
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
      item => item.productId.toString() !== productId
    );

    // Add new view at the beginning
    user.activity.lastViewedProducts.unshift({
      productId: productId,
      viewedAt: new Date()
    });

    // Keep only last 20 viewed products
    if (user.activity.lastViewedProducts.length > 20) {
      user.activity.lastViewedProducts = user.activity.lastViewedProducts.slice(0, 20);
    }

    await user.save();

    res.json({ message: 'Product view tracked successfully' });
  } catch (error) {
    console.error('Product view tracking error:', error);
    res.status(500).json({ message: 'Server error tracking product view' });
  }
});

// @route   POST /api/user/save-session-data
// @desc    Save session data (cart, preferences, etc.)
// @access  Private
router.post('/save-session-data', auth, async (req, res) => {
  try {
    const { sessionData } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize activity if not exists
    if (!user.activity) {
      user.activity = {
        sessionData: {}
      };
    }

    if (!user.activity.sessionData) {
      user.activity.sessionData = {};
    }

    // Merge session data
    user.activity.sessionData = {
      ...user.activity.sessionData,
      ...sessionData,
      lastUpdated: new Date()
    };

    await user.save();

    res.json({ 
      message: 'Session data saved successfully',
      savedData: user.activity.sessionData
    });
  } catch (error) {
    console.error('Session data save error:', error);
    res.status(500).json({ message: 'Server error saving session data' });
  }
});

module.exports = router;
