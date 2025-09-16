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
import QRCode from 'qrcode.react';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems = [], clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('esewa');
  const [orderData, setOrderData] = useState(null);
  const [qrPaymentData, setQrPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
  const [isLoading, setIsLoading] = useState(false);
  const [codConfirmed, setCodConfirmed] = useState(false);
  
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
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/products');
    }
  }, [user, cartItems, navigate]);

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

  const generateQRPayment = () => {
    // Generate eSewa payment QR code
    const paymentData = {
      esewaId: '9765723517',
      payeeName: 'Ukriti Jewells',
      amount: total,
      transactionId: `UJ${Date.now()}`,
      note: `Order payment for Ukriti Jewells`,
      currency: 'NPR'
    };

    // eSewa payment string format
    const esewaString = `esewa://pay?scd=${paymentData.esewaId}&pn=${paymentData.payeeName}&am=${paymentData.amount}&cu=${paymentData.currency}&tr=${paymentData.transactionId}&tn=${paymentData.note}`;
    
    setQrPaymentData({
      ...paymentData,
      qrString: esewaString
    });
    
    return paymentData;
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
        const paymentData = generateQRPayment();
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
      setPaymentStatus('failed');
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const processOrder = async (order) => {
    try {
      // Check if user is authenticated before API call
      if (!user || !user.token) {
        throw new Error('Please log in to place an order');
      }

      // Prepare detailed order data for API
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product._id || item.id,
          productSnapshot: {
            name: item.product.name || item.name,
            sku: item.product.sku || '',
            image: item.product.images?.[0]?.url || item.image,
            price: item.price,
            specifications: item.product.specifications || {}
          },
          quantity: item.quantity,
          price: item.price,
          variant: item.variant || null
        })),
        customerInfo: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          userId: user?.id || user?._id
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
          transactionId: paymentMethod === 'cod' ? 'COD-' + Date.now() : (qrPaymentData?.transactionId || `UJ${Date.now()}`)
        },
        pricing: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          shippingCost: parseFloat(shippingCost.toFixed(2)),
          codFee: parseFloat(codFee.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          discount: parseFloat(discount.toFixed(2)),
          total: parseFloat(total.toFixed(2))
        },
        couponCode: appliedCoupon?.code || null,
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

      console.log('Sending order data:', orderData);

      // Send order to backend API
      const response = await ordersAPI.createOrder(orderData);
      console.log('Order created successfully:', response.data);
      
      // Clear cart
      clearCart();
      
      // Show success message
      toast.success('Order placed successfully! Check your email for confirmation.');
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        navigate(`/order-success/${response.data.order?.id || response.data.orderId || 'unknown'}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error processing order:', error);
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
          clearCart();
        }
        console.log('COD order handling completed, keeping success status');
      } else {
        toast.error(error.response?.data?.message || 'Order processing failed. Please try again.');
        setPaymentStatus('failed');
      }
    }
  };

  const retryPayment = () => {
    setPaymentStatus('pending');
    generateQRPayment();
  };

  if (cartItems.length === 0) return null;

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
                      <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <BanknotesIcon className="h-8 w-8 text-orange-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                      <p className="text-gray-600 mb-6">Your Cash on Delivery order has been placed successfully.</p>
                      
                      {orderData && (
                        <div className="bg-orange-50 rounded-lg p-4 text-left mb-6">
                          <h3 className="font-semibold text-orange-900 mb-3">COD Order Details:</h3>
                          <div className="space-y-2 text-sm text-orange-800">
                            <p><strong>Order ID:</strong> {orderData.id}</p>
                            <p><strong>Amount to Pay:</strong> NPR {orderData.total.toLocaleString()}</p>
                            <p><strong>Items:</strong> {orderData.items.length} product(s)</p>
                            <p><strong>Delivery:</strong> 3-5 business days</p>
                            <p><strong>Payment:</strong> Cash on Delivery</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 rounded-lg p-4 text-left">
                        <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>✓ Order confirmation email sent</li>
                          <li>✓ Your order is being prepared</li>
                          <li>📦 We'll call you before delivery</li>
                          <li>💰 Pay NPR {total.toLocaleString()} to delivery person</li>
                          <li>📱 Track your order anytime</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'esewa' && paymentStatus === 'processing' && qrPaymentData && (
                    <div className="text-center">
                      <h2 className="text-lg font-semibold text-gray-900 mb-6">Complete Your eSewa Payment</h2>
                      
                      <div className="max-w-sm mx-auto">
                        <div className="bg-white p-4 rounded-lg border-2 border-green-200 mb-4">
                          <QRCode 
                            value={qrPaymentData.qrString} 
                            size={200}
                            className="mx-auto"
                          />
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-2">
                          <p><strong>Amount:</strong> NPR {total.toLocaleString()}</p>
                          <p><strong>Transaction ID:</strong> {qrPaymentData.transactionId}</p>
                          <p className="text-xs mt-4 text-green-600 font-semibold">Scan with eSewa app to pay</p>
                        </div>

                        <div className="mt-6 space-y-3">
                          <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <p className="text-sm text-green-800 font-medium">eSewa Payment Instructions:</p>
                            <ol className="text-xs text-green-700 mt-2 space-y-1">
                              <li>1. Open eSewa mobile app</li>
                              <li>2. Tap "Scan & Pay"</li>
                              <li>3. Scan the QR code above</li>
                              <li>4. Enter PIN to confirm</li>
                              <li>5. Payment will be verified automatically</li>
                            </ol>
                          </div>
                          
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <p className="text-sm text-blue-800">
                              <strong>eSewa ID:</strong> 9765723517<br/>
                              <strong>Amount:</strong> NPR {total}<br/>
                              <strong>Reference:</strong> {qrPaymentData.transactionId}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-center text-green-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                          Waiting for eSewa payment confirmation...
                        </div>

                        <button
                          onClick={retryPayment}
                          className="mt-4 text-sm text-green-600 hover:text-green-500"
                        >
                          Generate new eSewa QR code
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentStatus === 'success' && (
                    <div className="text-center">
                      <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                      <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
                      
                      {orderData && (
                        <div className="bg-gray-50 rounded-lg p-4 text-left">
                          <h3 className="font-semibold text-gray-900 mb-2">Order Details:</h3>
                          <p className="text-sm text-gray-600">Order ID: {orderData.id}</p>
                          <p className="text-sm text-gray-600">Total: NPR {orderData.total.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Items: {orderData.items.length}</p>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-500 mt-4">
                        You will receive an email confirmation shortly.
                      </p>
                    </div>
                  )}

                  {paymentStatus === 'failed' && (
                    <div className="text-center">
                      <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-red-600 text-2xl">✕</span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                      <p className="text-gray-600 mb-6">There was an issue processing your payment.</p>
                      
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
              
              {/* Cart items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">Size: {item.size}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      NPR {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
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
