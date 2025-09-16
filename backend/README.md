# Ukriti Jewells Backend API

A comprehensive Node.js/Express backend for the Ukriti Jewells jewelry store e-commerce platform.

## Features

### Core Functionality
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Product Management**: Full CRUD operations with advanced filtering and search
- **Order Management**: Complete order lifecycle with status tracking
- **Payment Integration**: QR code-based UPI payments with webhook support
- **Notification System**: Email and WhatsApp notifications
- **PDF Generation**: Automated invoice generation
- **Admin Dashboard**: Comprehensive analytics and management interface

### Payment Features
- UPI QR code generation for seamless payments
- Payment verification and webhook handling
- Support for multiple payment methods (extensible)
- Automated receipt generation

### Notification Features
- Order confirmation emails with PDF invoices
- WhatsApp notifications to admin and customers
- Real-time order status updates
- Customizable email templates

### Admin Features
- Dashboard with sales analytics
- Order management with status updates
- Product inventory management
- Customer management
- Low stock alerts
- Sales reporting

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: UPI QR codes with QRCode library
- **PDF Generation**: PDFKit
- **Email**: Nodemailer
- **WhatsApp**: Twilio API
- **Validation**: Joi
- **Security**: Helmet, bcryptjs, CORS
- **File Upload**: Multer
- **Testing**: Jest & Supertest

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup Steps

1. **Clone and Navigate**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```

4. **Configure Environment Variables**
   Edit `.env` file with your settings:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/ukriti_jewells
   
   # JWT Secret
   JWT_SECRET=your_super_secure_jwt_secret
   
   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   STORE_EMAIL=store@ukritijewells.com
   
   # Twilio/WhatsApp
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   STORE_WHATSAPP_NUMBER=whatsapp:+1234567890
   
   # Payment
   UPI_ID=ukritijewells@paytm
   STORE_NAME=Ukriti Jewells
   
   # Admin Credentials
   ADMIN_EMAIL=admin@ukritijewells.com
   ADMIN_PASSWORD=admin123
   ```

5. **Seed Database** (Optional)
   ```bash
   npm run seed
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get products with filters/pagination
- `GET /api/products/featured` - Get featured products
- `GET /api/products/trending` - Get trending products
- `GET /api/products/categories` - Get product categories
- `GET /api/products/filters` - Get filter options
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Soft delete product (Admin)
- `POST /api/products/:id/reviews` - Add product review

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/confirm-payment` - Confirm payment
- `GET /api/orders/track/:orderNumber` - Track order (Public)
- `POST /api/orders/:id/cancel` - Cancel order

### Payment
- `POST /api/payment/generate-qr` - Generate payment QR
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/methods` - Get payment methods
- `POST /api/payment/webhook` - Payment webhook
- `GET /api/payment/upi-apps` - Get UPI app links

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:id` - Get order details
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/products` - Get all products
- `PUT /api/admin/products/:id/stock` - Update stock
- `GET /api/admin/customers` - Get customers
- `GET /api/admin/analytics` - Get analytics data

## Configuration

### Email Setup
For Gmail SMTP:
1. Enable 2-factor authentication
2. Generate app password
3. Use app password in EMAIL_PASS

### WhatsApp Setup
1. Create Twilio account
2. Enable WhatsApp sandbox
3. Configure webhook URLs
4. Update environment variables

### Payment Setup
1. Configure UPI ID in environment
2. For production, integrate with payment gateway
3. Set up webhook endpoints
4. Configure payment verification

## Database Schema

### User Model
- Authentication and profile information
- Role-based access control
- Address management
- Password hashing with bcrypt

### Product Model
- Complete product information
- Image gallery support
- Specifications and variants
- Stock management
- Review system
- SEO optimization

### Order Model
- Comprehensive order tracking
- Payment integration
- Status history
- Shipping information
- Customer snapshots

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation with Joi
- CORS configuration
- Helmet security headers
- Environment variable protection

## File Structure

```
backend/
├── config/
│   └── database.js         # MongoDB connection
├── middleware/
│   ├── auth.js             # Authentication middleware
│   ├── errorHandler.js     # Global error handling
│   └── validation.js       # Input validation
├── models/
│   ├── User.js             # User schema
│   ├── Product.js          # Product schema
│   └── Order.js            # Order schema
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── products.js         # Product routes
│   ├── orders.js           # Order routes
│   ├── payment.js          # Payment routes
│   └── admin.js            # Admin routes
├── utils/
│   ├── emailService.js     # Email functionality
│   ├── whatsappService.js  # WhatsApp integration
│   ├── pdfService.js       # PDF generation
│   └── qrService.js        # QR code generation
├── scripts/
│   └── seedData.js         # Database seeding
├── uploads/                # File uploads
├── invoices/               # Generated invoices
├── .env.example            # Environment template
├── server.js               # Main server file
└── package.json            # Dependencies
```

## Testing

Run the test suite:
```bash
npm test
```

Test specific endpoints:
```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ukritijewells.com","password":"admin123"}'

# Test products
curl http://localhost:5000/api/products?category=rings&limit=5
```

## Deployment

### Environment Setup
1. Set NODE_ENV=production
2. Configure production database
3. Set up SSL certificates
4. Configure domain and CORS

### Production Checklist
- [ ] Environment variables configured
- [ ] Database secured
- [ ] JWT secret is strong
- [ ] Email service configured
- [ ] WhatsApp service configured
- [ ] Payment gateway integrated
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Backup strategy implemented

### Deployment Options

**Heroku**
```bash
heroku create ukriti-jewells-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_production_db
# ... set other env vars
git push heroku main
```

**Railway**
```bash
railway login
railway new
railway add
railway deploy
```

**DigitalOcean App Platform**
1. Connect GitHub repository
2. Configure environment variables
3. Set build and run commands
4. Deploy

## API Documentation

Visit `/health` endpoint to check server status.

For detailed API documentation, use tools like:
- Postman collection
- Swagger/OpenAPI documentation
- Insomnia workspace

## Monitoring and Logs

### Health Check
```bash
curl http://localhost:5000/health
```

### Logs
- Application logs: Console output
- Error logs: Error handler middleware
- Access logs: Morgan middleware

### Performance Monitoring
Consider integrating:
- New Relic
- DataDog
- Sentry for error tracking

## Support

For support and questions:
- Email: support@ukritijewells.com
- Documentation: Check inline code comments
- Issues: Create GitHub issues for bugs

## License

MIT License - see LICENSE file for details.

---

**Ukriti Jewells Backend API** - Built with ❤️ for seamless jewelry e-commerce experience.
