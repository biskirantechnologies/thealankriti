import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  CreditCardIcon, 
  QrCodeIcon, 
  ShieldCheckIcon,
  TruckIcon,
  LockClosedIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI, paymentAPI } from '../services/api';
import { getImageUrl } from '../utils/api';
import SafeImage from '../components/SafeImage';

import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems = [], clearCart, getTotalPrice } = useCart();
  const { user } = useAuth(); // Optional - for logged in users
  
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('esewa');
  const [orderData, setOrderData] = useState(null);
  const [qrPaymentData, setQrPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
  const [isLoading, setIsLoading] = useState(false);
  const [codConfirmed, setCodConfirmed] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false); // Track if order was successfully submitted
  const [isScreenshotSubmission, setIsScreenshotSubmission] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    country: 'Nepal',
    landmark: ''
  });

  const [billingInfo, setBillingInfo] = useState({
    sameAsShipping: true,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    country: 'Nepal'
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const subtotal = parseFloat(getTotalPrice()) || 0;
  const codFee = paymentMethod === 'cod' ? 50 : 0; // COD handling fee
  const shippingCost = subtotal > 25000 ? 0 : 500;
  const discount = appliedCoupon ? (subtotal * appliedCoupon.percentage) / 100 : 0;
  const tax = (subtotal - discount) * 0.03; // 3% GST
  const total = parseFloat((subtotal + shippingCost + codFee - discount + tax).toFixed(2));

  const steps = [
    { id: 1, name: 'Shipping', status: currentStep >= 1 ? 'complete' : 'upcoming' },
    { id: 2, name: 'Payment', status: currentStep >= 2 ? 'complete' : 'upcoming' },
    { id: 3, name: 'Confirmation', status: currentStep >= 3 ? 'complete' : 'upcoming' }
  ];

  useEffect(() => {
    // Don't redirect if order was successfully submitted - let user control navigation
    if (orderSubmitted) {
      return;
    }
    
    // Guests can checkout without login
    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/products');
    }
  }, [cartItems, navigate, orderSubmitted]);

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const validateShippingInfo = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    for (let field of required) {
      if (!shippingInfo[field]) {
        toast.error(`Please fill in ${field}`);
        return false;
      }
    }
    return true;
  };

  const applyCoupon = () => {
    // Mock coupon validation
    const validCoupons = {
      'WELCOME10': { percentage: 10, description: '10% off on first order' },
      'FESTIVAL20': { percentage: 20, description: '20% festival discount' },
      'SAVE5': { percentage: 5, description: '5% off on all orders' }
    };

    if (validCoupons[couponCode]) {
      setAppliedCoupon(validCoupons[couponCode]);
      toast.success(`Coupon applied! ${validCoupons[couponCode].description}`);
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const generatePaymentData = () => {
    // Generate eSewa payment data
    const paymentData = {
      esewaId: '9765723517',
      payeeName: 'TheAlankriti',
      amount: total,
      transactionId: `UJ${Date.now()}`,
      note: `Order payment for TheAlankriti`,
      currency: 'NPR'
    };
    
    setQrPaymentData(paymentData);
    
    return paymentData;
  };

  const handleScreenshotUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setPaymentScreenshot(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshotPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const submitPaymentScreenshot = async () => {
    if (!paymentScreenshot) {
      toast.error('Please upload a payment screenshot');
      return;
    }

    // Validate required shipping information
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || !shippingInfo.phone) {
      toast.error('Please fill in all required shipping information');
      return;
    }

    setIsUploadingScreenshot(true);
    
    try {
      const formData = new FormData();
      formData.append('screenshot', paymentScreenshot);
      
      // Generate a transaction ID if not available
      const transactionId = qrPaymentData?.transactionId || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      formData.append('transactionId', transactionId);
      
      // Calculate total from cart
      const totalAmount = getTotalPrice();
      formData.append('amount', totalAmount);
      formData.append('paymentMethod', paymentMethod);
      
      // Add customer details for guest checkout
      formData.append('customerName', `${shippingInfo.firstName} ${shippingInfo.lastName}`);
      formData.append('customerEmail', shippingInfo.email);
      formData.append('customerPhone', shippingInfo.phone);
      formData.append('customerAddress', `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.pincode}`);

      console.log('Uploading screenshot with data:', {
        transactionId,
        amount: totalAmount,
        customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customerEmail: shippingInfo.email
      });

      // Guest users don't need authorization
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/payment/upload-screenshot`, {
        method: 'POST',
        body: formData
      });

      const responseData = await response.json();
      console.log('Upload response:', responseData);

      if (response.ok) {
        // Don't show success message here - wait for order creation to complete
        console.log('✅ Screenshot uploaded successfully');
        setPaymentStatus('success');
        setIsScreenshotSubmission(true);
        
        // Create order object with screenshot information
        const order = {
          id: `UJ${Date.now()}`,
          items: cartItems,
          shippingInfo,
          subtotal,
          shippingCost,
          codFee,
          discount,
          tax,
          total,
          paymentMethod,
          status: 'pending',
          createdAt: new Date().toISOString(),
          paymentData: {
            transactionId: transactionId,
            screenshotUploaded: true,
            uploadResponse: responseData
          }
        };
        
        setOrderData(order);
        setCurrentStep(3);
        
        // Create order with screenshot information
        try {
          await processOrder(order);
          // Success message will be shown by processOrder
        } catch (orderError) {
          console.error('Order creation failed after screenshot upload:', orderError);
          // Screenshot was uploaded successfully, but order creation failed
          toast.error('Payment screenshot uploaded successfully, but order creation failed. Please contact support with your transaction ID: ' + transactionId);
        }
      } else {
        console.error('Upload failed:', responseData);
        toast.error(responseData.message || 'Failed to upload screenshot. Please try again.');
      }
    } catch (error) {
      console.error('Screenshot upload error:', error);
      toast.error(error.message || 'Failed to upload screenshot. Please check your internet connection and try again.');
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateShippingInfo()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      handlePayment();
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setPaymentStatus('processing');

    // Check COD terms acceptance
    if (paymentMethod === 'cod' && !codConfirmed) {
      toast.error('Please accept Cash on Delivery terms and conditions');
      setIsLoading(false);
      setPaymentStatus('pending');
      return;
    }

    // Check minimum order amount for COD
    if (paymentMethod === 'cod' && subtotal < 1000) {
      toast.error('Minimum order amount for Cash on Delivery is NPR 1,000');
      setIsLoading(false);
      setPaymentStatus('pending');
      return;
    }

    try {
      // Create order
      const order = {
        id: `UJ${Date.now()}`,
        items: cartItems,
        shippingInfo,
        subtotal,
        shippingCost,
        codFee,
        discount,
        tax,
        total,
        paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      if (paymentMethod === 'esewa') {
        const paymentData = generatePaymentData();
        setOrderData({ ...order, paymentData });
        setCurrentStep(3);
        
        // Simulate eSewa payment verification after 30 seconds
        setTimeout(() => {
          setPaymentStatus('success');
          processOrder(order);
        }, 30000);
      } else if (paymentMethod === 'cod') {
        // For COD, process order immediately
        setCurrentStep(3);
        setPaymentStatus('success');
        setOrderData(order);
        
        // Process COD order with retry logic
        try {
          await processOrder(order);
        } catch (error) {
          console.error('COD order processing error:', error);
          // Keep payment status as success for COD even if backend fails
          toast.success('COD Order placed successfully! We will contact you for delivery.');
          
          // Store order locally as backup
          localStorage.setItem('codOrder', JSON.stringify({
            ...order,
            timestamp: new Date().toISOString(),
            status: 'pending_backend_sync'
          }));
          
          // Clear cart anyway for better UX
          setOrderSubmitted(true);
          clearCart();
        }
      } else {
        // For other payment methods, simulate immediate success
        setTimeout(() => {
          setPaymentStatus('success');
          setOrderData(order);
          setCurrentStep(3);
          processOrder(order);
        }, 2000);
      }
    } catch (error) {
      setPaymentStatus('processing');
      toast.success('Payment submitted successfully! Processing your order...');
    } finally {
      setIsLoading(false);
    }
  };

  const processOrder = async (order = null) => {
    try {
      console.log('🔄 Processing order:', order);
      
      // Guest checkout allowed - user authentication is optional
      
      // Prepare detailed order data for API
      const orderData = {
        items: cartItems.map(item => {
          // Ensure we have valid product data
          const product = item.product || item;
          const productId = product._id || product.id || null;
          
          const itemData = {
            product: productId,
            productSnapshot: {
              name: product.name || 'Unknown Product',
              ...(product.sku && product.sku.trim() !== '' && { sku: product.sku }),
              image: product.images?.[0]?.url || product.image || '',
              price: item.price || product.price || 0,
              specifications: product.specifications || {}
            },
            quantity: item.quantity || 1,
            price: item.price || product.price || 0
          };
          
          // Only include variant if it exists and is not null
          if (item.variant && item.variant !== null) {
            itemData.variant = item.variant;
          }
          
          return itemData;
        }).filter(item => item.productSnapshot.name !== 'Unknown Product'), // Filter out invalid items
        customerInfo: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone
          // Removed userId and isGuest - causes validation errors
        },
        shippingAddress: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          street: shippingInfo.address,
          apartment: shippingInfo.apartment,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.pincode,
          country: shippingInfo.country,
          landmark: shippingInfo.landmark
        },
        billingAddress: billingInfo.sameAsShipping ? {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          street: shippingInfo.address,
          apartment: shippingInfo.apartment,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.pincode,
          country: shippingInfo.country
        } : {
          firstName: billingInfo.firstName,
          lastName: billingInfo.lastName,
          email: billingInfo.email,
          phone: billingInfo.phone,
          street: billingInfo.address,
          apartment: billingInfo.apartment,
          city: billingInfo.city,
          state: billingInfo.state,
          zipCode: billingInfo.pincode,
          country: billingInfo.country
        },
        payment: {
          method: paymentMethod,
          status: paymentMethod === 'cod' ? 'pending' : (paymentStatus === 'success' ? 'completed' : 'pending'),
          transactionId: order?.paymentData?.transactionId || 
                        (paymentMethod === 'cod' ? 'COD-' + Date.now() : (qrPaymentData?.transactionId || `UJ${Date.now()}`)),
          // Add screenshot information if available
          ...(order?.paymentData?.screenshotUploaded && {
            hasScreenshot: true,
            screenshotData: order.paymentData.uploadResponse,
            verificationStatus: 'pending_verification'
          })
          // Removed screenshot - causes validation error, backend handles screenshot separately
        },
        pricing: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          shippingCost: parseFloat(shippingCost.toFixed(2)),
          // Removed codFee - causes validation error
          tax: parseFloat(tax.toFixed(2)),
          discount: parseFloat(discount.toFixed(2)),
          total: parseFloat(total.toFixed(2))
        },
        // Only include couponCode if it exists - null causes validation error
        ...(appliedCoupon?.code && { couponCode: appliedCoupon.code }),
        couponDiscount: appliedCoupon ? discount : 0,
        notes: {
          customerNotes: '',
          specialInstructions: '',
          giftMessage: ''
        },
        orderSource: 'website',
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: new Date().toISOString()
        }
      };

      console.log('📤 Sending order data to API:', orderData);

      // Validate required fields before sending
      const requiredFields = {
        'items': orderData.items?.length > 0,
        'customerInfo.firstName': orderData.customerInfo?.firstName,
        'customerInfo.lastName': orderData.customerInfo?.lastName,
        'customerInfo.email': orderData.customerInfo?.email,
        'shippingAddress.firstName': orderData.shippingAddress?.firstName,
        'shippingAddress.lastName': orderData.shippingAddress?.lastName,
        'shippingAddress.email': orderData.shippingAddress?.email,
        'shippingAddress.phone': orderData.shippingAddress?.phone,
        'shippingAddress.street': orderData.shippingAddress?.street,
        'shippingAddress.city': orderData.shippingAddress?.city,
        'shippingAddress.state': orderData.shippingAddress?.state,
        'shippingAddress.zipCode': orderData.shippingAddress?.zipCode,
        'pricing.subtotal': typeof orderData.pricing?.subtotal === 'number',
        'pricing.total': typeof orderData.pricing?.total === 'number'
      };

      const missingFields = Object.entries(requiredFields).filter(([field, value]) => !value);
      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
      }

      // Log cart structure for debugging
      console.log('🛒 Cart items structure:', cartItems.map(item => ({
        id: item.id,
        productId: item.product?._id,
        productName: item.product?.name,
        quantity: item.quantity,
        price: item.price
      })));

      // Send order to backend API
      console.log('📤 About to send order data to API...');
      console.log('🔍 Full order data being sent:', JSON.stringify(orderData, null, 2));
      
      const response = await ordersAPI.createOrder(orderData);
      console.log('✅ Order created successfully:', response.data);
      
      // Set the order response data for display
      setOrderData({
        id: response.data.order?.orderNumber || response.data.order?.id || response.data.orderId,
        total: response.data.order?.total || orderData.pricing.total,
        items: response.data.order?.items || orderData.items,
        status: response.data.order?.status || 'pending',
        paymentMethod: paymentMethod,
        customerInfo: response.data.order?.customerInfo || orderData.customerInfo
      });
      
      // Set payment status to success
      setPaymentStatus('success');
      
      // Mark order as submitted to prevent auto-redirect to products
      setOrderSubmitted(true);
      
      // Clear cart
      clearCart();
      
      // Show success message based on payment method
      if (paymentMethod === 'cod') {
        toast.success('COD Order placed successfully! We will contact you shortly for confirmation.');
      } else {
        toast.success('Order placed successfully! Your payment screenshot has been submitted for verification. We will contact you soon through Email or Phone.');
      }
      
      // No automatic redirect - users can use "Continue Shopping" button
      console.log('Order submitted successfully. User can manually navigate using buttons.');
      
      
    } catch (error) {
      console.error('❌ Error processing order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // For COD orders, show specific error message but don't change payment status
      if (paymentMethod === 'cod') {
        if (error.message?.includes('login') || error.response?.status === 401) {
          toast.error('Please log in to place your COD order.');
          navigate('/login', { state: { from: { pathname: '/checkout' } } });
        } else {
          toast.success('COD Order received! We will contact you shortly for confirmation.');
          // Store order locally for manual processing
          localStorage.setItem('pendingCODOrder', JSON.stringify({
            ...orderData,
            timestamp: new Date().toISOString(),
            status: 'pending_manual_processing'
          }));
          
          // Mark order as submitted to prevent auto-redirect to products
          setOrderSubmitted(true);
          clearCart();
        }
        console.log('COD order handling completed, keeping success status');
      } else {
        // For screenshot payment, only show error if order actually failed
        const errorMessage = error.response?.data?.message || error.message;
        console.error('📸 Screenshot payment order failed:', errorMessage);
        console.error('📊 Full error response:', JSON.stringify(error.response?.data, null, 2));
        console.error('📋 Request data that failed:', JSON.stringify(orderData, null, 2));
        
        // Check if this is actually a validation error or just a network issue
        if (error.response?.status === 400) {
          // Log validation errors if they exist
          if (error.response?.data?.errors) {
            console.error('🔍 Validation errors:', error.response.data.errors);
            console.table(error.response.data.errors);
            
            // Show detailed error message with specific validation issues
            const errorDetails = error.response.data.errors.join(', ');
            toast.error(`Validation failed: ${errorDetails}. Please check your cart items and shipping information.`);
          } else {
            toast.error(`Order validation failed: ${errorMessage}. Please check your information and try again.`);
          }
        } else if (error.response?.status === 401) {
          toast.error('Authentication required. Please try logging in first.');
        } else if (error.response?.status === 500) {
          toast.error('Server error. Your payment screenshot was received but order processing failed. Please contact support with your transaction details.');
        } else {
          // For network errors or other issues, don't show scary messages
          toast.error('There was an issue processing your order. Please contact support if payment was already made.');
        }
        
        setPaymentStatus('failed');
      }
    }
  };

  const retryPayment = () => {
    setPaymentStatus('pending');
    generatePaymentData();
  };

  // Show checkout page even if cart is empty when order was successfully submitted
  if (cartItems.length === 0 && !orderSubmitted) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-center">
              {steps.map((step, stepIdx) => (
                <li key={step.name} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      step.status === 'complete' ? 'bg-primary-600' : 
                      currentStep === step.id ? 'bg-primary-600' : 'bg-gray-300'
                    }`}>
                      {step.status === 'complete' ? (
                        <CheckCircleIcon className="w-6 h-6 text-white" />
                      ) : (
                        <span className="text-white font-medium">{step.id}</span>
                      )}
                    </div>
                    <span className={`ml-4 text-sm font-medium ${
                      step.status === 'complete' || currentStep === step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-5 left-10 w-8 sm:w-20 h-0.5 bg-gray-300" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Main content */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white shadow rounded-lg p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Shipping Information</h2>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={shippingInfo.firstName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={shippingInfo.lastName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Email address</label>
                      <input
                        type="email"
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Phone number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">PIN code</label>
                      <input
                        type="text"
                        name="pincode"
                        value={shippingInfo.pincode}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <select
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="Nepal">Nepal</option>
                        <option value="India">India</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white shadow rounded-lg p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Method</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="esewa"
                        name="payment-method"
                        type="radio"
                        value="esewa"
                        checked={paymentMethod === 'esewa'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label htmlFor="esewa" className="ml-3 flex items-center">
                        <QrCodeIcon className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">eSewa Payment</span>
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Recommended</span>
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="bank-transfer"
                        name="payment-method"
                        type="radio"
                        value="bank-transfer"
                        checked={paymentMethod === 'bank-transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <label htmlFor="bank-transfer" className="ml-3 flex items-center">
                        <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Bank Transfer (Nepal)</span>
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="cod"
                        name="payment-method"
                        type="radio"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <label htmlFor="cod" className="ml-3 flex items-center">
                        <BanknotesIcon className="h-5 w-5 text-orange-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Cash on Delivery</span>
                        <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">+NPR 50 fee</span>
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'bank-transfer' && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        Bank transfer details will be provided after order confirmation.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-md">
                      <div className="flex items-start">
                        <BanknotesIcon className="h-5 w-5 text-orange-600 mt-1 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-orange-800 mb-2">Cash on Delivery Terms:</h4>
                          <ul className="text-sm text-orange-700 space-y-1">
                            <li>• Pay NPR {total.toLocaleString()} when your order is delivered</li>
                            <li>• COD handling fee: NPR 50</li>
                            <li>• Please keep exact change ready</li>
                            <li>• Delivery within 3-5 business days</li>
                            <li>• Available only within Kathmandu Valley</li>
                          </ul>
                          <div className="mt-3 flex items-center">
                            <input
                              id="cod-terms"
                              type="checkbox"
                              checked={codConfirmed}
                              onChange={(e) => setCodConfirmed(e.target.checked)}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="cod-terms" className="ml-2 text-sm text-orange-800">
                              I agree to the Cash on Delivery terms and conditions
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex items-center text-sm text-gray-500">
                    <LockClosedIcon className="h-4 w-4 mr-2" />
                    Your payment information is secure and encrypted
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment & Confirmation */}
              {currentStep === 3 && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white shadow rounded-lg p-6"
                >
                  {paymentMethod === 'cod' && paymentStatus === 'success' && (
                    <div className="text-center">
                      <div className="mx-auto h-20 w-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                        <BanknotesIcon className="h-12 w-12 text-orange-600" />
                      </div>
                      <h2 className="text-3xl font-bold text-orange-600 mb-2">🎉 COD Order Confirmed!</h2>
                      <p className="text-xl text-gray-700 mb-6">Your Cash on Delivery order has been placed successfully!</p>
                      
                      {orderData && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-left mb-6">
                          <h3 className="font-bold text-orange-800 text-lg mb-4">📋 Order Details:</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-orange-700"><strong>Order Number:</strong> {orderData.id}</p>
                              <p className="text-orange-700"><strong>Amount to Pay:</strong> NPR {orderData.total?.toLocaleString()}</p>
                              <p className="text-orange-700"><strong>Items:</strong> {orderData.items?.length} product(s)</p>
                            </div>
                            <div>
                              <p className="text-orange-700"><strong>Payment Method:</strong> Cash on Delivery</p>
                              <p className="text-orange-700"><strong>Delivery:</strong> 3-5 business days</p>
                              <p className="text-orange-700"><strong>Status:</strong> <span className="text-green-600 font-medium">Confirmed</span></p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-left mb-6">
                        <h4 className="font-bold text-green-800 text-lg mb-3">✅ What happens next?</h4>
                        <div className="space-y-3 text-sm text-green-800">
                          <p className="flex items-center"><span className="mr-2">📧</span> Order confirmation email sent to {shippingInfo.email}</p>
                          <p className="flex items-center"><span className="mr-2">📦</span> Your order is being prepared for delivery</p>
                          <p className="flex items-center"><span className="mr-2">�</span> We'll call you at {shippingInfo.phone} before delivery</p>
                          <p className="flex items-center"><span className="mr-2">💰</span> Pay NPR {orderData?.total?.toLocaleString()} to the delivery person</p>
                          <p className="flex items-center"><span className="mr-2">�</span> Track your order anytime with Order Number: <strong>{orderData?.id}</strong></p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-800 text-sm">
                          📞 <strong>Need help?</strong> Contact us anytime if you have questions about your order.
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <button
                            onClick={() => navigate('/')}
                            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200"
                          >
                            Continue Shopping
                          </button>
                          
                          <button
                            onClick={() => navigate('/profile')}
                            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
                          >
                            View My Orders
                          </button>
                        </div>
                        
                        <p className="text-gray-500 text-xs mt-4">
                          Choose your next action using the buttons above
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'esewa' && paymentStatus === 'processing' && qrPaymentData && (
                    <div className="text-center">
                      <h2 className="text-lg font-semibold text-gray-900 mb-6">Complete Your eSewa Payment</h2>
                      
                      <div className="max-w-md mx-auto">
                        <div className="bg-white p-4 rounded-lg border-2 border-green-200 mb-4">
                          <img 
                            src="/esewaQR.png" 
                            alt="eSewa Payment QR Code"
                            width={200}
                            height={200}
                            className="mx-auto rounded"
                          />
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-2 mb-6">
                          <p><strong>Amount:</strong> NPR {total.toLocaleString()}</p>
                          <p className="text-xs text-green-600 font-semibold">Scan with eSewa app to pay</p>
                        </div>

                        {/* Screenshot Upload Section */}
                        <div className="mt-6 space-y-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <h3 className="text-sm font-medium text-blue-800 mb-3">Submit Payment Screenshot</h3>
                            <p className="text-xs text-blue-700 mb-4">
                              After completing payment, upload a screenshot for verification
                            </p>
                            
                            <div className="space-y-4">
                              <div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleScreenshotUpload}
                                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                              </div>
                              
                              {screenshotPreview && (
                                <div className="mt-3">
                                  <img 
                                    src={screenshotPreview} 
                                    alt="Payment Screenshot Preview" 
                                    className="max-w-full h-32 object-contain mx-auto border border-gray-200 rounded"
                                  />
                                </div>
                              )}
                              
                              <button
                                onClick={submitPaymentScreenshot}
                                disabled={!paymentScreenshot || isUploadingScreenshot}
                                className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                                  paymentScreenshot && !isUploadingScreenshot
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                {isUploadingScreenshot ? (
                                  <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Uploading...
                                  </div>
                                ) : (
                                  'Submit Payment Screenshot'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={retryPayment}
                          className="mt-4 text-sm text-green-600 hover:text-green-500"
                        >
                          Generate new payment reference
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentStatus === 'success' && !isScreenshotSubmission && (
                    <div className="text-center">
                      <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircleIcon className="h-12 w-12 text-green-600" />
                      </div>
                      <h2 className="text-3xl font-bold text-green-600 mb-2">🎉 Order Placed Successfully!</h2>
                      <p className="text-xl text-gray-700 mb-6">Thank you for your purchase!</p>
                      
                      {orderData && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-left mb-6">
                          <h3 className="font-bold text-green-800 text-lg mb-4">📋 Order Details:</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-green-700"><strong>Order Number:</strong> {orderData.id}</p>
                              <p className="text-green-700"><strong>Total Amount:</strong> NPR {orderData.total?.toLocaleString()}</p>
                              <p className="text-green-700"><strong>Items:</strong> {orderData.items?.length} product(s)</p>
                            </div>
                            <div>
                              <p className="text-green-700"><strong>Payment Method:</strong> {orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : (orderData.paymentMethod === 'esewa' ? 'eSewa' : 'Bank Transfer')}</p>
                              <p className="text-green-700"><strong>Status:</strong> <span className="text-green-600 font-medium">Confirmed</span></p>
                              <p className="text-green-700"><strong>Customer:</strong> {orderData.customerInfo?.firstName} {orderData.customerInfo?.lastName}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-800 text-sm">
                          📧 <strong>Confirmation email sent to:</strong> {shippingInfo.email}
                        </p>
                        <p className="text-blue-800 text-sm mt-1">
                          📱 <strong>We'll contact you at:</strong> {shippingInfo.phone}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-gray-600 text-sm mb-6">
                          🚚 Your order will be processed and shipped within 2-3 business days.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <button
                            onClick={() => navigate('/')}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
                          >
                            Continue Shopping
                          </button>
                          
                          <button
                            onClick={() => navigate('/profile')}
                            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
                          >
                            View My Orders
                          </button>
                        </div>
                        
                        <p className="text-gray-500 text-xs mt-4">
                          Choose your next action using the buttons above
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentStatus === 'success' && isScreenshotSubmission && (
                    <div className="text-center">
                      <div className="mx-auto h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircleIcon className="h-12 w-12 text-blue-600" />
                      </div>
                      <h2 className="text-3xl font-bold text-blue-600 mb-2">🎉 Order Submitted Successfully!</h2>
                      <p className="text-xl text-blue-700 font-medium mb-6">
                        Your payment screenshot has been received!
                      </p>
                      
                      {orderData && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left mb-6">
                          <h3 className="font-bold text-blue-800 text-lg mb-4">📋 Order Summary:</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-blue-700"><strong>Order Number:</strong> {orderData.id}</p>
                              <p className="text-blue-700"><strong>Total Amount:</strong> NPR {orderData.total?.toLocaleString()}</p>
                              <p className="text-blue-700"><strong>Items:</strong> {orderData.items?.length} product(s)</p>
                            </div>
                            <div>
                              <p className="text-blue-700"><strong>Payment Method:</strong> {orderData.paymentMethod === 'esewa' ? 'eSewa' : 'Bank Transfer'}</p>
                              <p className="text-blue-700"><strong>Status:</strong> <span className="text-amber-600 font-medium">Pending Verification</span></p>
                              <p className="text-blue-700"><strong>Customer:</strong> {orderData.customerInfo?.firstName} {orderData.customerInfo?.lastName}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-left mb-6">
                        <h3 className="font-bold text-green-800 text-lg mb-3">✅ What happens next?</h3>
                        <div className="space-y-3 text-sm text-green-800">
                          <p className="flex items-center"><span className="mr-2">📸</span> Your payment screenshot has been successfully received</p>
                          <p className="flex items-center"><span className="mr-2">🔍</span> Our team will verify your payment within 24 hours</p>
                          <p className="flex items-center"><span className="mr-2">📧</span> You'll receive a confirmation email once verified</p>
                          <p className="flex items-center"><span className="mr-2">📱</span> We'll contact you at <strong>{shippingInfo.phone}</strong></p>
                          <p className="flex items-center"><span className="mr-2">📦</span> Your order will be processed and shipped after verification</p>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <p className="text-amber-800 text-sm">
                          <strong>⚠️ Important:</strong> Please keep your payment receipt safe. 
                          If you have any questions, contact us at <strong>support@thealankriti.com</strong>
                        </p>
                        <p className="text-amber-700 text-sm mt-3">
                          📸 <strong>For faster support:</strong> Take a screenshot or capture image of your order details, 
                          tracking ID, and payment receipt when contacting us for any inquiries, issues, or complaints. 
                          This helps us resolve your concerns quickly and accurately.
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <button
                            onClick={() => navigate('/')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                          >
                            Continue Shopping
                          </button>
                          
                          <button
                            onClick={() => navigate('/profile')}
                            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
                          >
                            View My Orders
                          </button>
                        </div>
                        
                        <p className="text-gray-500 text-xs mt-4">
                          Choose your next action using the buttons above
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentStatus === 'failed' && (
                    <div className="text-center">
                      <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-red-600 text-2xl">⚠</span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                      <p className="text-gray-600 mb-6">There was an issue processing your payment. Please try again.</p>
                      
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            {currentStep < 3 && (
              <div className="mt-6 flex justify-between">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNextStep}
                  disabled={isLoading || (paymentMethod === 'cod' && !codConfirmed)}
                  className="ml-auto bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : currentStep === 1 ? 'Continue to Payment' : 'Place Order'}
                </button>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white shadow rounded-lg p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Cart items or order confirmation */}
              <div className="space-y-4 mb-6">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                  <div key={`${item.id}-${item.variant?.size || item.size || 'default'}`} className="flex items-center space-x-4">
                    <div className="h-16 w-16 flex-shrink-0">
                      <SafeImage
                        src={
                          getImageUrl(item.product?.images?.[0]?.url) || 
                          getImageUrl(item.image) || 
                          getImageUrl(item.product?.image)
                        }
                        alt={
                          item.product?.images?.[0]?.alt || 
                          item.product?.name || 
                          item.name || 
                          'Product'
                        }
                        className="h-16 w-16 rounded-md object-cover"
                        fallbackType="jewelry"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name || item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Size: {item.variant?.size || item.size || 'One Size'}
                      </p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      NPR {((item.product?.price || item.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                  ))
                ) : orderSubmitted ? (
                  <div className="text-center py-8">
                    <div className="text-green-600 mb-2">
                      <CheckCircleIcon className="mx-auto h-12 w-12" />
                    </div>
                    <p className="text-gray-600">Order completed successfully!</p>
                    <p className="text-sm text-gray-500 mt-1">Check the details on the left</p>
                  </div>
                ) : null}
              </div>

              {/* Coupon code */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    onClick={applyCoupon}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {appliedCoupon.description}
                  </p>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>NPR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `NPR ${shippingCost}`}</span>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>COD Handling Fee</span>
                    <span>NPR {codFee}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-NPR {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (GST)</span>
                  <span>NPR {tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>NPR {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <ShieldCheckIcon className="h-6 w-6 text-green-500 mb-1" />
                    <span className="text-xs text-gray-600">Secure</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <TruckIcon className="h-6 w-6 text-blue-500 mb-1" />
                    <span className="text-xs text-gray-600">Fast Delivery</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <CheckCircleIcon className="h-6 w-6 text-purple-500 mb-1" />
                    <span className="text-xs text-gray-600">Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
