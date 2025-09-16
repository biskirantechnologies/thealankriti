import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  TruckIcon, 
  EnvelopeIcon, 
  PrinterIcon,
  ShareIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Fetch order details
    const fetchOrder = async () => {
      // Simulate API call
      setTimeout(() => {
        const mockOrder = {
          id: orderId,
          date: new Date().toISOString(),
          status: 'confirmed',
          total: 45999,
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          trackingNumber: `TRK${orderId}`,
          items: [
            {
              id: 1,
              name: 'Elegant Diamond Necklace',
              price: 45999,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'
            }
          ],
          shippingAddress: {
            name: 'John Doe',
            address: '123 Main Street, Apartment 4B',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
          }
        };
        setOrder(mockOrder);
        setLoading(false);
      }, 1000);
    };

    fetchOrder();
  }, [orderId]);

  const shareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Order Confirmed - Ukriti Jewells',
        text: `I just ordered beautiful jewelry from Ukriti Jewells! Order #${orderId}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const downloadInvoice = () => {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '#'; // In real app, this would be the PDF URL
    link.download = `invoice-${orderId}.pdf`;
    // link.click();
    alert('Invoice download feature will be implemented with backend integration');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
          <p className="mt-2 text-gray-600">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success animation and message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </motion.div>

        {/* Order details card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white shadow-lg rounded-lg overflow-hidden mb-8"
        >
          {/* Order summary header */}
          <div className="bg-gradient-to-r from-primary-600 to-gold-600 px-6 py-4">
            <div className="flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                <p className="text-primary-100">Placed on {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">NPR {order.total.toLocaleString()}</p>
                <p className="text-primary-100 capitalize">{order.status}</p>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="px-6 py-4">
            <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">NPR {item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping information */}
          <div className="px-6 py-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Shipping Address</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
              <p className="text-gray-600">{order.shippingAddress.address}</p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
            </div>
          </div>

          {/* Delivery information */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center text-green-600 mb-2">
                  <TruckIcon className="h-5 w-5 mr-2" />
                  <span className="font-medium">Estimated Delivery</span>
                </div>
                <p className="text-gray-900 font-semibold">{order.estimatedDelivery}</p>
                <p className="text-sm text-gray-500">Tracking #: {order.trackingNumber}</p>
              </div>
              <div>
                <div className="flex items-center text-blue-600 mb-2">
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  <span className="font-medium">Order Confirmation</span>
                </div>
                <p className="text-gray-900">Email sent to your registered email</p>
                <p className="text-sm text-gray-500">Check your inbox for details</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={downloadInvoice}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 font-medium"
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            Download Invoice
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
          >
            <TruckIcon className="h-5 w-5 mr-2" />
            Track Order
          </button>
          
          <button
            onClick={shareOrder}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 font-medium"
          >
            <ShareIcon className="h-5 w-5 mr-2" />
            Share
          </button>
        </motion.div>

        {/* Next steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-white rounded-lg shadow p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">1</span>
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Order Confirmation</p>
                <p className="text-sm text-gray-600">You'll receive an email confirmation with your order details and invoice.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">2</span>
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Order Processing</p>
                <p className="text-sm text-gray-600">Our artisans will carefully prepare your jewelry for shipping.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">3</span>
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Shipping & Delivery</p>
                <p className="text-sm text-gray-600">Your order will be shipped securely and delivered to your address.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Continue shopping */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-primary-600 hover:text-primary-500 font-medium"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Continue Shopping
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
