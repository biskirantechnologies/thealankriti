const mongoose = require('mongoose');

// Test the Product model with image processing
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ukriti-jewells', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected for testing');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Import Product model
const Product = require('./models/Product');

const testImageProcessing = async () => {
  try {
    await connectDB();
    
    console.log('\n🧪 Testing Image Processing Logic...\n');
    
    // Test Case 1: String array (new uploads)
    const stringImages = [
      '/uploads/products/product-123.jpg',
      '/uploads/products/product-456.jpg'
    ];
    
    const processedStringImages = stringImages.map((image, index) => {
      if (typeof image === 'string' && image.trim() !== '') {
        return {
          url: image,
          alt: `Test Product image ${index + 1}`,
          isPrimary: index === 0
        };
      }
      return null;
    }).filter(img => img !== null && img.url);
    
    console.log('📸 String Array Input:', stringImages);
    console.log('📸 Processed Output:', processedStringImages);
    
    // Test Case 2: Object array (existing format)
    const objectImages = [
      { url: '/uploads/products/product-789.jpg', alt: 'Existing image', isPrimary: true },
      { url: '/uploads/products/product-012.jpg', alt: 'Existing image 2', isPrimary: false }
    ];
    
    const processedObjectImages = objectImages.map((image, index) => {
      if (typeof image === 'object' && image !== null && image.url) {
        return image;
      }
      return null;
    }).filter(img => img !== null && img.url);
    
    console.log('\n📸 Object Array Input:', objectImages);
    console.log('📸 Processed Output:', processedObjectImages);
    
    // Test Case 3: Create a test product
    const testProduct = new Product({
      name: 'Test Ring',
      description: 'A beautiful test ring',
      category: 'rings',
      price: 1000,
      sku: `TEST_${Date.now()}`,
      images: processedStringImages,
      stock: {
        quantity: 5,
        lowStockThreshold: 5,
        status: 'in-stock'
      },
      isActive: true
    });
    
    const savedProduct = await testProduct.save();
    console.log('\n✅ Test Product Created Successfully!');
    console.log('📦 Product ID:', savedProduct._id);
    console.log('📸 Saved Images:', savedProduct.images);
    
    // Clean up - delete test product
    await Product.findByIdAndDelete(savedProduct._id);
    console.log('\n🧹 Test product cleaned up');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test Error:', error);
    process.exit(1);
  }
};

testImageProcessing();
