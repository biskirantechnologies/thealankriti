# TheAlankriti API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URLs](#base-urls)
4. [Common Response Format](#common-response-format)
5. [Error Handling](#error-handling)
6. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Products](#products-endpoints)
   - [Orders](#orders-endpoints)
   - [Users](#users-endpoints)
   - [Admin](#admin-endpoints)
   - [Payment](#payment-endpoints)
7. [File Upload](#file-upload)
8. [Rate Limiting](#rate-limiting)

## Overview

TheAlankriti API is a RESTful API for managing an online jewelry store. It provides endpoints for user authentication, product management, order processing, payment handling, and administrative functions.

**Version:** 2.0  
**Last Updated:** September 21, 2025

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Types
- **Access Token**: Used for API requests (expires in 24 hours)
- **Refresh Token**: Used to refresh access tokens (expires in 30 days)

## Base URLs

- **Development:** `http://localhost:5000/api`
- **Production:** `https://thealankriti-backend.onrender.com/api`

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

## Error Handling

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error - Server error |

---

# API Endpoints

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer"
  }
}
```

### Login User
**POST** `/auth/login`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Admin Login
**POST** `/auth/admin-login`

Admin authentication endpoint.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "adminPassword123"
}
```

### Get Current User
**GET** `/auth/me`  
**Authorization Required**

Get current authenticated user information.

### Refresh Token
**POST** `/auth/refresh`

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token-here"
}
```

---

## Products Endpoints

### Get All Products
**GET** `/products`

Retrieve products with filtering, sorting, and pagination.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 12) - Items per page
- `category` (string) - Filter by category
- `subCategory` (string) - Filter by subcategory
- `metal` (string) - Filter by metal type
- `gemstone` (string) - Filter by gemstone
- `minPrice` (number) - Minimum price filter
- `maxPrice` (number) - Maximum price filter
- `search` (string) - Text search
- `sortBy` (string, default: 'createdAt') - Sort field
- `sortOrder` (string, default: 'desc') - Sort direction
- `featured` (boolean) - Filter featured products
- `trending` (boolean) - Filter trending products

**Response:**
```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "pages": 5,
    "total": 50,
    "limit": 12
  },
  "filters": {
    "categories": [...],
    "metals": [...],
    "gemstones": [...]
  }
}
```

### Get Single Product
**GET** `/products/:id`

Get detailed information about a specific product.

### Get Featured Products
**GET** `/products/featured`

Get featured products.

**Query Parameters:**
- `limit` (number, default: 8) - Number of products to return

### Get Product Categories
**GET** `/products/categories`

Get all available product categories.

### Get Product Filters
**GET** `/products/filters`

Get available filter options (metals, gemstones, etc.).

### Add Product Review
**POST** `/products/:id/reviews`  
**Authorization Required**

Add a review to a product.

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent product!",
  "title": "Great Quality"
}
```

---

## Orders Endpoints

### Create Order
**POST** `/orders`  
**Authorization Required**

Create a new order.

**Request Body:**
```json
{
  "items": [
    {
      "product": "product-id",
      "quantity": 1,
      "price": 25000,
      "customization": {
        "engraving": "Custom text"
      }
    }
  ],
  "customerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "shippingAddress": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "postalCode": "12345",
    "country": "Country"
  },
  "billingAddress": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "postalCode": "12345",
    "country": "Country"
  },
  "payment": {
    "method": "esewa",
    "provider": "esewa"
  },
  "pricing": {
    "subtotal": 25000,
    "shipping": 0,
    "tax": 2500,
    "total": 27500
  }
}
```

### Get User Orders
**GET** `/orders`  
**Authorization Required**

Get orders for the authenticated user.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string) - Filter by order status

### Get Single Order
**GET** `/orders/:id`  
**Authorization Required**

Get detailed information about a specific order.

### Track Order
**GET** `/orders/track/:orderNumber`

Track an order by order number (public endpoint).

### Cancel Order
**PUT** `/orders/:id/cancel`  
**Authorization Required**

Cancel an order.

**Request Body:**
```json
{
  "reason": "Changed mind"
}
```

---

## Users Endpoints

### Get User Profile
**GET** `/users/profile`  
**Authorization Required**

Get user profile information.

### Update User Profile
**PUT** `/users/profile`  
**Authorization Required**

Update user profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01"
}
```

### Get User Dashboard
**GET** `/users/dashboard`  
**Authorization Required**

Get user dashboard data (orders, wishlist, etc.).

### Address Management

#### Add Address
**POST** `/users/addresses`  
**Authorization Required**

#### Update Address
**PUT** `/users/addresses/:addressId`  
**Authorization Required**

#### Delete Address
**DELETE** `/users/addresses/:addressId`  
**Authorization Required**

### Wishlist Management

#### Add to Wishlist
**POST** `/users/wishlist`  
**Authorization Required**

**Request Body:**
```json
{
  "productId": "product-id"
}
```

#### Remove from Wishlist
**DELETE** `/users/wishlist/:productId`  
**Authorization Required**

#### Get Wishlist
**GET** `/users/wishlist`  
**Authorization Required**

---

## Admin Endpoints

All admin endpoints require admin authentication.

### Dashboard

#### Get Admin Dashboard
**GET** `/admin/dashboard`  
**Authorization Required (Admin)**

Get dashboard statistics.

**Query Parameters:**
- `period` (number, default: 30) - Days to include in statistics

**Response:**
```json
{
  "stats": {
    "totalOrders": 150,
    "totalRevenue": 750000,
    "pendingOrders": 12,
    "lowStockProducts": 5
  },
  "charts": {
    "dailySales": [...],
    "topProducts": [...],
    "ordersByStatus": [...]
  }
}
```

### Product Management

#### Get All Products (Admin)
**GET** `/admin/products`  
**Authorization Required (Admin)**

#### Get Single Product (Admin)
**GET** `/admin/products/:id`  
**Authorization Required (Admin)**

#### Create Product
**POST** `/admin/products`  
**Authorization Required (Admin)**
**Content-Type:** `multipart/form-data`

#### Update Product
**PUT** `/admin/products/:id`  
**Authorization Required (Admin)**

#### Delete Product
**DELETE** `/admin/products/:id`  
**Authorization Required (Admin)**

#### Update Product Stock
**PUT** `/admin/products/:id/stock`  
**Authorization Required (Admin)**

### Order Management

#### Get All Orders (Admin)
**GET** `/admin/orders`  
**Authorization Required (Admin)**

#### Get Single Order (Admin)
**GET** `/admin/orders/:id`  
**Authorization Required (Admin)**

#### Update Order Status
**PUT** `/admin/orders/:id/status`  
**Authorization Required (Admin)**

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Order confirmed and processing"
}
```

#### Export Orders
**GET** `/admin/orders/export`  
**Authorization Required (Admin)**

Returns CSV file with order data.

### Customer Management

#### Get All Customers
**GET** `/admin/customers`  
**Authorization Required (Admin)**

#### Get Single Customer
**GET** `/admin/customers/:id`  
**Authorization Required (Admin)**

#### Update Customer Status
**PUT** `/admin/customers/:id/status`  
**Authorization Required (Admin)**

---

## Payment Endpoints

### Generate QR Code
**POST** `/payment/generate-qr`  
**Authorization Required**

Generate payment QR code for eSewa.

**Request Body:**
```json
{
  "orderId": "order-id"
}
```

### Verify Payment
**POST** `/payment/verify`  
**Authorization Required**

Verify payment status.

**Request Body:**
```json
{
  "orderId": "order-id",
  "transactionId": "transaction-id"
}
```

### Get Payment Methods
**GET** `/payment/methods`

Get available payment methods.

### Get eSewa Info
**GET** `/payment/esewa-info`

Get eSewa payment information and QR code.

---

## File Upload

### Product Images
Product images are uploaded using multipart/form-data to the `/admin/products` endpoint.

**Supported formats:** JPEG, PNG, WebP  
**Maximum size:** 10MB per file  
**Maximum files:** 10 per product

### File Structure
```
uploads/
  products/
    product-{timestamp}-{random}.{ext}
  payment-screenshots/
    payment-{timestamp}-{random}.{ext}
```

### Image URLs
Images are served from:
- Development: `http://localhost:5000/uploads/...`
- Production: `https://thealankriti-backend.onrender.com/uploads/...`

---

## Rate Limiting

- **General API:** 100 requests per 15 minutes per IP
- **Authentication:** 5 login attempts per 15 minutes per IP
- **File Upload:** 10 uploads per hour per authenticated user

---

## Status Codes Reference

### Order Status
- `pending` - Order placed, awaiting confirmation
- `confirmed` - Order confirmed by admin
- `processing` - Order being prepared
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled
- `refunded` - Order refunded

### Payment Status
- `pending` - Payment not yet processed
- `completed` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded

### Product Stock Status
- `in-stock` - Available for purchase
- `low-stock` - Limited quantity available
- `out-of-stock` - Not available
- `discontinued` - No longer available

---

## Examples

### Complete Order Flow

1. **Browse Products**
```bash
GET /api/products?featured=true&limit=4
```

2. **Get Product Details**
```bash
GET /api/products/60f1b2b3c4d5e6f7a8b9c0d1
```

3. **Register/Login**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

4. **Create Order**
```bash
POST /api/orders
Authorization: Bearer <token>
{
  "items": [
    {
      "product": "60f1b2b3c4d5e6f7a8b9c0d1",
      "quantity": 1,
      "price": 25000
    }
  ],
  ...
}
```

5. **Generate Payment QR**
```bash
POST /api/payment/generate-qr
Authorization: Bearer <token>
{
  "orderId": "ORD-20250921-001"
}
```

6. **Verify Payment**
```bash
POST /api/payment/verify
Authorization: Bearer <token>
{
  "orderId": "ORD-20250921-001",
  "transactionId": "ESW-12345"
}
```

---

## Health Check

### Server Health
**GET** `/health`

Check server health and status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-21T10:30:00.000Z",
  "service": "TheAlankriti API",
  "environment": "production",
  "port": "5000",
  "uptime": 3600,
  "memory": "85MB",
  "version": "2.0-SessionManagement"
}
```

### Debug Endpoint
**GET** `/api/debug`

Debug endpoint for connectivity testing.

---

## Support

For API support and questions:
- **Email:** support@thealankriti.com
- **Documentation Issues:** Create an issue in the project repository
- **API Status:** Check health endpoint for real-time status

---

**Note:** This documentation is automatically generated and regularly updated. Always refer to the latest version for accurate information.