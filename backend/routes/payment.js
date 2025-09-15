const express = require('express');
const { generatePaymentQR, verifyEsewaPayment } = require('../utils/qrService');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payment/generate-qr
// @desc    Generate eSewa payment QR code for order
// @access  Private
router.post('/generate-qr', auth, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findOne({
      _id: orderId,
      customer: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.payment.status === 'completed') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    const paymentQR = await generatePaymentQR(order);

    // Update order with QR code
    order.payment.qrCode = paymentQR.qrCodeDataURL;
    order.payment.esewaId = paymentQR.paymentDetails.esewaId;
    order.payment.method = 'eSewa';
    await order.save();

    res.json({
      message: 'eSewa payment QR code generated successfully',
      paymentQR
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify eSewa payment
// @access  Private
router.post('/verify', auth, async (req, res) => {
  try {
    const { orderId, transactionId } = req.body;

    if (!orderId || !transactionId) {
      return res.status(400).json({ 
        message: 'Order ID and Transaction ID are required' 
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customer: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.payment.status === 'completed') {
      return res.status(400).json({ message: 'Payment already verified' });
    }

    // Verify eSewa payment
    const verification = await verifyEsewaPayment(
      transactionId, 
      order.orderNumber, 
      order.pricing.total
    );

    if (verification.isValid) {
      // Update order payment status
      order.payment.status = 'completed';
      order.payment.transactionId = transactionId;
      order.payment.paidAt = new Date();
      order.payment.method = 'eSewa';
      order.status = 'confirmed';
      
      await order.save();

      res.json({
        message: 'eSewa payment verified successfully',
        verification,
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.payment.status
        }
      });
    } else {
      res.status(400).json({
        message: 'Payment verification failed',
        verification
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payment/methods
// @desc    Get available payment methods
// @access  Public
router.get('/methods', (req, res) => {
  res.json({
    methods: [
      {
        id: 'esewa-qr',
        name: 'eSewa QR Payment',
        description: 'Scan QR code with eSewa app',
        icon: 'qr-code',
        enabled: true,
        primary: true
      },
      {
        id: 'esewa',
        name: 'eSewa Digital Wallet',
        description: 'Pay using eSewa Nepal',
        icon: 'mobile',
        enabled: true,
        primary: true
      },
      {
        id: 'bank-transfer',
        name: 'Bank Transfer (Nepal)',
        description: 'Direct bank transfer in Nepal',
        icon: 'bank',
        enabled: true
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        icon: 'money',
        enabled: true,
        primary: false,
        codCharge: 50, // COD handling fee in NPR
        minOrderAmount: 1000 // Minimum order amount for COD in NPR
      }
    ],
    defaultMethod: 'esewa-qr',
    currency: 'NPR',
    supportedApps: [
      'eSewa', 'Khalti', 'IME Pay', 'ConnectIPS'
    ]
  });
});

// @route   GET /api/payment/esewa-info
// @desc    Get eSewa payment information
// @access  Public
router.get('/esewa-info', (req, res) => {
  res.json({
    esewaId: '9765723517',
    storeName: 'The Alankriti',
    paymentMethods: [
      {
        name: 'eSewa QR Code',
        description: 'Scan QR code with eSewa mobile app',
        instructions: [
          'Open eSewa mobile app',
          'Tap on "Scan & Pay"',
          'Scan the QR code displayed',
          'Enter your eSewa PIN to confirm payment',
          'Take a screenshot of the success message'
        ]
      },
      {
        name: 'eSewa Transfer',
        description: 'Transfer money directly to our eSewa account',
        instructions: [
          'Open eSewa app or website',
          'Go to "Send Money"',
          'Enter eSewa ID: 9765723517',
          'Enter the exact amount',
          'Add order number in remarks',
          'Complete the transaction'
        ]
      }
    ],
    supportInfo: {
      phone: '9765723517',
      email: 'support@The Alankriti.com',
      helpText: 'For payment assistance, contact us with your order number'
    }
  });
});

// @route   POST /api/payment/webhook
// @desc    Handle payment gateway webhooks
// @access  Public (with signature verification in production)
router.post('/webhook', async (req, res) => {
  try {
    const { event, orderId, transactionId, status, amount } = req.body;

    // In production, verify webhook signature here
    console.log('Payment webhook received:', { event, orderId, transactionId, status });

    if (event === 'payment.success' && orderId && transactionId) {
      const order = await Order.findById(orderId);
      
      if (order && order.payment.status !== 'completed') {
        order.payment.status = 'completed';
        order.payment.transactionId = transactionId;
        order.payment.paidAt = new Date();
        order.status = 'confirmed';
        
        await order.save();
        
        console.log('✅ Payment webhook processed successfully for order:', order.orderNumber);
      }
    }

    res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// @route   GET /api/payment/esewa-apps
// @desc    Get eSewa and Nepal payment app download links
// @access  Public
router.get('/esewa-apps', (req, res) => {
  res.json({
    apps: [
      {
        name: 'eSewa',
        package: 'com.f1soft.esewa',
        playStore: 'https://play.google.com/store/apps/details?id=com.phonepe.app',
        appStore: 'https://apps.apple.com/in/app/phonepe-payments-recharges/id1170055821'
      },
      {
        name: 'Google Pay',
        package: 'com.google.android.apps.nbu.paisa.user',
        playStore: 'https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user',
        appStore: 'https://apps.apple.com/in/app/google-pay/id1193357041'
      },
      {
        name: 'Paytm',
        package: 'net.one97.paytm',
        playStore: 'https://play.google.com/store/apps/details?id=net.one97.paytm',
        appStore: 'https://apps.apple.com/in/app/paytm-payments-recharges/id473941634'
      },
      {
        name: 'Amazon Pay',
        package: 'in.amazon.mShop.android.shopping',
        playStore: 'https://play.google.com/store/apps/details?id=in.amazon.mShop.android.shopping',
        appStore: 'https://apps.apple.com/in/app/amazon-shopping/id297606951'
      },
      {
        name: 'BHIM',
        package: 'in.org.npci.upiapp',
        playStore: 'https://play.google.com/store/apps/details?id=in.org.npci.upiapp',
        appStore: 'https://apps.apple.com/in/app/bhim/id1200315258'
      }
    ]
  });
});

module.exports = router;
