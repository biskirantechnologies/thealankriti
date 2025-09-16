const express = require('express');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subCategory,
      metal,
      gemstone,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured,
      trending
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (metal) filter['specifications.metal'] = metal;
    if (gemstone) filter['specifications.gemstone'] = gemstone;
    if (featured === 'true') filter.featured = true;
    if (trending === 'true') filter.trending = true;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-reviews'); // Exclude reviews for performance

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ 
      isActive: true, 
      featured: true 
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('-reviews');

    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/trending
// @desc    Get trending products
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ 
      isActive: true, 
      trending: true 
    })
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(parseInt(limit))
    .select('-reviews');

    res.json(products);
  } catch (error) {
    console.error('Get trending products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/categories
// @desc    Get product categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/filters
// @desc    Get available filter options
// @access  Public
router.get('/filters', async (req, res) => {
  try {
    const [metals, gemstones, priceRange] = await Promise.all([
      Product.distinct('specifications.metal', { isActive: true }),
      Product.distinct('specifications.gemstone', { isActive: true }),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { 
          _id: null, 
          minPrice: { $min: '$price' }, 
          maxPrice: { $max: '$price' } 
        }}
      ])
    ]);

    res.json({
      metals: metals.filter(Boolean),
      gemstones: gemstones.filter(Boolean),
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
    });
  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).populate('reviews.user', 'firstName lastName');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create new product (Admin only)
// @access  Private/Admin
router.post('/', adminAuth, validateProduct, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product (Admin only)
// @access  Private/Admin
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (Admin only) - Hard delete from database
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Hard delete - completely remove from database
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product permanently deleted from database' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Add product review
// @access  Private
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Add review
    product.reviews.push({
      user: req.user.id,
      rating,
      comment,
      date: new Date()
    });

    // Recalculate average rating
    product.calculateAverageRating();
    await product.save();

    res.status(201).json({
      message: 'Review added successfully',
      averageRating: product.averageRating,
      totalReviews: product.totalReviews
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
