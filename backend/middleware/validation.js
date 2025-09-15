const Joi = require('joi');

const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    firstName: Joi.string().trim().min(2).max(50).required().messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
    lastName: Joi.string().trim().min(2).max(50).required().messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),
    phone: Joi.string().pattern(/^[+]?[1-9][\d\s\-()]{7,15}$/).optional().messages({
      'string.pattern.base': 'Please provide a valid phone number'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }
  next();
};

const validateProduct = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().min(10).max(2000).required(),
    shortDescription: Joi.string().trim().max(300).optional(),
    category: Joi.string().valid('rings', 'necklaces', 'earrings', 'bracelets', 'pendants', 'sets', 'watches', 'chains').required(),
    subCategory: Joi.string().trim().optional(),
    price: Joi.number().positive().required(),
    originalPrice: Joi.number().positive().optional(),
    discount: Joi.number().min(0).max(100).optional(),
    sku: Joi.string().trim().uppercase().required(),
    specifications: Joi.object({
      metal: Joi.string().valid('gold', 'silver', 'platinum', 'rose-gold', 'white-gold', 'brass', 'copper', 'titanium').optional(),
      purity: Joi.string().valid('14k', '18k', '22k', '24k', '925-silver', 'platinum-950').optional(),
      gemstone: Joi.string().valid('diamond', 'ruby', 'emerald', 'sapphire', 'pearl', 'topaz', 'amethyst', 'citrine', 'none').optional(),
      weight: Joi.object({
        value: Joi.number().positive().optional(),
        unit: Joi.string().valid('grams', 'carats').optional()
      }).optional()
    }).optional(),
    stock: Joi.object({
      quantity: Joi.number().min(0).required(),
      lowStockThreshold: Joi.number().min(0).optional()
    }).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    featured: Joi.boolean().optional(),
    trending: Joi.boolean().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }
  next();
};

const validateOrder = (req, res, next) => {
  const schema = Joi.object({
    items: Joi.array().items(
      Joi.object({
        product: Joi.string().optional(), // Make optional for cases where we have productSnapshot
        productSnapshot: Joi.object({
          name: Joi.string().required(),
          sku: Joi.string().optional(),
          image: Joi.string().optional(),
          price: Joi.number().min(0).required(),
          specifications: Joi.object().optional()
        }).optional(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().min(0).required(),
        variant: Joi.object({
          name: Joi.string().optional(),
          value: Joi.string().optional()
        }).optional()
      })
    ).min(1).required(),
    customerInfo: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().optional(),
      userId: Joi.string().optional()
    }).optional(),
    shippingAddress: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      street: Joi.string().required(),
      apartment: Joi.string().allow('').optional(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().optional(),
      landmark: Joi.string().allow('').optional()
    }).required(),
    billingAddress: Joi.object({
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().optional(),
      street: Joi.string().optional(),
      apartment: Joi.string().allow('').optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().optional()
    }).optional(),
    payment: Joi.object({
      method: Joi.string().valid('qr-code', 'upi', 'card', 'cod', 'bank-transfer').optional(),
      status: Joi.string().valid('pending', 'completed', 'failed').optional(),
      transactionId: Joi.string().optional()
    }).optional(),
    pricing: Joi.object({
      subtotal: Joi.number().min(0).required(),
      shippingCost: Joi.number().min(0).optional(),
      tax: Joi.number().min(0).optional(),
      discount: Joi.number().min(0).optional(),
      total: Joi.number().min(0).required()
    }).optional(),
    couponCode: Joi.string().optional(),
    couponDiscount: Joi.number().min(0).optional(),
    notes: Joi.object({
      customerNotes: Joi.string().allow('').max(500).optional(),
      specialInstructions: Joi.string().allow('').max(500).optional(),
      giftMessage: Joi.string().allow('').max(200).optional()
    }).optional(),
    orderSource: Joi.string().optional(),
    deviceInfo: Joi.object({
      userAgent: Joi.string().optional(),
      platform: Joi.string().optional(),
      timestamp: Joi.string().optional()
    }).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProduct,
  validateOrder
};
