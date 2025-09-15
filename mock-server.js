const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Mock products data
const mockProducts = [
  {
    _id: '1',
    name: 'Diamond Engagement Ring',
    category: 'rings',
    subCategory: 'engagement',
    price: 85000,
    specifications: { metal: 'white-gold', gemstone: 'diamond' },
    images: [{ url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500' }],
    featured: true,
    isActive: true
  },
  {
    _id: '2', 
    name: 'Gold Traditional Necklace',
    category: 'necklaces',
    subCategory: 'traditional',
    price: 45000,
    specifications: { metal: 'gold', gemstone: 'ruby' },
    images: [{ url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=500' }],
    featured: true,
    isActive: true
  },
  {
    _id: '3',
    name: 'Silver Pearl Earrings',
    category: 'earrings', 
    subCategory: 'drop',
    price: 12500,
    specifications: { metal: 'silver', gemstone: 'pearl' },
    images: [{ url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500' }],
    featured: false,
    isActive: true
  },
  {
    _id: '4',
    name: 'Rose Gold Modern Bracelet',
    category: 'bracelets',
    subCategory: 'modern', 
    price: 32000,
    specifications: { metal: 'rose-gold', gemstone: 'none' },
    images: [{ url: 'https://images.unsplash.com/photo-1596944924591-1aa7b83b7b3d?w=500' }],
    featured: false,
    isActive: true
  },
  {
    _id: '5',
    name: 'Emerald Vintage Pendant',
    category: 'pendants',
    subCategory: 'vintage',
    price: 67000,
    specifications: { metal: 'gold', gemstone: 'emerald' },
    images: [{ url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500' }],
    featured: true,
    isActive: true
  }
];

// Products API endpoint
app.get('/api/products', (req, res) => {
  const {
    category,
    subCategory,
    metal,
    gemstone,
    minPrice,
    maxPrice,
    search,
    featured,
    page = 1,
    limit = 12,
    sortBy = 'createdAt'
  } = req.query;

  let filteredProducts = [...mockProducts];

  // Apply filters
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  if (subCategory) {
    filteredProducts = filteredProducts.filter(p => p.subCategory === subCategory);
  }
  
  if (metal) {
    filteredProducts = filteredProducts.filter(p => p.specifications.metal === metal);
  }
  
  if (gemstone) {
    filteredProducts = filteredProducts.filter(p => p.specifications.gemstone === gemstone);
  }
  
  if (featured === 'true') {
    filteredProducts = filteredProducts.filter(p => p.featured === true);
  }
  
  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
  }
  
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower) ||
      p.subCategory.toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json({
    products: paginatedProducts,
    totalProducts: filteredProducts.length,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredProducts.length / parseInt(limit)),
      totalProducts: filteredProducts.length,
      limit: parseInt(limit),
      hasNext: endIndex < filteredProducts.length,
      hasPrev: parseInt(page) > 1
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock server running' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Mock server running on port ${PORT}`);
  console.log(`📊 Mock data: ${mockProducts.length} products`);
  console.log(`🔗 Test: http://localhost:${PORT}/api/products`);
});

module.exports = app;
