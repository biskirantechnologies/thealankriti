// Test to identify the exact validation issue
const validOrderData = {
  items: [
    {
      product: '67001e45123456789abcdef0',
      productSnapshot: {
        name: 'Test Product', 
        price: 1500,
        sku: 'TEST-001',
        image: 'test.jpg'
      },
      quantity: 1,
      price: 1500
    }
  ],
  customerInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+977-9800000000'
  },
  shippingAddress: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+977-9800000000',
    street: 'Test Street 123',
    apartment: 'Apt 1',
    city: 'Kathmandu',
    state: 'Bagmati',
    zipCode: '44600',
    country: 'Nepal',
    landmark: 'Near Test Landmark'
  },
  billingAddress: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+977-9800000000',
    street: 'Test Street 123',
    apartment: 'Apt 1',
    city: 'Kathmandu',
    state: 'Bagmati',
    zipCode: '44600',
    country: 'Nepal'
  },
  payment: {
    method: 'esewa',
    status: 'completed',
    transactionId: 'TEST-' + Date.now(),
    hasScreenshot: true,
    screenshotData: { message: 'test' },
    verificationStatus: 'pending_verification'
  },
  pricing: {
    subtotal: 1500,
    shippingCost: 0,
    tax: 0,
    discount: 0,
    total: 1500
  },
  couponDiscount: 0,
  notes: {
    customerNotes: '',
    specialInstructions: '',
    giftMessage: ''
  },
  orderSource: 'website',
  deviceInfo: {
    userAgent: 'Mozilla/5.0 Test',
    platform: 'Test-Platform',
    timestamp: new Date().toISOString()
  }
};

console.log('📋 Complete Frontend Order Data Structure:');
console.log(JSON.stringify(validOrderData, null, 2));

console.log('\n🔍 Checking for potential validation issues:');

// Check for any problematic fields
const checkFields = (obj, path = '') => {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (value === null) {
      console.log(`⚠️  Null value found at: ${currentPath}`);
    }
    
    if (value === undefined) {
      console.log(`⚠️  Undefined value found at: ${currentPath}`);
    }
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      checkFields(value, currentPath);
    }
    
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          checkFields(item, `${currentPath}[${index}]`);
        }
      });
    }
  }
};

checkFields(validOrderData);

console.log('\n✅ Field check complete. If no warnings above, data structure looks valid.');
console.log('\n💡 To test this data against the API:');
console.log('1. Start the backend server: node server.js');
console.log('2. Run: node debug-validation.js');