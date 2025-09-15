# Render Deployment Guide for The Alankriti

## Prerequisites
- GitHub repository with your code
- Render account (free tier available)

## Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Add render.yaml for deployment"
git push origin main
```

### 2. Connect Repository to Render
1. Go to [https://render.com](https://render.com)
2. Sign up/Sign in with GitHub
3. Click "New" → "Blueprint"
4. Connect your GitHub repository: `biskirantechnologies/thealankriti`
5. Select the repository and click "Connect"

### 3. Configure Environment Variables (if needed)
The `render.yaml` file includes all necessary environment variables, but you may want to update:

**Backend Environment Variables:**
- `EMAIL_USER`: Your Gmail address for sending emails
- `EMAIL_PASS`: Your Gmail app password
- `JWT_SECRET`: Use a strong, random secret for production
- `SESSION_SECRET`: Use a strong, random secret for production

### 4. Deploy
1. Render will automatically detect the `render.yaml` file
2. Click "Create Blueprint"
3. Both services (backend and frontend) will deploy automatically
4. Wait for deployment to complete (5-10 minutes)

### 5. Access Your Application
After deployment:
- **Frontend**: `https://thealankriti-frontend.onrender.com`
- **Backend API**: `https://thealankriti-backend.onrender.com`
- **Admin Panel**: `https://thealankriti-frontend.onrender.com/admin-login`

## Services Deployed

### Backend Service
- **Name**: `thealankriti-backend`
- **Runtime**: Node.js
- **Port**: 10000 (Render default)
- **Health Check**: `/health`
- **MongoDB**: Connected to your Atlas cluster

### Frontend Service
- **Name**: `thealankriti-frontend`
- **Runtime**: Static site
- **Build**: React production build
- **Routing**: SPA routing enabled

## Important Notes

1. **Free Tier Limitations**:
   - Services sleep after 15 minutes of inactivity
   - First request after sleep takes ~30 seconds to wake up
   - 750 hours/month limit per service

2. **Database**:
   - Using MongoDB Atlas (already configured)
   - Ensure Atlas allows connections from all IPs (0.0.0.0/0) for Render

3. **File Uploads**:
   - Files uploaded to `/uploads` directory
   - On free tier, files are ephemeral and may be lost on restarts
   - Consider using cloud storage (Cloudinary, AWS S3) for production

4. **Environment Variables**:
   - Sensitive data is included in `render.yaml`
   - Consider using Render's environment variable UI for sensitive data
   - Never commit real secrets to GitHub

## Updating Your Deployment

To update your deployed application:
```bash
git add .
git commit -m "Update application"
git push origin main
```

Render will automatically redeploy when you push to the main branch.

## Troubleshooting

### Backend Issues
- Check logs in Render dashboard
- Verify MongoDB connection string
- Ensure all environment variables are set

### Frontend Issues
- Check that `REACT_APP_API_URL` is correctly set during build
- Verify API endpoints are accessible
- Check browser console for CORS errors

### Common Issues
1. **CORS Errors**: Ensure `CLIENT_URL` in backend matches frontend URL
2. **API Not Found**: Verify frontend is calling correct backend URL
3. **Database Connection**: Check MongoDB Atlas network access

## Production Checklist

Before going to production:
- [ ] Update `JWT_SECRET` and `SESSION_SECRET` with strong random values
- [ ] Configure real email credentials (`EMAIL_USER`, `EMAIL_PASS`)
- [ ] Set up proper error monitoring
- [ ] Configure custom domain (if needed)
- [ ] Set up cloud storage for file uploads
- [ ] Review and secure all environment variables
- [ ] Test all functionality on deployed application

## Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test API endpoints directly
4. Check MongoDB Atlas connection and network access
