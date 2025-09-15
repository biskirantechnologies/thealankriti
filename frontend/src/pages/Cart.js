import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet-async';

const Cart = () => {
  const { cartItems = [], updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const total = getTotalPrice() || 0;

  if (!cartItems || cartItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart - The Alankriti</title>
          <meta name="description" content="Your shopping cart is empty. Browse our exquisite jewelry collection and add items to your cart." />
        </Helmet>
        
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Discover our beautiful jewelry collection and add items to your cart.</p>
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gold hover:bg-gold-dark transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Shopping Cart (${cartItems?.length || 0} items) - The Alankriti`}</title>
        <meta name="description" content={`Review your ${cartItems?.length || 0} selected jewelry items before checkout. Total: NPR ${total.toLocaleString()}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">{cartItems?.length || 0} item{(cartItems?.length || 0) !== 1 ? 's' : ''} in your cart</p>
          </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
            {/* Cart Items */}
            <section className="lg:col-span-7">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {(cartItems || []).map((item) => (
                    <li key={item.id} className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-24 h-24">
                          <img
                            className="w-full h-full object-cover rounded-md"
                            src={item.images?.[0] || '/api/placeholder/96/96'}
                            alt={item.name}
                          />
                        </div>

                        <div className="ml-6 flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">
                                <Link to={`/products/${item.id}`} className="hover:text-gold">
                                  {item.name}
                                </Link>
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                              <p className="text-lg font-semibold text-gold mt-2">NPR {item.price?.toLocaleString()}</p>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-2 text-gray-400 hover:text-gray-500"
                              >
                                <MinusIcon className="h-4 w-4" />
                              </button>
                              <span className="px-4 py-2 text-gray-900 font-medium">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-2 text-gray-400 hover:text-gray-500"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                NPR {((item.price || 0) * item.quantity).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                NPR {item.price?.toLocaleString()} each
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clear Cart */}
              <div className="mt-6">
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Clear entire cart
                </button>
              </div>
            </section>

            {/* Order Summary */}
            <section className="lg:col-span-5 mt-16 lg:mt-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4">
                  <div className="flex justify-between text-base text-gray-900">
                    <p>Subtotal ({cartItems?.length || 0} items)</p>
                    <p>NPR {total.toLocaleString()}</p>
                  </div>

                  <div className="flex justify-between text-base text-gray-900">
                    <p>Shipping</p>
                    <p className="text-green-600">Free</p>
                  </div>

                  <div className="flex justify-between text-base text-gray-900">
                    <p>Tax</p>
                    <p>Calculated at checkout</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-medium text-gray-900">
                      <p>Total</p>
                      <p>NPR {total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {user ? (
                    <Link
                      to="/checkout"
                      className="w-full bg-gold text-white py-3 px-4 rounded-md font-medium hover:bg-gold-dark transition-colors text-center block"
                    >
                      Proceed to Checkout
                    </Link>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/login?redirect=/checkout"
                        className="w-full bg-gold text-white py-3 px-4 rounded-md font-medium hover:bg-gold-dark transition-colors text-center block"
                      >
                        Login to Checkout
                      </Link>
                      <p className="text-sm text-gray-500 text-center">
                        New customer?{' '}
                        <Link to="/register" className="text-gold hover:text-gold-dark">
                          Create an account
                        </Link>
                      </p>
                    </div>
                  )}

                  <Link
                    to="/products"
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors text-center block"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Security & Trust */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-3">Secure Checkout</p>
                    <div className="flex justify-center space-x-4 text-gray-400">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs">SSL Encrypted</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs">Safe Payment</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
