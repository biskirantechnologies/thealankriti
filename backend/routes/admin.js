const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');
const { sendOrderStatusUpdateWhatsApp } = require('../utils/whatsappService');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Get dashboard stats
    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      dailySales,
      topProducts
    ] = await Promise.all([
      // Total orders
      Order.countDocuments({ createdAt: { $gte: daysAgo } }),
      
      // Total revenue
      Order.aggregate([
        { $match: { 
          createdAt: { $gte: daysAgo },
          'payment.status': 'completed'
        }},
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      
      // Pending orders
      Order.countDocuments({ 
        status: { $in: ['pending', 'confirmed', 'processing'] }
      }),
      
      // Low stock products
      Product.find({ 
        'stock.status': { $in: ['low-stock', 'out-of-stock'] },
        isActive: true 
      }).select('name sku stock'),
      
      // Recent orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('customer', 'firstName lastName email')
        .select('orderNumber customerInfo pricing.total status createdAt'),
      
      // Daily sales for chart
      Order.aggregate([
        { $match: { 
          createdAt: { $gte: daysAgo },
          'payment.status': 'completed'
        }},
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$pricing.total' },
          orders: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]),
      
      // Top products
      Order.aggregate([
        { $match: { 
          createdAt: { $gte: daysAgo },
          'payment.status': 'completed'
        }},
        { $unwind: '$items' },
        { $group: {
          _id: '$items.product',
          name: { $first: '$items.productSnapshot.name' },
          sku: { $first: '$items.productSnapshot.sku' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }},
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      summary: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        lowStockCount: lowStockProducts.length
      },
      lowStockProducts,
      recentOrders,
      dailySales,
      topProducts,
      period: parseInt(period)
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders for admin
// @access  Private/Admin
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
        { 'customerInfo.firstName': { $regex: search, $options: 'i' } },
        { 'customerInfo.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('customer', 'firstName lastName email')
      .select('-items.productSnapshot'); // Exclude for performance

    const totalOrders = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/orders/stats
// @desc    Get order statistics  
// @access  Private/Admin
router.get('/orders/stats', adminAuth, async (req, res) => {
  try {
    // Get basic counts first
    const total = await Order.countDocuments();
    const pending = await Order.countDocuments({ status: 'pending' });
    const confirmed = await Order.countDocuments({ status: 'confirmed' });
    const processing = await Order.countDocuments({ status: 'processing' });
    const shipped = await Order.countDocuments({ status: 'shipped' });
    const delivered = await Order.countDocuments({ status: 'delivered' });
    const cancelled = await Order.countDocuments({ status: 'cancelled' });
    
    // Simple revenue calculation
    let totalRevenue = 0;
    try {
      const revenueResult = await Order.aggregate([
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]);
      totalRevenue = revenueResult[0]?.total || 0;
    } catch (revenueError) {
      console.warn('Revenue calculation failed:', revenueError.message);
    }

    res.json({
      total,
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      totalRevenue
    });
  } catch (error) {
    console.error('Order stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/orders/:id
// @desc    Get order details for admin
// @access  Private/Admin
router.get('/orders/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get admin order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, note, trackingNumber, carrier } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.status;
    order.status = status;

    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note,
      updatedBy: req.user.id
    });

    // Update tracking info if provided
    if (status === 'shipped' && trackingNumber) {
      order.tracking = {
        trackingNumber,
        carrier: carrier || 'Standard Courier',
        trackingUrl: `https://track.example.com/${trackingNumber}`
      };
      
      // Set estimated delivery (7 days from shipping)
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
      order.estimatedDelivery = estimatedDelivery;
    }

    if (status === 'delivered') {
      order.actualDelivery = new Date();
    }

    await order.save();

    // Send WhatsApp notification to customer if phone number available
    if (order.customerInfo.phone && status !== oldStatus) {
      try {
        await sendOrderStatusUpdateWhatsApp(
          order.customerInfo.phone, 
          order, 
          status
        );
      } catch (whatsappError) {
        console.warn('WhatsApp notification failed:', whatsappError.message);
      }
    }

    res.json({
      message: 'Order status updated successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        tracking: order.tracking
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/products
// @desc    Get all products for admin
// @access  Private/Admin
router.get('/products', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      status = 'all',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-reviews'); // Exclude reviews for performance

    const totalProducts = await Product.countDocuments(filter);

    // Debug logging
    console.log(`📦 Admin GET /products - Found ${products.length} products`);
    if (products.length > 0) {
      console.log('📦 Product image details:');
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - Images:`, JSON.stringify(product.images, null, 2));
      });
      console.log('📦 Products with images:', products.filter(p => p.images && p.images.length > 0).length);
    }

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        totalProducts,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/products/:id/stock
// @desc    Update product stock
// @access  Private/Admin
router.put('/products/:id/stock', adminAuth, async (req, res) => {
  try {
    const { quantity, lowStockThreshold } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ message: 'Stock quantity cannot be negative' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.stock.quantity = quantity;
    if (lowStockThreshold !== undefined) {
      product.stock.lowStockThreshold = lowStockThreshold;
    }

    await product.save();

    res.json({
      message: 'Stock updated successfully',
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        stock: product.stock
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/customers
// @desc    Get all customers
// @access  Private/Admin
router.get('/customers', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = { role: { $ne: 'admin' } };

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [customers, totalCount] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    // Get order stats for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orderStats = await Order.aggregate([
          { $match: { user: customer._id } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: '$pricing.total' }
            }
          }
        ]);

        const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0 };
        
        return {
          ...customer,
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent
        };
      })
    );

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      customers: customersWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private/Admin
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const { period = '30', type = 'overview' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    let analytics = {};

    if (type === 'overview' || type === 'sales') {
      // Sales analytics
      const salesData = await Order.aggregate([
        { $match: { 
          createdAt: { $gte: daysAgo },
          'payment.status': 'completed'
        }},
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$pricing.total' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$pricing.total' }
        }},
        { $sort: { _id: 1 } }
      ]);

      analytics.sales = salesData;
    }

    if (type === 'overview' || type === 'products') {
      // Product performance
      const productPerformance = await Order.aggregate([
        { $match: { 
          createdAt: { $gte: daysAgo },
          'payment.status': 'completed'
        }},
        { $unwind: '$items' },
        { $group: {
          _id: '$items.product',
          name: { $first: '$items.productSnapshot.name' },
          category: { $first: '$items.productSnapshot.specifications.metal' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }},
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]);

      analytics.products = productPerformance;
    }

    if (type === 'overview' || type === 'customers') {
      // Customer analytics
      const customerStats = await User.aggregate([
        { $match: { role: 'customer' } },
        { $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'customer',
          as: 'orders'
        }},
        { $addFields: {
          orderCount: { $size: '$orders' },
          totalSpent: { $sum: '$orders.pricing.total' }
        }},
        { $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          averageOrderValue: { $avg: '$totalSpent' },
          repeatCustomers: { $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] } }
        }}
      ]);

      analytics.customers = customerStats[0] || {};
    }

    res.json({
      analytics,
      period: parseInt(period),
      type
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/products
// @desc    Create a new product
// @access  Private/Admin
router.post('/products', adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      category,
      subCategory,
      price,
      originalPrice,
      discount,
      sku,
      weight,
      material,
      purity,
      stockQuantity,
      featured,
      tags,
      images
    } = req.body;

    // Check if SKU already exists
    if (sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return res.status(400).json({ message: 'SKU already exists' });
      }
    }

    // Transform images array to proper format
    const processedImages = Array.isArray(images) ? 
      images.map((image, index) => {
        // If it's already an object, keep it
        if (typeof image === 'object' && image !== null && image.url) {
          return image;
        }
        // If it's a string, convert to object
        if (typeof image === 'string' && image.trim() !== '') {
          return {
            url: image,
            alt: `${name || 'Product'} image ${index + 1}`,
            isPrimary: index === 0
          };
        }
        return null;
      }).filter(img => img !== null && img.url) : [];

    const product = new Product({
      name,
      description,
      shortDescription,
      category,
      subCategory,
      price,
      originalPrice,
      discount: discount || 0,
      sku: sku || `PROD_${Date.now()}`,
      weight: weight || 0,
      material: material || '',
      purity: purity || '',
      stock: {
        quantity: stockQuantity || 0,
        lowStockThreshold: 5,
        status: stockQuantity > 5 ? 'in-stock' : stockQuantity > 0 ? 'low-stock' : 'out-of-stock'
      },
      featured: featured || false,
      tags: tags || [],
      images: processedImages,
      isActive: true
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      category,
      subCategory,
      price,
      originalPrice,
      discount,
      sku,
      weight,
      material,
      purity,
      stockQuantity,
      featured,
      tags,
      images
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if SKU already exists for another product
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku, _id: { $ne: req.params.id } });
      if (existingProduct) {
        return res.status(400).json({ message: 'SKU already exists' });
      }
    }

    // Update product fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (category !== undefined) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (price !== undefined) product.price = price;
    if (originalPrice !== undefined) product.originalPrice = originalPrice;
    if (discount !== undefined) product.discount = discount;
    if (sku !== undefined) product.sku = sku;
    if (weight !== undefined) product.weight = weight;
    if (material !== undefined) product.material = material;
    if (purity !== undefined) product.purity = purity;
    if (featured !== undefined) product.featured = featured;
    if (tags !== undefined) product.tags = tags;
    
    // Handle images - convert string array to object array if needed
    if (images !== undefined) {
      if (Array.isArray(images)) {
        product.images = images.map((image, index) => {
          // If it's already an object, keep it
          if (typeof image === 'object' && image !== null && image.url) {
            return image;
          }
          // If it's a string, convert to object
          if (typeof image === 'string' && image.trim() !== '') {
            return {
              url: image,
              alt: `${product.name || 'Product'} image ${index + 1}`,
              isPrimary: index === 0
            };
          }
          return null;
        }).filter(img => img !== null && img.url); // Remove invalid entries
      } else {
        product.images = [];
      }
    }

    // Update stock if provided
    if (stockQuantity !== undefined) {
      product.stock.quantity = stockQuantity;
      product.stock.status = stockQuantity > product.stock.lowStockThreshold ? 'in-stock' : 
                           stockQuantity > 0 ? 'low-stock' : 'out-of-stock';
    }

    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product (Hard delete from database)
// @access  Private/Admin
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Hard delete - completely remove from database
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Product permanently deleted from database'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/orders/:id/email
// @desc    Send order email
// @access  Private/Admin
router.post('/orders/:id/email', adminAuth, async (req, res) => {
  try {
    const { emailType = 'confirmation' } = req.body;
    const order = await Order.findById(req.params.id).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if email configuration is properly set
    if (!process.env.EMAIL_USER || process.env.EMAIL_PASS === 'your_app_password_here') {
      console.warn('Email service not configured properly');
      return res.status(200).json({ 
        message: 'Email service is not configured. Orders are saved successfully but email notifications are disabled.',
        warning: 'Configure EMAIL_USER and EMAIL_PASS in environment variables to enable email notifications.'
      });
    }

    // Try to send email using email service
    try {
      const { sendOrderConfirmationEmail } = require('../utils/emailService');
      await sendOrderConfirmationEmail(order);
      
      res.json({
        message: `${emailType} email sent successfully`
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(500).json({ 
        message: `Failed to send ${emailType} email: ${emailError.message}` 
      });
    }
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/orders/export
// @desc    Export orders data
// @access  Private/Admin
router.post('/orders/export', adminAuth, async (req, res) => {
  try {
    const { status, dateFilter } = req.body;
    
    let query = {};
    if (status) query.status = status;
    
    if (dateFilter) {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      query.createdAt = { $gte: startDate };
    }

    const orders = await Order.find(query)
      .populate('items.product')
      .sort({ createdAt: -1 });

    // Here you would generate CSV/Excel file
    // For now, we'll just return the data
    res.json({
      message: 'Export completed',
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Export orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/orders/bulk-update
// @desc    Bulk update order statuses
// @access  Private/Admin
router.put('/orders/bulk-update', adminAuth, async (req, res) => {
  try {
    const { orderIds, status } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || !status) {
      return res.status(400).json({ message: 'Invalid data provided' });
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { status, updatedAt: new Date() }
    );

    res.json({
      message: `${result.modifiedCount} orders updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/customers/stats
// @desc    Get customer statistics
// @access  Private/Admin
router.get('/customers/stats', adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      total,
      active,
      inactive,
      blocked,
      newThisMonth,
      orderStats,
      spendingStats
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ role: { $ne: 'admin' }, status: 'active' }),
      User.countDocuments({ role: { $ne: 'admin' }, status: 'inactive' }),
      User.countDocuments({ role: { $ne: 'admin' }, status: 'blocked' }),
      User.countDocuments({ 
        role: { $ne: 'admin' }, 
        createdAt: { $gte: startOfMonth } 
      }),
      Order.aggregate([
        { $group: { _id: null, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { 'payment.status': 'completed' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ])
    ]);

    res.json({
      total,
      active,
      inactive,
      blocked,
      newThisMonth,
      totalOrders: orderStats[0]?.count || 0,
      totalSpent: spendingStats[0]?.total || 0
    });
  } catch (error) {
    console.error('Customer stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/customers/:id
// @desc    Get customer details with order history
// @access  Private/Admin
router.get('/customers/:id', adminAuth, async (req, res) => {
  try {
    const customer = await User.findById(req.params.id)
      .select('-password')
      .lean();
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Get customer's order history
    const orders = await Order.find({ user: req.params.id })
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate customer stats
    const customerStats = await Order.aggregate([
      { $match: { user: customer._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
          avgOrderValue: { $avg: '$pricing.total' }
        }
      }
    ]);

    const stats = customerStats[0] || { totalOrders: 0, totalSpent: 0, avgOrderValue: 0 };

    res.json({
      ...customer,
      orders,
      totalOrders: stats.totalOrders,
      totalSpent: stats.totalSpent,
      avgOrderValue: stats.avgOrderValue
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/customers
// @desc    Create a new customer
// @access  Private/Admin
router.post('/customers', adminAuth, async (req, res) => {
  try {
    const { name, email, phone, address, status } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const customer = new User({
      name,
      email,
      phone,
      address,
      status: status || 'active',
      role: 'customer',
      password: 'temp_password_' + Date.now(), // Temporary password
      isEmailVerified: true
    });

    await customer.save();

    // Remove password from response
    const customerResponse = customer.toObject();
    delete customerResponse.password;

    res.status(201).json({
      message: 'Customer created successfully',
      customer: customerResponse
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/customers/:id
// @desc    Update customer information
// @access  Private/Admin
router.put('/customers/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, phone, address, status } = req.body;

    const customer = await User.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== customer.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Update customer fields
    if (name !== undefined) customer.name = name;
    if (email !== undefined) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (address !== undefined) customer.address = address;
    if (status !== undefined) customer.status = status;

    await customer.save();

    // Remove password from response
    const customerResponse = customer.toObject();
    delete customerResponse.password;

    res.json({
      message: 'Customer updated successfully',
      customer: customerResponse
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/customers/:id/status
// @desc    Update customer status
// @access  Private/Admin
router.put('/customers/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'blocked'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const customer = await User.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    customer.status = status;
    await customer.save();

    res.json({
      message: `Customer status updated to ${status}`,
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        status: customer.status
      }
    });
  } catch (error) {
    console.error('Update customer status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/customers/:id
// @desc    Delete a customer (soft delete)
// @access  Private/Admin
router.delete('/customers/:id', adminAuth, async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Soft delete by setting status to inactive
    customer.status = 'inactive';
    customer.deletedAt = new Date();
    await customer.save();

    res.json({
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Image upload configuration
const uploadDir = path.join(__dirname, '../uploads/products');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 4 * 1024 * 1024 // 4MB limit
  }
});

// @route   POST /api/admin/upload-image
// @desc    Upload product image
// @access  Private/Admin
router.post('/upload-image', adminAuth, (req, res) => {
  upload.single('image')(req, res, (err) => {
    try {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              message: 'File too large. Maximum size allowed is 4MB.' 
            });
          }
          return res.status(400).json({ 
            message: `Upload error: ${err.message}` 
          });
        } else if (err.message === 'Only image files are allowed!') {
          return res.status(400).json({ 
            message: 'Only image files (JPG, PNG, GIF, WebP) are allowed.' 
          });
        }
        return res.status(500).json({ 
          message: 'Upload failed. Please try again.' 
        });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      // Generate image URL
      const imageUrl = `/uploads/products/${req.file.filename}`;
      
      res.json({
        message: 'Image uploaded successfully',
        imageUrl: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        originalName: req.file.originalname
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });
});

// @route   POST /api/admin/upload-existing-image
// @desc    Upload existing image file to production (for migration)
// @access  Private/Admin
router.post('/upload-existing-image', adminAuth, (req, res) => {
  // Use a custom storage that preserves the original filename
  const existingImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Keep the original filename for existing images
      cb(null, file.originalname);
    }
  });

  const existingImageUpload = multer({
    storage: existingImageStorage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit for existing images
    }
  });

  existingImageUpload.single('image')(req, res, (err) => {
    try {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              message: 'File too large. Maximum size allowed is 10MB.' 
            });
          }
          return res.status(400).json({ 
            message: `Upload error: ${err.message}` 
          });
        } else if (err.message === 'Only image files are allowed!') {
          return res.status(400).json({ 
            message: 'Only image files (JPG, PNG, GIF, WebP) are allowed.' 
          });
        }
        return res.status(500).json({ 
          message: 'Upload failed. Please try again.' 
        });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      // Generate image URL
      const imageUrl = `/uploads/products/${req.file.filename}`;
      
      console.log(`✅ Existing image uploaded: ${req.file.filename}`);
      
      res.json({
        message: 'Existing image uploaded successfully',
        imageUrl: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        originalName: req.file.originalname
      });
    } catch (error) {
      console.error('Existing image upload error:', error);
      res.status(500).json({ message: 'Failed to upload existing image' });
    }
  });
});

module.exports = router;
