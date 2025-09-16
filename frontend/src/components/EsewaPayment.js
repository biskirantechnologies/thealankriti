import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCodeIcon, DevicePhoneMobileIcon, ClockIcon } from '@heroicons/react/24/outline';
import QRCode from 'qrcode.react';

const EsewaPayment = ({ amount, orderId, onPaymentComplete, onPaymentFailed }) => {
  const [qrData, setQrData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const esewaId = '9765723517';
  const storeName = 'Ukriti Jewells';

  useEffect(() => {
    generateQRCode();
    startTimer();
  }, []);

  const generateQRCode = () => {
    const transactionId = `UJ${Date.now()}`;
    const esewaUrl = `esewa://pay?scd=${esewaId}&pn=${encodeURIComponent(storeName)}&am=${amount}&cu=NPR&tr=${transactionId}&tn=${encodeURIComponent(`Payment for Order ${orderId}`)}`;
    
    setQrData({
      url: esewaUrl,
      transactionId,
      amount,
      esewaId
    });
  };

  const startTimer = () => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRefresh = () => {
    generateQRCode();
    setTimeLeft(300);
    setPaymentStatus('pending');
  };

  const handleManualVerification = () => {
    setPaymentStatus('processing');
    // Simulate verification process
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate
      if (success) {
        setPaymentStatus('success');
        onPaymentComplete && onPaymentComplete(qrData.transactionId);
      } else {
        setPaymentStatus('failed');
        onPaymentFailed && onPaymentFailed('Verification failed');
      }
    }, 3000);
  };

  if (!qrData) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Generating eSewa payment...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <QrCodeIcon className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Pay with eSewa</h3>
        <p className="text-gray-600 mt-1">Scan QR code to complete payment</p>
      </div>

      {/* Timer */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
        <div className="flex items-center justify-center text-orange-700">
          <ClockIcon className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Time remaining: {formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-white border-2 border-green-200 rounded-lg p-6 mb-6">
        <div className="text-center">
          <QRCode
            value={qrData.url}
            size={200}
            level="M"
            fgColor="#22c55e"
            bgColor="#ffffff"
          />
          <p className="text-sm text-green-600 font-semibold mt-4">
            Scan with eSewa app
          </p>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Payment Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">eSewa ID:</span>
            <span className="font-medium">{esewaId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">NPR {amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Reference:</span>
            <span className="font-medium text-xs">{qrData.transactionId}</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-green-800 mb-3">How to Pay:</h4>
        <ol className="text-sm text-green-700 space-y-1">
          <li>1. Open eSewa mobile app</li>
          <li>2. Tap "Scan & Pay" or "QR"</li>
          <li>3. Scan the QR code above</li>
          <li>4. Verify amount and details</li>
          <li>5. Enter your eSewa PIN</li>
          <li>6. Confirm payment</li>
        </ol>
      </div>

      {/* Status and Actions */}
      {paymentStatus === 'pending' && (
        <div className="space-y-3">
          <button
            onClick={handleManualVerification}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            I have completed the payment
          </button>
          
          <button
            onClick={handleRefresh}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-300 transition-colors"
          >
            Refresh QR Code
          </button>
        </div>
      )}

      {paymentStatus === 'processing' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-green-600 font-medium">Verifying payment...</p>
        </div>
      )}

      {paymentStatus === 'success' && (
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-green-600 font-medium">Payment Successful!</p>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">Payment verification failed</p>
          <button
            onClick={handleRefresh}
            className="mt-3 text-sm text-green-600 hover:text-green-500"
          >
            Try again
          </button>
        </div>
      )}

      {paymentStatus === 'expired' && (
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <ClockIcon className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-orange-600 font-medium">Payment session expired</p>
          <button
            onClick={handleRefresh}
            className="mt-3 bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700 transition-colors"
          >
            Generate new QR code
          </button>
        </div>
      )}

      {/* Support */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700 text-center">
          Need help? Contact us at 9765723517 or support@ukritijewells.com
        </p>
      </div>
    </div>
  );
};

export default EsewaPayment;
