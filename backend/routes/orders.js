const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validation');
const { generatePaymentQR } = require('../utils/qrService');
const { generateInvoicePDF } = require('../utils/pdfService');
const { sendOrderConfirmationEmail, sendOrderNotificationToAdmin } = require('../utils/emailService');
const { sendOrderNotificationWhatsApp } = require('../utils/whatsappService');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', auth, validateOrder, async (req, res) => {
  try {
    const { 
      items, 
      customerInfo, 
      shippingAddress, 
      billingAddress, 
      payment, 
      pricing, 
      couponCode, 
      couponDiscount, 
      notes, 
      orderSource,
      deviceInfo 
    } = req.body;

    console.log('Received order data:', {
      itemsCount: items?.length,
      customerInfo,
      shippingAddress,
      payment,
      pricing
    });

    // Validate and process order items
    let calculatedSubtotal = 0;
    const processedItems = [];

    for (const item of items) {
      let product;
      
      // Handle different product ID formats
      if (item.product) {
        product = await Product.findById(item.product);
      } else if (item.productSnapshot) {
        // If we have a snapshot, trust it but try to find the product for stock updates
        product = await Product.findOne({ sku: item.productSnapshot.sku });
      }

      if (!product && !item.productSnapshot) {
        return res.status(400).json({ 
          message: `Product ${item.product} not found` 
        });
      }

      // Use product data or snapshot data
      const productData = product || item.productSnapshot;
      const itemPrice = item.price || productData.price;
      const itemTotal = itemPrice * item.quantity;
      calculatedSubtotal += itemTotal;

      processedItems.push({
        product: product?._id || null,
        productSnapshot: {
          name: item.productSnapshot?.name || productData.name,
          sku: item.productSnapshot?.sku || productData.sku,
          image: item.productSnapshot?.image || (productData.images?.[0]?.url),
          price: itemPrice,
          specifications: item.productSnapshot?.specifications || productData.specifications || {}
        },
        quantity: item.quantity,
        price: itemPrice,
        variant: item.variant || null
      });

      // Update stock if product exists
      if (product && product.stock && product.stock.quantity >= item.quantity) {
        await Product.findByIdAndUpdate(
          product._id,
          { $inc: { 'stock.quantity': -item.quantity } }
        );
      }
    }

    // Use provided pricing or calculate
    const orderPricing = pricing || {
      subtotal: calculatedSubtotal,
      tax: calculatedSubtotal * 0.18, // 18% GST
      shippingCost: calculatedSubtotal > 5000 ? 0 : 200,
      discount: couponDiscount || 0,
      total: 0
    };
    
    // Only recalculate total if pricing wasn't provided
    if (!pricing) {
      orderPricing.total = orderPricing.subtotal + orderPricing.tax + orderPricing.shippingCost - orderPricing.discount;
    }

    // Create order
    const order = new Order({
      customer: req.user.id,
      customerInfo: {
        email: customerInfo?.email || req.user.email,
        firstName: customerInfo?.firstName || req.user.firstName,
        lastName: customerInfo?.lastName || req.user.lastName,
        phone: customerInfo?.phone || req.user.phone,
        userId: req.user.id
      },
      items: processedItems,
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        apartment: shippingAddress.apartment || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country || 'India',
        landmark: shippingAddress.landmark || ''
      },
      billingAddress: billingAddress || null,
      pricing: orderPricing,
      coupon: couponCode ? {
        code: couponCode,
        discount: couponDiscount || 0,
        type: 'percentage'
      } : undefined,
      payment: {
        method: payment?.method || 'qr-code',
        status: payment?.status || 'pending',
        transactionId: payment?.transactionId || `UJ${Date.now()}`
      },
      notes: notes || {},
      status: 'pending',
      orderSource: orderSource || 'website',
      deviceInfo: deviceInfo || {}
    });

    // Generate order number and save
    await order.save();

    console.log('Order created successfully:', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      customer: order.customerInfo,
      total: order.pricing.total
    });

    // Generate payment QR code if needed
    let paymentQR = null;
    if (order.payment.method === 'qr-code' || order.payment.method === 'upi') {
      try {
        paymentQR = await generatePaymentQR(order);
        order.payment.qrCode = paymentQR.qrCodeDataURL;
        order.payment.upiId = paymentQR.paymentDetails.upiId;
        await order.save();
      } catch (qrError) {
        console.error('QR generation failed:', qrError);
        // Continue without QR - order is still valid
      }
    }

    // Send notifications
    try {
      await sendOrderConfirmationEmail(order);
      await sendOrderNotificationToAdmin(order);
    } catch (notificationError) {
      console.error('Notification sending failed:', notificationError);
      // Continue - order is created successfully
    }

    // Update user order statistics
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      if (user) {
        await user.updateOrderStats(orderPricing.total);
      }
    } catch (statsError) {
      console.error('Failed to update user stats:', statsError);
      // Continue - order is still valid
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.pricing.total,
        status: order.status,
        customerInfo: order.customerInfo,
        shippingAddress: order.shippingAddress,
        items: order.items,
        paymentQR: paymentQR
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      message: 'Server error while creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { customer: req.user.id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.product', 'name images');

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
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user.id
    }).populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/:id/confirm-payment
