const axios = require('axios');

async function testOrderCreation() {
  try {
    const orderData = {
      items: [{
        product: "64abc123def456789",
        productSnapshot: {
          name: "Test Product",
          sku: "TEST123",
          image: "test.jpg",
          price: 1000,
          specifications: {}
        },
        quantity: 1,
        price: 1000
      }],
      customerInfo: {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        phone: "+91-9876543210"
      },
      shippingAddress: {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        phone: "+91-9876543210",
        street: "123 Test Street",
        apartment: "",
        city: "Test City",
        state: "Test State",
        zipCode: "123456",
        country: "India"
      },
      payment: {
        method: "upi",
        status: "pending",
        transactionId: "TEST123"
      },
      pricing: {
        subtotal: 1000,
        shippingCost: 50,
        tax: 180,
        discount: 0,
        total: 1230
      }
    };

    console.log('Testing order creation...');
    const response = await axios.post('http://localhost:3001/api/orders', orderData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // We'll need a real token
      }
    });
    
    console.log('Order created successfully:', response.data);
  } catch (error) {
    console.error('Order creation failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Details:', error.response?.data);
  }
}

testOrderCreation();
