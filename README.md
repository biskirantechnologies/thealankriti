# TheAlankriti - Complete E-commerce Platform

A comprehensive, production-ready e-commerce platform for a jewelry store featuring a React frontend, Node.js/Express backend, QR code payments, automated invoicing, and complete admin management system.

## 🌟 Features Overview

### Customer Features
- **Modern Shopping Experience**: Responsive design with product browsing, filtering, and search
- **QR Code Payments**: Seamless UPI payments via QR code scanning
- **Order Tracking**: Real-time order status updates and tracking
- **User Accounts**: Registration, login, profile management, and order history
- **Product Reviews**: Customer reviews and ratings system
- **Shopping Cart**: Persistent cart with coupon support

### Admin Features
- **Dashboard Analytics**: Sales metrics, revenue tracking, and performance insights
- **Order Management**: Process orders, update status, and manage fulfillment
- **Product Management**: Full CRUD operations for products and inventory
- **Customer Management**: View and manage customer accounts
- **Notification System**: Automated email and WhatsApp notifications

### Payment & Notifications
- **QR Code Integration**: Generate UPI payment QR codes for orders
- **Automated Invoicing**: PDF invoice generation and email delivery
- **WhatsApp Integration**: Order notifications via Twilio WhatsApp API
- **Email Notifications**: Order confirmations and status updates

## 🛠 Tech Stack

### Frontend
- **React 18** with functional components and hooks
- **React Router** for routing
- **React Query** for server state management
- **Tailwind CSS** for styling with custom design system
- **Framer Motion** for animations
- **React Hook Form** for form handling
- **Axios** for API communication

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** authentication with role-based access
- **Nodemailer** for email services
- **Twilio** for WhatsApp integration
- **PDFKit** for invoice generation
- **QRCode** library for payment QR codes

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd thealankriti
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run seed  # Seed sample data
   npm run dev   # Start development server
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start     # Start React development server
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:3000/admin

## 📋 Project Structure

```
thealankriti/
├── backend/                 # Node.js API server
│   ├── config/             # Database configuration
│   ├── middleware/         # Auth, validation, error handling
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── utils/             # Email, WhatsApp, PDF, QR services
│   ├── scripts/           # Database seeding
│   └── server.js          # Main server file
├── frontend/               # React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## ⚙️ Configuration

### Environment Variables

**Backend (.env)**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/thealankriti

# JWT Secret
JWT_SECRET=your_super_secure_jwt_secret

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
STORE_EMAIL=store@thealankriti.com

# WhatsApp/Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
STORE_WHATSAPP_NUMBER=whatsapp:+1234567890

# Payment
UPI_ID=thealankriti@paytm
STORE_NAME=TheAlankriti

# Admin Credentials
ADMIN_EMAIL=admin@thealankriti.com
ADMIN_PASSWORD=admin123
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STORE_NAME=TheAlankriti
```

## 🎯 Key Features Implementation

### 1. QR Code Payment Flow
- Customer adds items to cart and proceeds to checkout
- System generates UPI QR code with payment details
- Customer scans QR with any UPI app (PhonePe, Google Pay, etc.)
- Payment verification and order confirmation
- Automated invoice generation and email delivery

### 2. Admin Order Management
- Real-time order dashboard with status overview
- Update order status (Processing → Shipped → Delivered)
- Automatic customer notifications via email/WhatsApp
- Invoice download and re-send capabilities

### 3. Product Management
- Full product CRUD with image gallery support
- Advanced filtering (category, metal type, price range, gemstone)
- Stock management with low-stock alerts
- SEO optimization and review system

### 4. Notification System
- **Email**: Order confirmations, status updates, invoices
- **WhatsApp**: Admin order alerts, customer status updates
- **Templates**: Customizable HTML email templates

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### API Testing
Use the included Postman collection or test endpoints directly:
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test product listing
curl http://localhost:5000/api/products

# Test admin login
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@thealankriti.com","password":"admin123"}'
```

## 🚀 Deployment

### Backend Deployment

**Heroku**
```bash
cd backend
heroku create thealankriti-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_production_db_url
# Set other environment variables
git push heroku main
```

**Railway**
```bash
cd backend
railway login
railway new
railway add
railway deploy
```

### Frontend Deployment

**Vercel**
```bash
cd frontend
vercel --prod
```

**Netlify**
```bash
cd frontend
npm run build
# Upload dist folder to Netlify
```

## 📊 Sample Data

The project includes comprehensive sample data:
- **10 sample products** across different categories
- **Admin user** with default credentials
- **Product categories** and specifications
- **Review data** for demonstration

## 🔧 Customization

### Adding New Payment Methods
1. Update payment routes in `backend/routes/payment.js`
2. Add payment method UI in `frontend/src/components/Checkout/`
3. Update payment verification logic

### Customizing Email Templates
Edit templates in `backend/utils/emailService.js`:
- Order confirmation emails
- Admin notification emails
- Invoice templates

### Adding New Product Categories
1. Update product model in `backend/models/Product.js`
2. Add categories to frontend filters
3. Update seeding data

## 📱 Mobile Responsiveness

The application is fully responsive with:
- Mobile-first design approach
- Touch-friendly interfaces
- Optimized images and performance
- Progressive Web App capabilities

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Joi
- Rate limiting
- CORS configuration
- Environment variable protection
- SQL injection prevention

## 📈 Performance Optimizations

- Lazy loading of React components
- Image optimization
- Database indexing
- Query optimization
- Caching strategies
- Compression middleware

## 🛡️ Production Checklist

### Backend
- [ ] Environment variables configured
- [ ] Database secured and backed up
- [ ] JWT secret is cryptographically secure
- [ ] Email service configured and tested
- [ ] WhatsApp service configured and tested
- [ ] Payment gateway integrated and tested
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Error logging implemented
- [ ] Performance monitoring set up

### Frontend
- [ ] Environment variables configured
- [ ] API endpoints updated for production
- [ ] SEO optimization completed
- [ ] Performance optimized
- [ ] PWA features enabled
- [ ] Analytics integrated
- [ ] Error boundary implemented

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check MongoDB service is running
- Verify connection string in .env
- Ensure network connectivity

**Email Notifications Not Working**
- Verify SMTP credentials
- Check email service settings
- Ensure less secure app access enabled (Gmail)

**WhatsApp Notifications Failing**
- Verify Twilio credentials
- Check WhatsApp sandbox configuration
- Ensure webhook URLs are configured

**Payment QR Not Generating**
- Check UPI ID configuration
- Verify QR code library installation
- Test with sample payment data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: support@thealankriti.com
- **Documentation**: Check individual README files in backend and frontend folders
- **Issues**: Create GitHub issues for bugs and feature requests

## 🙏 Acknowledgments

- React and Node.js communities
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for smooth animations
- All open-source contributors

---

**TheAlankriti E-commerce Platform** - Built with ❤️ for seamless jewelry shopping experience.

*Ready for production deployment with comprehensive features for both customers and administrators.*
