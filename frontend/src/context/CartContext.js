import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isOpen: false,
};

// Action types
const CartActionTypes = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  TOGGLE_CART: 'TOGGLE_CART',
  OPEN_CART: 'OPEN_CART',
  CLOSE_CART: 'CLOSE_CART',
  APPLY_COUPON: 'APPLY_COUPON',
  REMOVE_COUPON: 'REMOVE_COUPON',
  LOAD_CART: 'LOAD_CART',
};

// Utility functions
const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return { totalItems, totalAmount };
};

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : initialState;
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return initialState;
  }
};

// Reducer
const cartReducer = (state, action) => {
  let newItems;
  let newState;

  switch (action.type) {
    case CartActionTypes.LOAD_CART:
      return action.payload;

    case CartActionTypes.ADD_ITEM:
      const { product, quantity = 1, variant } = action.payload;
      
      // Always add as a new separate item, even if it's the same product
      // This ensures each product addition appears as a distinct cart item
      const newItem = {
        id: `${product._id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        product,
        quantity,
        price: product.price,
        variant,
      };
      newItems = [...state.items, newItem];

      newState = {
        ...state,
        items: newItems,
        ...calculateTotals(newItems),
      };
      
      saveCartToStorage(newState);
      return newState;

    case CartActionTypes.UPDATE_QUANTITY:
      const { itemId, newQuantity } = action.payload;
      
      if (newQuantity <= 0) {
        return cartReducer(state, { type: CartActionTypes.REMOVE_ITEM, payload: itemId });
      }

      newItems = state.items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );

      newState = {
        ...state,
        items: newItems,
        ...calculateTotals(newItems),
      };
      
      saveCartToStorage(newState);
      return newState;

    case CartActionTypes.REMOVE_ITEM:
      newItems = state.items.filter(item => item.id !== action.payload);
      
      newState = {
        ...state,
        items: newItems,
        ...calculateTotals(newItems),
      };
      
      saveCartToStorage(newState);
      return newState;

    case CartActionTypes.CLEAR_CART:
      newState = {
        ...initialState,
        isOpen: state.isOpen,
      };
      
      saveCartToStorage(newState);
      return newState;

    case CartActionTypes.TOGGLE_CART:
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case CartActionTypes.OPEN_CART:
      return {
        ...state,
        isOpen: true,
      };

    case CartActionTypes.CLOSE_CART:
      return {
        ...state,
        isOpen: false,
      };

    case CartActionTypes.APPLY_COUPON:
      const { coupon, discountAmount } = action.payload;
      
      newState = {
        ...state,
        coupon,
        discount: discountAmount,
        totalAmount: state.totalAmount - discountAmount,
      };
      
      saveCartToStorage(newState);
      return newState;

    case CartActionTypes.REMOVE_COUPON:
      const originalAmount = state.totalAmount + (state.discount || 0);
      
      newState = {
        ...state,
        coupon: null,
        discount: 0,
        totalAmount: originalAmount,
      };
      
      saveCartToStorage(newState);
      return newState;

    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    if (savedCart && savedCart.items.length > 0) {
      dispatch({ type: CartActionTypes.LOAD_CART, payload: savedCart });
    }
  }, []);

  // Add item to cart
  const addItem = (product, quantity = 1, variant = null) => {
    dispatch({
      type: CartActionTypes.ADD_ITEM,
      payload: { product, quantity, variant },
    });
    
    toast.success(`${product.name} added to cart!`);
  };

  // Update item quantity
  const updateQuantity = (itemId, newQuantity) => {
    dispatch({
      type: CartActionTypes.UPDATE_QUANTITY,
      payload: { itemId, newQuantity },
    });
  };

  // Remove item from cart
  const removeItem = (itemId) => {
    dispatch({
      type: CartActionTypes.REMOVE_ITEM,
      payload: itemId,
    });
    
    toast.success('Item removed from cart');
  };

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: CartActionTypes.CLEAR_CART });
    toast.success('Cart cleared');
  };

  // Toggle cart sidebar
  const toggleCart = () => {
    dispatch({ type: CartActionTypes.TOGGLE_CART });
  };

  // Open cart sidebar
  const openCart = () => {
    dispatch({ type: CartActionTypes.OPEN_CART });
  };

  // Close cart sidebar
  const closeCart = () => {
    dispatch({ type: CartActionTypes.CLOSE_CART });
  };

  // Apply coupon
  const applyCoupon = (coupon, discountAmount) => {
    dispatch({
      type: CartActionTypes.APPLY_COUPON,
      payload: { coupon, discountAmount },
    });
    
    toast.success(`Coupon "${coupon}" applied!`);
  };

  // Remove coupon
  const removeCoupon = () => {
    dispatch({ type: CartActionTypes.REMOVE_COUPON });
    toast.success('Coupon removed');
  };

  // Get item count for a specific product
  const getItemCount = (productId, variant = null) => {
    const item = state.items.find(
      item => 
        item.product._id === productId && 
        JSON.stringify(item.variant) === JSON.stringify(variant)
    );
    
    return item ? item.quantity : 0;
  };

  // Check if item is in cart
  const isInCart = (productId, variant = null) => {
    return getItemCount(productId, variant) > 0;
  };

  // Get total weight (if needed for shipping)
  const getTotalWeight = () => {
    return state.items.reduce((total, item) => {
      const weight = item.product.specifications?.weight?.value || 0;
      return total + (weight * item.quantity);
    }, 0);
  };

  // Calculate estimated shipping
  const getEstimatedShipping = () => {
    if (state.totalAmount > 5000) return 0; // Free shipping above NPR 5000
    return 200; // Standard shipping
  };

  // Calculate estimated tax (18% GST)
  const getEstimatedTax = () => {
    return state.totalAmount * 0.18;
  };

  // Get final total with shipping and tax
  const getFinalTotal = () => {
    const subtotal = state.totalAmount;
    const shipping = getEstimatedShipping();
    const tax = getEstimatedTax();
    const discount = state.discount || 0;
    
    return subtotal + shipping + tax - discount;
  };

  // Context value
  const value = {
    ...state,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    applyCoupon,
    removeCoupon,
    getItemCount,
    isInCart,
    getTotalWeight,
    getEstimatedShipping,
    getEstimatedTax,
    getFinalTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};

export default CartContext;
