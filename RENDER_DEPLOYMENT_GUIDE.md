# Render Deployment Guide

## Prerequisites
- GitHub repository with your code
- Render account (free tier available)
- MongoDB Atlas credentials configured

## Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Create Render Services

#### Option A: Using Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "Blueprints" in the sidebar
3. Click "New Blueprint Instance"
4. Connect your GitHub repository
5. Select the repository containing your code
6. Render will automatically detect the `render.yaml` file
7. Click "Apply" to create both services

#### Option B: Manual Setup
If blueprint doesn't work, create services manually:

**Backend Service:**
1. Click "New" → "Web Service"
2. Connect GitHub repository
3. Configure:
   - Name: `thealankriti-backend`
   - Runtime: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Plan: Free

**Frontend Service:**
1. Click "New" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - Name: `thealankriti-frontend`
   - Build Command: `cd frontend && npm install && REACT_APP_API_URL=https://thealankriti-backend.onrender.com/api npm run build`
   - Publish Directory: `frontend/build`

### 3. Environment Variables (if using manual setup)
Add these to your backend service:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://thealankriti_db_user:ZwHIC6cxgHdKzy50@thealankriti.b27onwb.mongodb.net/?retryWrites=true&w=majority&appName=thealankriti
JWT_SECRET=The-Alankriti-jewells-super-secret-key-2024-production
JWT_EXPIRE=7d
ADMIN_EMAIL=bewithu.aj@gmail.com
ADMIN_PASSWORD=admin123
SESSION_SECRET=The-Alankriti-jewells-session-secret-key-2024-production
CLIENT_URL=https://thealankriti-frontend.onrender.com
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=5242880
```

### 4. Update Service URLs
Once services are deployed, update the URLs in your `render.yaml` if they differ:
- Backend URL: `https://thealankriti-backend.onrender.com`
- Frontend URL: `https://thealankriti-frontend.onrender.com`

### 5. Test Deployment
1. Wait for both services to build and deploy (usually 5-10 minutes)
2. Visit your frontend URL
3. Test admin login with: `bewithu.aj@gmail.com` / `admin123`
4. Verify API connectivity

## Troubleshooting

### Common Issues:

**Build Failures:**
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

**API Connection Issues:**
- Verify REACT_APP_API_URL points to correct backend URL
- Check CORS settings in backend
- Ensure CLIENT_URL in backend matches frontend URL

**Database Connection:**
- Verify MongoDB Atlas whitelist includes 0.0.0.0/0 for Render IPs
- Check connection string format
- Test connection locally first

**File Upload Issues:**
- Render free tier has limited disk storage
- Consider using cloud storage (AWS S3, Cloudinary) for uploads
- Update upload path configuration

### Health Check
Backend includes health endpoint at `/health` for monitoring.

## Post-Deployment
1. Test all functionality
2. Set up custom domain (optional)
3. Configure monitoring and alerts
4. Update DNS records if needed

## Notes
- Free tier services sleep after 15 minutes of inactivity
- Paid plans available for always-on services
- Automatic deployments trigger on GitHub pushes
- Environment variables are encrypted at rest
