import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
import { useCart } from '../../contexts/CartContext';
import { Link } from 'react-router-dom';

const CartSidebar = () => {
  const { 
    isOpen, 
    setIsOpen, 
    items, 
    updateQuantity, 
    removeItem, 
    getTotalPrice,
    getTotalItems 
  } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-start justify-between p-4 border-b">
                      <Dialog.Title className="text-lg font-medium text-gray-900 flex items-center">
                        <ShoppingBagIcon className="h-6 w-6 mr-2 text-amber-600" />
                        Shopping Cart ({getTotalItems()})
                      </Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                      {items.length === 0 ? (
                        <div className="text-center py-12">
                          <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Start shopping to add items to your cart.
                          </p>
                          <div className="mt-6">
                            <Link
                              to="/products"
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
                            >
                              Continue Shopping
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {items.map((item) => (
                            <div key={`${item.id}-${item.variant || 'default'}`} className="flex">
                              {/* Product Image */}
                              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover object-center"
                                />
                              </div>

                              {/* Product Details */}
                              <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>
                                      <Link 
                                        to={`/products/${item.id}`}
                                        onClick={() => setIsOpen(false)}
                                        className="hover:text-amber-600"
                                      >
                                        {item.name}
                                      </Link>
                                    </h3>
                                    <p className="ml-4">{formatPrice(item.price * item.quantity)}</p>
                                  </div>
                                  {item.variant && (
                                    <p className="mt-1 text-sm text-gray-500">
                                      Size: {item.variant}
                                    </p>
                                  )}
                                  <p className="text-sm text-gray-500">
                                    {formatPrice(item.price)} each
                                  </p>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex flex-1 items-end justify-between text-sm">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                                      className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={item.quantity <= 1}
                                    >
                                      <MinusIcon className="h-4 w-4" />
                                    </button>
                                    <span className="mx-2 min-w-[2rem] text-center">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                                      className="p-1 rounded-md hover:bg-gray-100"
                                    >
                                      <PlusIcon className="h-4 w-4" />
                                    </button>
                                  </div>

                                  <div className="flex">
                                    <button
                                      type="button"
                                      onClick={() => removeItem(item.id, item.variant)}
                                      className="text-amber-600 hover:text-amber-700 p-1"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                      <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                        {/* Subtotal */}
                        <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                          <p>Subtotal</p>
                          <p>{formatPrice(getTotalPrice())}</p>
                        </div>
                        
                        {/* Shipping Info */}
                        <p className="mt-0.5 text-sm text-gray-500 mb-4">
                          {getTotalPrice() >= 5000 ? (
                            <span className="text-green-600 font-medium">
                              🎉 Free shipping applied!
                            </span>
                          ) : (
                            <>
                              Shipping calculated at checkout. 
                              <br />
                              <span className="font-medium">
                                Add {formatPrice(5000 - getTotalPrice())} for free shipping
                              </span>
                            </>
                          )}
                        </p>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <Link
                            to="/cart"
                            onClick={() => setIsOpen(false)}
                            className="w-full flex justify-center items-center px-6 py-3 border border-amber-600 text-base font-medium text-amber-600 bg-white rounded-md hover:bg-amber-50 transition-colors"
                          >
                            View Cart
                          </Link>
                          <Link
                            to="/checkout"
                            onClick={() => setIsOpen(false)}
                            className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 transition-colors"
                          >
                            Checkout
                          </Link>
                        </div>

                        {/* Continue Shopping */}
                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                          <p>
                            or{' '}
                            <Link
                              to="/products"
                              onClick={() => setIsOpen(false)}
                              className="font-medium text-amber-600 hover:text-amber-700"
                            >
                              Continue Shopping
                              <span aria-hidden="true"> &rarr;</span>
                            </Link>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CartSidebar;