// @desc    Confirm payment for order
// @access  Private
router.post('/:id/confirm-payment', auth, async (req, res) => {
  try {
    const { transactionId, paymentMethod = 'upi' } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.payment.status === 'completed') {
      return res.status(400).json({ message: 'Payment already confirmed' });
    }

    // Update payment information
    order.payment.status = 'completed';
    order.payment.transactionId = transactionId;
    order.payment.method = paymentMethod;
    order.payment.paidAt = new Date();
    order.status = 'confirmed';

    await order.save();

    // Generate and send invoice
    try {
      const invoicePath = await generateInvoicePDF(order);
      order.notifications.invoiceGenerated = true;
      order.notifications.invoicePath = invoicePath;

      // Send confirmation email to customer
      await sendOrderConfirmationEmail(order, invoicePath);
      order.notifications.emailSent = true;

      // Send notification to admin via email
      await sendOrderNotificationToAdmin(order);

      // Send WhatsApp notification to admin
      try {
        await sendOrderNotificationWhatsApp(order);
        order.notifications.whatsappSent = true;
      } catch (whatsappError) {
        console.warn('WhatsApp notification failed:', whatsappError.message);
      }

      await order.save();
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the payment confirmation due to notification errors
    }

    res.json({
      message: 'Payment confirmed successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.payment.status
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/track/:orderNumber
// @desc    Track order by order number (public)
// @access  Public
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ 
      orderNumber: req.params.orderNumber 
    })
    .select('orderNumber status statusHistory estimatedDelivery tracking createdAt')
    .sort({ 'statusHistory.timestamp': -1 });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      orderNumber: order.orderNumber,
      status: order.status,
      statusHistory: order.statusHistory,
      estimatedDelivery: order.estimatedDelivery,
      tracking: order.tracking,
      orderDate: order.createdAt
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!['pending', 'confirmed', 'processing'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled at this stage' 
      });
    }

    // Update order status
    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason || 'Cancelled by customer'
    });

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { 'stock.quantity': item.quantity } }
      );
    }

    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/track/:trackingId
// @desc    Track order by tracking ID (public)
// @access  Public
router.get('/track/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;

    if (!trackingId) {
      return res.status(400).json({
        success: false,
        message: 'Tracking ID is required'
      });
    }

    // Find order by tracking ID
    const order = await Order.findOne({ 
      $or: [
        { trackingId: trackingId },
        { orderNumber: trackingId },
        { _id: trackingId.match(/^[0-9a-fA-F]{24}$/) ? trackingId : null }
      ]
    }).populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create a clean response object with tracking information
    const trackingData = {
      _id: order._id,
      trackingId: order.trackingId || order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      estimatedDelivery: order.estimatedDelivery,
      deliveryDate: order.deliveryDate,
      customerInfo: {
        name: order.customerInfo.name,
        phone: order.customerInfo.phone,
        email: order.customerInfo.email
      },
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      items: order.items.map(item => ({
        name: item.name || item.product?.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || item.product?.images?.[0]?.url,
        selectedSize: item.selectedSize
      })),
      subtotal: order.subtotal || order.totalAmount,
      shippingCost: order.shippingCost || 0,
      tax: order.tax || 0,
      couponDiscount: order.couponDiscount || 0,
      statusHistory: order.statusHistory || [],
      cancellationReason: order.cancellationReason,
      trackingDetails: order.trackingDetails || {},
      notes: order.notes
    };

    res.json({
      success: true,
      order: trackingData
    });

  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while tracking order'
    });
  }
});

module.exports = router;
