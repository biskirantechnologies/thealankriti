import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  TruckIcon, 
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet-async';
import { userAPI } from '../services/api';
import { getImageWithFallback } from '../utils/api';
import toast from 'react-hot-toast';

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const trackingSteps = [
    {
      id: 'confirmed',
      title: 'Order Confirmed',
      description: 'Your order has been received and confirmed',
      icon: CheckCircleIcon
    },
    {
      id: 'processing',
      title: 'Processing',
      description: 'Your jewelry is being carefully prepared',
      icon: ClockIcon
    },
    {
      id: 'shipped',
      title: 'Shipped',
      description: 'Your order is on its way to you',
      icon: TruckIcon
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: 'Your order has been delivered successfully',
      icon: MapPinIcon
    }
  ];

  const getStepIndex = (status) => {
    const statusMap = {
      'pending': 0,
      'confirmed': 0,
      'processing': 1,
      'shipped': 2,
      'delivered': 3,
      'cancelled': -1
    };
    return statusMap[status] || 0;
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      toast.error('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    setNotFound(false);

    try {
      const response = await ordersAPI.trackOrder(trackingId);
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setNotFound(true);
        toast.error('Order not found');
      }
    } catch (error) {
      console.error('Tracking error:', error);
      setNotFound(true);
      toast.error('Order not found or tracking ID is invalid');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      <Helmet>
        <title>Track Your Order - Ukriti Jewells</title>
        <meta name="description" content="Track your jewelry order with Ukriti Jewells. Get real-time updates on your order status and delivery information." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
            <p className="text-lg text-gray-600">
              Enter your tracking ID to get real-time updates on your jewelry order
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <form onSubmit={handleTrackOrder} className="max-w-md mx-auto">
              <div className="mb-6">
                <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Tracking ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="trackingId"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="Enter your tracking ID (e.g., ORD123456789)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-white py-3 px-6 rounded-lg font-medium hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Tracking...' : 'Track Order'}
              </button>
            </form>
          </div>

          {/* Order Not Found */}
          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <ClockIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find an order with that tracking ID. Please check your tracking ID and try again.
              </p>
              <div className="text-sm text-gray-500">
                <p>Need help? Contact us:</p>
                <div className="flex items-center justify-center space-x-4 mt-2">
                  <span className="flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-1" />
                    +91-XXXXX-XXXXX
                  </span>
                  <span>|</span>
                  <span>support@ukritijewells.com</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Order Details */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Order #{order.trackingId}</h2>
                    <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total Amount</div>
                    <div className="text-2xl font-bold text-gold">{formatPrice(order.totalAmount)}</div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                    <div className="text-gray-600 space-y-1">
                      <p className="font-medium">{order.customerInfo.name}</p>
                      <p>{order.shippingAddress.address}</p>
                      {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                      <p className="flex items-center mt-2">
                        <PhoneIcon className="w-4 h-4 mr-1" />
                        {order.customerInfo.phone}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Status:</span>
                        <span className={`font-medium px-2 py-1 rounded text-xs ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Status:</span>
                        <span className={`font-medium px-2 py-1 rounded text-xs ${
                          order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className={`font-medium px-2 py-1 rounded text-xs ${
                          order.paymentMethod === 'cod' 
                            ? 'bg-orange-100 text-orange-800' 
                            : order.paymentMethod === 'esewa' || order.paymentMethod === 'esewa-qr'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.paymentMethod === 'cod' 
                            ? 'Cash on Delivery' 
                            : order.paymentMethod === 'esewa-qr'
                            ? 'eSewa QR'
                            : order.paymentMethod?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      {order.estimatedDelivery && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated Delivery:</span>
                          <span className="font-medium">{formatDate(order.estimatedDelivery)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracking Progress */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-8">Order Progress</h3>
                
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-200"></div>
                  <div 
                    className="absolute left-8 top-8 w-0.5 bg-gold transition-all duration-1000"
                    style={{ 
                      height: order.status === 'cancelled' ? '0%' : 
                              `${(getStepIndex(order.status) + 1) * 25}%` 
                    }}
                  ></div>

                  {/* Steps */}
                  <div className="space-y-8">
                    {trackingSteps.map((step, index) => {
                      const isCompleted = getStepIndex(order.status) >= index;
                      const isCurrent = getStepIndex(order.status) === index;
                      const Icon = step.icon;
                      
                      return (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative flex items-start"
                        >
                          <div className={`
                            relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-300
                            ${isCompleted 
                              ? 'bg-gold border-gold text-white' 
                              : isCurrent
                                ? 'bg-white border-gold text-gold'
                                : 'bg-white border-gray-200 text-gray-400'
                            }
                          `}>
                            <Icon className="w-6 h-6" />
                          </div>
                          
                          <div className="ml-6">
                            <h4 className={`text-lg font-semibold ${
                              isCompleted ? 'text-gray-900' : 
                              isCurrent ? 'text-gold' : 'text-gray-400'
                            }`}>
                              {step.title}
                            </h4>
                            <p className={`text-sm ${
                              isCompleted ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              {step.description}
                            </p>
                            {isCompleted && order.statusHistory?.find(h => h.status === step.id) && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center">
                                <CalendarIcon className="w-3 h-3 mr-1" />
                                {formatDate(order.statusHistory.find(h => h.status === step.id).timestamp)}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Cancelled Status */}
                {order.status === 'cancelled' && (
                  <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <ClockIcon className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-red-800">Order Cancelled</h4>
                        <p className="text-sm text-red-600">
                          {order.cancellationReason || 'This order has been cancelled. If you have any questions, please contact customer support.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                      <img
                        src={getImageWithFallback(item.image, 'Product')}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        {item.selectedSize && (
                          <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-sm text-gray-600">{formatPrice(item.price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(order.subtotal || order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">{formatPrice(order.tax || 0)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-gold">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div className="bg-gradient-to-r from-gold to-amber-500 rounded-lg p-8 text-white text-center">
                <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
                <p className="mb-4">Our customer support team is here to assist you</p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
                  <div className="flex items-center">
                    <PhoneIcon className="w-5 h-5 mr-2" />
                    <span>+91-XXXXX-XXXXX</span>
                  </div>
                  <div className="hidden sm:block text-white/60">|</div>
                  <div>
                    <span>support@ukritijewells.com</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default TrackOrder;
