const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');

// @route   GET /api/users/profile
// @desc    Get user profile with complete data
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's order statistics
    const orderStats = await Order.aggregate([
      { $match: { customer: req.user.id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber status pricing.total createdAt');

    const userProfile = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      statistics: {
        totalOrders: orderStats[0]?.totalOrders || 0,
        totalSpent: orderStats[0]?.totalSpent || 0,
        averageOrderValue: orderStats[0]?.averageOrderValue || 0
      },
      recentOrders: recentOrders
    };

    res.json({ 
      success: true,
      user: userProfile 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, addresses } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic profile fields
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone ? phone.trim() : '';

    // Update addresses if provided
    if (addresses && Array.isArray(addresses)) {
      user.addresses = addresses.map(addr => ({
        type: addr.type || 'shipping',
        street: addr.street?.trim() || '',
        city: addr.city?.trim() || '',
        state: addr.state?.trim() || '',
        zipCode: addr.zipCode?.trim() || '',
        country: addr.country?.trim() || 'India',
        isDefault: Boolean(addr.isDefault)
      }));
    }

    await user.save();

    // Return updated user data (excluding password)
    const updatedUser = await User.findById(req.user.id).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        role: updatedUser.role,
        addresses: updatedUser.addresses,
        lastLogin: updatedUser.lastLogin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// @route   POST /api/users/addresses
// @desc    Add new address
// @access  Private
router.post('/addresses', auth, async (req, res) => {
  try {
    const { type, street, city, state, zipCode, country, isDefault } = req.body;

    if (!street || !city || !state || !zipCode) {
      return res.status(400).json({ 
        message: 'Street, city, state, and zip code are required' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If this is set as default, unset other defaults of the same type
    if (isDefault) {
      user.addresses.forEach(addr => {
        if (addr.type === type) {
          addr.isDefault = false;
        }
      });
    }

    // Add new address
    user.addresses.push({
      type: type || 'shipping',
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: country?.trim() || 'India',
      isDefault: Boolean(isDefault)
    });

    await user.save();

    res.json({
      success: true,
      message: 'Address added successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ message: 'Server error while adding address' });
  }
});

// @route   PUT /api/users/addresses/:addressId
// @desc    Update address
// @access  Private
router.put('/addresses/:addressId', auth, async (req, res) => {
  try {
    const { type, street, city, state, zipCode, country, isDefault } = req.body;
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If this is set as default, unset other defaults of the same type
    if (isDefault && !address.isDefault) {
      user.addresses.forEach(addr => {
        if (addr.type === (type || address.type) && addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    // Update address fields
    if (type) address.type = type;
    if (street) address.street = street.trim();
    if (city) address.city = city.trim();
    if (state) address.state = state.trim();
    if (zipCode) address.zipCode = zipCode.trim();
    if (country) address.country = country.trim();
    if (isDefault !== undefined) address.isDefault = Boolean(isDefault);

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Server error while updating address' });
  }
});

// @route   DELETE /api/users/addresses/:addressId
// @desc    Delete address
// @access  Private
router.delete('/addresses/:addressId', auth, async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Remove address
    user.addresses.pull(addressId);
    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Server error while deleting address' });
  }
});

// @route   GET /api/users/orders
// @desc    Get user's orders with pagination
// @access  Private
router.get('/orders', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    // Build query
    const query = { customer: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.product', 'name images sku')
        .select('-customerInfo.password'),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get comprehensive order statistics
    const orderStats = await Order.aggregate([
      { $match: { customer: req.user.id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('orderNumber status pricing.total createdAt');

    // Get order trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orderTrends = await Order.aggregate([
      { 
        $match: { 
          customer: req.user.id,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          total: { $sum: '$pricing.total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      completedOrders: 0
    };

    res.json({
      success: true,
      dashboard: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          lastLogin: user.activity?.lastLogin || user.lastLogin,
          memberSince: user.createdAt
        },
        statistics: stats,
        recentOrders: recentOrders,
        orderTrends: orderTrends,
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
});

// @route   POST /api/users/wishlist
// @desc    Add product to wishlist
// @access  Private
router.post('/wishlist', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.addToWishlist(productId);

    res.json({
      success: true,
      message: 'Product added to wishlist',
      wishlistCount: user.activity.wishlist.length
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error while adding to wishlist' });
  }
});

// @route   DELETE /api/users/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/wishlist/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.removeFromWishlist(productId);

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      wishlistCount: user.activity.wishlist.length
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error while removing from wishlist' });
  }
});

// @route   GET /api/users/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/wishlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('activity.wishlist.productId', 'name price images sku isActive')
      .select('activity.wishlist');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out inactive products
    const activeWishlistItems = user.activity.wishlist.filter(
      item => item.productId && item.productId.isActive !== false
    );

    res.json({
      success: true,
      wishlist: activeWishlistItems,
      count: activeWishlistItems.length
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error while fetching wishlist' });
  }
});

// @route   POST /api/users/recently-viewed
// @desc    Add product to recently viewed
// @access  Private
router.post('/recently-viewed', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.addToRecentlyViewed(productId);

    res.json({
      success: true,
      message: 'Product added to recently viewed'
    });
  } catch (error) {
    console.error('Add to recently viewed error:', error);
    res.status(500).json({ message: 'Server error while adding to recently viewed' });
  }
});

// @route   GET /api/users/recently-viewed
// @desc    Get user's recently viewed products
// @access  Private
router.get('/recently-viewed', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const user = await User.findById(req.user.id)
      .populate('activity.lastViewedProducts.productId', 'name price images sku isActive')
      .select('activity.lastViewedProducts');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out inactive products and apply limit
    const activeRecentlyViewed = user.activity.lastViewedProducts
      .filter(item => item.productId && item.productId.isActive !== false)
      .slice(0, limit);

    res.json({
      success: true,
      recentlyViewed: activeRecentlyViewed,
      count: activeRecentlyViewed.length
    });
  } catch (error) {
    console.error('Get recently viewed error:', error);
    res.status(500).json({ message: 'Server error while fetching recently viewed products' });
  }
});

module.exports = router;
