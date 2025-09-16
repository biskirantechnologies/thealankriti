const QRCode = require('qrcode');

const generatePaymentQR = async (order) => {
  try {
    const esewaId = process.env.ESEWA_ID || '9765723517';
    const storeName = process.env.STORE_NAME || 'Ukriti Jewells';
    
    // Generate eSewa payment URL for Nepal
    const esewaPaymentUrl = `esewa://pay?scd=${esewaId}&pn=${encodeURIComponent(storeName)}&am=${order.pricing.total}&cu=NPR&tn=${encodeURIComponent(`Payment for Order ${order.orderNumber}`)}`;
    
    // Generate QR code as data URL with eSewa branding colors
    const qrCodeDataURL = await QRCode.toDataURL(esewaPaymentUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#60A338', // eSewa green color
        light: '#FFFFFF'
      }
    });

    console.log('✅ eSewa Payment QR code generated for order:', order.orderNumber);
    
    return {
      qrCodeDataURL,
      esewaUrl: esewaPaymentUrl,
      paymentDetails: {
        esewaId: esewaId,
        amount: order.pricing.total,
        storeName: storeName,
        orderNumber: order.orderNumber,
        currency: 'NPR',
        paymentMethod: 'eSewa'
      }
    };
  } catch (error) {
    console.error('❌ Error generating eSewa payment QR code:', error);
    throw error;
  }
};

// Generate QR code for order tracking
const generateOrderTrackingQR = async (orderNumber) => {
  try {
    const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track-order/${orderNumber}`;
    
    const qrCodeDataURL = await QRCode.toDataURL(trackingUrl, {
      width: 200,
      margin: 2
    });

    return {
      qrCodeDataURL,
      trackingUrl
    };
  } catch (error) {
    console.error('❌ Error generating tracking QR code:', error);
    throw error;
  }
};

// Verify eSewa payment (mock implementation for now)
const verifyEsewaPayment = async (transactionId, orderNumber, amount) => {
  try {
    // Mock verification logic - in production, integrate with eSewa verification API
    console.log(`🔍 Verifying eSewa payment:`, {
      transactionId,
      orderNumber,
      amount
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful verification (80% success rate for demo)
    const isValid = Math.random() > 0.2;
    
    if (isValid) {
      console.log('✅ eSewa payment verification successful');
      return {
        isValid: true,
        transactionId,
        amount,
        paymentMethod: 'eSewa',
        verifiedAt: new Date(),
        status: 'success',
        message: 'Payment verified successfully via eSewa'
      };
    } else {
      console.log('❌ eSewa payment verification failed');
      return {
        isValid: false,
        transactionId,
        amount,
        paymentMethod: 'eSewa',
        verifiedAt: new Date(),
        status: 'failed',
        message: 'Payment verification failed. Please check transaction ID.'
      };
    }
  } catch (error) {
    console.error('❌ Error verifying eSewa payment:', error);
    return {
      isValid: false,
      transactionId,
      amount,
      paymentMethod: 'eSewa',
      verifiedAt: new Date(),
      status: 'error',
      message: 'Payment verification service unavailable'
    };
  }
};

module.exports = {
  generatePaymentQR,
  generateOrderTrackingQR,
  verifyEsewaPayment
};
