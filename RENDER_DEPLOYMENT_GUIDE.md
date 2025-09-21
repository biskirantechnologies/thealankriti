# 🚀 Render Deployment Guide

## Deploy TheAlankriti to Render Platform

This guide will help you deploy your full-stack TheAlankriti application to Render.

---

## 📋 Prerequisites

- [Render Account](https://render.com) (Free tier available)
- [GitHub Account](https://github.com) 
- MongoDB Atlas database (already configured)
- Your project pushed to GitHub

---

## 🏗️ Project Structure

Your application is configured as:
- **Backend**: Node.js/Express API (Port 10000)
- **Frontend**: React Static Site
- **Database**: MongoDB Atlas (Cloud)
- **File Storage**: Render Persistent Disk for uploads

---

## 📦 Step 1: Push to GitHub

1. **Initialize Git** (if not done):
```bash
cd "c:\Users\bewit\Downloads\TheAlankriti\thealankriti"
git init
```

2. **Add all files**:
```bash
git add .
git commit -m "Initial commit - Ready for Render deployment"
```

3. **Create GitHub repository**:
   - Go to [GitHub](https://github.com/new)
   - Create repository named: `thealankriti`
   - **Don't** initialize with README (we have files already)

4. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/thealankriti.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. **Go to Render Dashboard**:
   - Visit [render.com/dashboard](https://dashboard.render.com/)
   - Click "New +"

2. **Blueprint Deployment**:
   - Select "Blueprint"
   - Connect your GitHub repository
   - Choose the `thealankriti` repository
   - Render will detect the `render.yaml` file automatically

3. **Service Configuration**:
   - **Backend Service**: `thealankriti-backend`
   - **Frontend Service**: `thealankriti-frontend`
   - Both services will be created automatically

### Option B: Manual Deployment

If you prefer manual setup:

#### Backend Service
1. **New Web Service**:
   - Runtime: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Auto Deploy: `Yes`

#### Frontend Service  
1. **New Static Site**:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`
   - Auto Deploy: `Yes`

---

## 🔐 Step 3: Environment Variables

### Backend Environment Variables
Set these in your backend service settings:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Server port |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB connection |
| `JWT_SECRET` | `your-jwt-secret` | JWT signing key |
| `ADMIN_EMAIL` | `bewithu.aj@gmail.com` | Admin login email |
| `ADMIN_PASSWORD` | `admin123` | Admin login password |
| `JWT_EXPIRE` | `7d` | Token expiration |
| `FRONTEND_URL` | `https://your-frontend-url.onrender.com` | Frontend URL |

### Frontend Environment Variables
Set these in your frontend service settings:

| Variable | Value | Description |
|----------|-------|-------------|
| `REACT_APP_API_URL` | `https://your-backend-url.onrender.com` | Backend API URL |

---

## 💾 Step 4: Persistent Storage

1. **Add Disk to Backend**:
   - Go to backend service settings
   - Add "Disk": 
     - Name: `uploads`
     - Mount Path: `/opt/render/project/src/backend/uploads`
     - Size: `1GB` (Free tier limit)

---

## 🌐 Step 5: Custom Domain (Optional)

1. **Frontend Custom Domain**:
   - Go to frontend service settings
   - Add custom domain: `www.thealankriti.com`
   - Configure DNS CNAME record

2. **Backend Custom Domain**:
   - Go to backend service settings  
   - Add custom domain: `api.thealankriti.com`
   - Configure DNS CNAME record

---

## 🔍 Step 6: Verify Deployment

1. **Check Backend Health**:
```bash
curl https://your-backend-url.onrender.com/health
# Should return: {"status":"OK","timestamp":"..."}
```

2. **Test Admin Login**:
   - Visit: `https://your-frontend-url.onrender.com/admin/login`
   - Email: `bewithu.aj@gmail.com`
   - Password: `admin123`

3. **Test Product Upload**:
   - Login to admin panel
   - Try uploading a product with image
   - Verify image displays correctly

---

## 🚨 Troubleshooting

### Common Issues:

#### 1. Build Failures
```bash
# Check build logs in Render dashboard
# Common fixes:
- Ensure all dependencies in package.json
- Check Node version compatibility
- Verify build commands are correct
```

#### 2. Database Connection Issues
```bash
# Verify MongoDB Atlas:
- Whitelist 0.0.0.0/0 for Render IPs
- Check connection string format
- Ensure database user has proper permissions
```

#### 3. Image Upload Issues
```bash
# Check persistent disk:
- Verify disk is mounted at correct path
- Check upload directory permissions
- Ensure multer configuration is correct
```

#### 4. CORS Errors
```bash
# Update backend CORS settings:
- Add frontend URL to allowed origins
- Check environment variables are set
```

---

## 📊 Step 7: Monitoring & Scaling

### Free Tier Limits:
- **Build Minutes**: 500/month
- **Bandwidth**: 100GB/month
- **Services**: Up to 3 free services
- **Disk Storage**: 1GB per service

### Monitoring:
1. **Service Logs**: Real-time logs in dashboard
2. **Metrics**: CPU, Memory, Response time
3. **Alerts**: Set up email notifications
4. **Health Checks**: Automatic service monitoring

---

## 🔄 Step 8: Auto-Deploy Setup

1. **GitHub Integration**:
   - Auto-deploy on `main` branch push
   - Deploy previews for Pull Requests (Paid)
   - Webhook integration included

2. **Deploy Hooks**:
   - Manual deploy via API
   - Scheduled deployments (Paid)

---

## 💡 Tips for Production

1. **Security**:
   - Use strong JWT secrets
   - Enable helmet.js (already configured)
   - Set up proper CORS origins

2. **Performance**:
   - Enable compression (already configured)
   - Use CDN for static assets (Paid)
   - Implement caching strategies

3. **Backup**:
   - Regular MongoDB Atlas backups
   - Export user data periodically
   - Version control for code

---

## 📞 Support

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Community**: [community.render.com](https://community.render.com)
- **Status**: [status.render.com](https://status.render.com)

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] `render.yaml` configuration verified
- [ ] Environment variables configured
- [ ] Persistent disk added for uploads
- [ ] Backend health check passes
- [ ] Frontend loads correctly
- [ ] Admin login works
- [ ] Product upload/display works
- [ ] Database connection verified
- [ ] Custom domain configured (optional)

---

🎉 **Congratulations!** Your TheAlankriti application is now live on Render!

Frontend URL: `https://thealankriti-frontend.onrender.com`
Backend URL: `https://thealankriti-backend.onrender.com`
Admin Panel: `https://thealankriti-frontend.onrender.com/admin/login`