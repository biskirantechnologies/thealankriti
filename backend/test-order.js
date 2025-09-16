const axios = require('axios');

const testOrder = async () => {
  try {
    // First login to get auth token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token received');

    // Create order with valid data
    const orderData = {
      items: [{
        product: "68b110db7ccce733c144d2d7", // Valid product ID
        productSnapshot: {
          name: "Test Product",
          sku: "TEST001",
          image: "test-image.jpg",
          price: 1000,
          specifications: {}
        },
        quantity: 2,
        price: 1000,
        variant: {}
      }],
      customerInfo: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "1234567890",
        userId: "68b115647ccce733c144d3a0" // Valid user ID from registration
      },
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "1234567890",
        street: "123 Main St",
        apartment: "",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        landmark: ""
      },
      billingAddress: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "1234567890",
        street: "123 Main St",
        apartment: "",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA"
      },
      payment: {
        method: "cod",
        status: "pending",
        transactionId: "TEST123"
      },
      pricing: {
        subtotal: 2000,
        shippingCost: 500,
        tax: 75,
        discount: 0,
        total: 2575
      },
      couponDiscount: 0,
      notes: {
        customerNotes: "Test notes",
        specialInstructions: "Test instructions",
        giftMessage: "Test message"
      },
      orderSource: "website",
      deviceInfo: {
        userAgent: "Test Agent",
        platform: "Test Platform",
        timestamp: new Date().toISOString()
      }
    };

    const response = await axios.post('http://localhost:3001/api/orders', orderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Order created successfully:', response.data);
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
};

testOrder();
