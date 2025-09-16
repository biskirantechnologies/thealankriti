const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    maxlength: 300
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['rings', 'necklaces', 'earrings', 'bracelets', 'pendants', 'sets', 'watches', 'chains']
  },
  subCategory: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price must be positive']
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  specifications: {
    metal: {
      type: String,
      enum: ['gold', 'silver', 'platinum', 'rose-gold', 'white-gold', 'brass', 'copper', 'titanium']
    },
    purity: {
      type: String,
      enum: ['14k', '18k', '22k', '24k', '925-silver', 'platinum-950']
    },
    gemstone: {
      type: String,
      enum: ['diamond', 'ruby', 'emerald', 'sapphire', 'pearl', 'topaz', 'amethyst', 'citrine', 'none']
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['grams', 'carats'],
        default: 'grams'
      }
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['mm', 'cm', 'inches'],
        default: 'mm'
      }
    }
  },
  stock: {
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Stock quantity cannot be negative'],
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    status: {
      type: String,
      enum: ['in-stock', 'low-stock', 'out-of-stock'],
      default: 'in-stock'
    }
  },
  variants: [{
    name: String, // e.g., "Size", "Color"
    value: String, // e.g., "Small", "Gold"
    price: Number,
    stock: Number,
    sku: String
  }],
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String]
}, {
  timestamps: true
});

// Update stock status based on quantity
productSchema.pre('save', function(next) {
  if (this.stock.quantity === 0) {
    this.stock.status = 'out-of-stock';
  } else if (this.stock.quantity <= this.stock.lowStockThreshold) {
    this.stock.status = 'low-stock';
  } else {
    this.stock.status = 'in-stock';
  }
  next();
});

// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = (totalRating / this.reviews.length).toFixed(1);
    this.totalReviews = this.reviews.length;
  }
};

// Text search index
productSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  'specifications.metal': 'text',
  'specifications.gemstone': 'text'
});

// Compound indexes for efficient queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ featured: 1, isActive: 1 });
productSchema.index({ trending: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });

module.exports = mongoose.model('Product', productSchema);
