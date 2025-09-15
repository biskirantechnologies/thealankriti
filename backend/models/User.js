const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      orderUpdates: {
        type: Boolean,
        default: true
      },
      promotions: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'super_admin'],
    default: 'customer'
  },
  addresses: [{
    type: {
      type: String,
      enum: ['shipping', 'billing'],
      default: 'shipping'
    },
    title: {
      type: String,
      default: 'Home'
    },
    firstName: String,
    lastName: String,
    company: String,
    street: String,
    apartment: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    },
    phone: String,
    isDefault: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  activity: {
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0
    },
    lastOrderDate: Date,
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    lastViewedProducts: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      }
    }],
    wishlist: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    browsingHistory: [{
      page: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      duration: Number // in seconds
    }],
    loginHistory: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      ipAddress: String,
      userAgent: String,
      platform: String
    }],
    sessionData: {
      currentSession: {
        startTime: Date,
        lastActivity: Date,
        pageViews: {
          type: Number,
          default: 0
        },
        actions: [String]
      },
      preferences: {
        currency: {
          type: String,
          default: 'NPR'
        },
        language: {
          type: String,
          default: 'en'
        },
        notifications: {
          email: {
            type: Boolean,
            default: true
          },
          sms: {
            type: Boolean,
            default: false
          },
          push: {
            type: Boolean,
            default: true
          }
        }
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update activity stats when user data changes
userSchema.pre('save', function(next) {
  // Initialize activity object if it doesn't exist
  if (!this.activity) {
    this.activity = {
      loginCount: 0,
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      lastViewedProducts: [],
      wishlist: []
    };
  }
  
  // Update last login if it was modified
  if (this.isModified('activity.lastLogin')) {
    this.activity.loginCount += 1;
  }
  
  next();
});

// Update user statistics method
userSchema.methods.updateOrderStats = async function(orderValue) {
  this.activity.totalOrders += 1;
  this.activity.totalSpent += orderValue;
  this.activity.averageOrderValue = this.activity.totalSpent / this.activity.totalOrders;
  this.activity.lastOrderDate = new Date();
  return this.save();
};

// Add product to recently viewed
userSchema.methods.addToRecentlyViewed = function(productId) {
  // Remove if already exists
  this.activity.lastViewedProducts = this.activity.lastViewedProducts.filter(
    item => item.productId.toString() !== productId.toString()
  );
  
  // Add to beginning
  this.activity.lastViewedProducts.unshift({
    productId: productId,
    viewedAt: new Date()
  });
  
  // Keep only last 20 items
  if (this.activity.lastViewedProducts.length > 20) {
    this.activity.lastViewedProducts = this.activity.lastViewedProducts.slice(0, 20);
  }
  
  return this.save();
};

// Add to wishlist
userSchema.methods.addToWishlist = function(productId) {
  // Check if already in wishlist
  const exists = this.activity.wishlist.some(
    item => item.productId.toString() === productId.toString()
  );
  
  if (!exists) {
    this.activity.wishlist.push({
      productId: productId,
      addedAt: new Date()
    });
  }
  
  return this.save();
};

// Remove from wishlist
userSchema.methods.removeFromWishlist = function(productId) {
  this.activity.wishlist = this.activity.wishlist.filter(
    item => item.productId.toString() !== productId.toString()
  );
  
  return this.save();
};

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
