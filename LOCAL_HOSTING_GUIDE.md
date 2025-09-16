# 🚀 Ukriti Jewells - Local Hosting Guide

## ✅ **CURRENTLY RUNNING LOCAL SERVERS**

Your Ukriti Jewells application is **LIVE and RUNNING** locally! 🎉

### 🔗 **Access Your Application:**

#### **🛍️ Customer Portal**
- **URL**: http://localhost:3000
- **Purpose**: Customer shopping experience
- **Features**: Browse products, register, login, profile management

#### **🔒 Admin Portal** 
- **URL**: http://localhost:3000/admin-login
- **Purpose**: Administrative management
- **Credentials**: 
  - Email: `bewithu.aj@gmail.com`
  - Password: `admin123`

#### **📊 Backend API**
- **URL**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Base**: http://localhost:3001/api

---

## 📋 **Quick Commands**

### Start Services:
```bash
cd "/Users/aashisjha/Desktop/Ukriti Jewells"
./start.sh
```

### Check Status:
```bash
./status.sh
```

### Stop Services:
```bash
./stop.sh
```

### View Logs:
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs  
tail -f logs/frontend.log
```

---

## 🖥️ **Current Status:**
✅ **MongoDB**: Running (Database)  
✅ **Backend**: Running on port 3001 (API Server)  
✅ **Frontend**: Running on port 3000 (React App)  
✅ **Screen Sessions**: Both services running in background  

---

## 🛠️ **Tech Stack:**
- **Frontend**: React 18 + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Database**: MongoDB (localhost)
- **Image Storage**: Local uploads directory
- **Authentication**: JWT tokens
- **Admin Panel**: Full CRUD operations

---

## 🏪 **Website Features:**

### Customer Features:
- 💍 **Product Catalog**: Browse jewelry collections
- 🛒 **Shopping Cart**: Add/remove items
- 👤 **User Accounts**: Registration and login
- 📱 **Mobile Responsive**: Optimized for all devices
- 🔍 **Search & Filter**: Find products easily
- ❤️ **Wishlist**: Save favorite items
- 📦 **Order Tracking**: Monitor purchase status

### Admin Features:
- 📊 **Dashboard**: Sales analytics and insights
- 📝 **Product Management**: Add/edit/delete products
- 🖼️ **Image Upload**: Upload product photos
- 👥 **Customer Management**: View customer data
- 📋 **Order Management**: Process orders
- 📈 **Analytics**: Track performance metrics

---

## 🔧 **Development Commands:**

### Manual Server Control:
```bash
# Backend only
cd backend && npm start

# Frontend only  
cd frontend && npm start

# Install dependencies (if needed)
cd backend && npm install
cd frontend && npm install
```

### Database Operations:
```bash
# Check MongoDB status
brew services list | grep mongodb

# Start MongoDB (if stopped)
brew services start mongodb/brew/mongodb-community

# Stop MongoDB
brew services stop mongodb/brew/mongodb-community
```

---

## 📱 **Testing Mobile Responsiveness:**

1. Open **Developer Tools** (F12)
2. Click **Device Toolbar** icon
3. Select device: **iPhone 12**, **iPad**, etc.
4. Test both **portrait** and **landscape** modes

---

## 🔐 **Admin Access:**

### Default Admin Credentials:
- **Email**: Create an admin account via registration
- **Password**: Set during registration
- **Panel**: http://localhost:3000/admin

### Admin Functions:
- ✅ Add/Edit Products with images
- ✅ Manage inventory and pricing
- ✅ View customer orders
- ✅ Analytics dashboard
- ✅ User management

---

## 🌟 **Recent Fixes Applied:**

### ✅ Product Image Issues:
- Fixed server errors when adding products
- Resolved image display problems
- Improved image upload handling

### ✅ Mobile Responsiveness:
- Optimized homepage for mobile devices
- Fixed image scaling on phones
- Improved touch navigation

### ✅ Server Stability:
- Created reliable startup scripts
- Background process management
- Automatic health checks

---

## 🎯 **Next Steps:**

### For Development:
1. **Add Products**: Use admin panel to add jewelry items
2. **Test Features**: Try cart, checkout, user registration
3. **Customize Design**: Modify colors, fonts, layouts
4. **Add Content**: Update text, images, descriptions

### For Production Deployment:
1. **Environment Variables**: Set production URLs
2. **Cloud Database**: MongoDB Atlas setup
3. **Image Storage**: Cloudinary or AWS S3
4. **Hosting**: Vercel, Netlify, or custom server

---

## 🆘 **Troubleshooting:**

### If Services Won't Start:
```bash
# Kill any stuck processes
./stop.sh

# Check ports
lsof -i :3000
lsof -i :3001

# Restart everything
./start.sh
```

### If Database Issues:
```bash
# Check MongoDB
brew services list | grep mongodb

# Restart MongoDB
brew services restart mongodb/brew/mongodb-community
```

---

## 📞 **Support Commands:**

```bash
# Full system status
./status.sh

# View all running processes
ps aux | grep node

# Check disk space
df -h

# View network connections
netstat -an | grep :300
```

---

**🎉 Your Ukriti Jewells website is ready to use!**

Access it at: **http://localhost:3000**

Happy coding! ✨
