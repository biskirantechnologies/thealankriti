# The Alankriti - Deployment Guide

## 🚀 Local Development

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Backend Setup
```bash
cd backend
npm install
npm start
```
Server runs on: `http://localhost:3001`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs on: `http://localhost:3000`

## 🌐 Production Deployment

### 1. Build for Production
```bash
cd frontend
npm run build
```

### 2. Hosting Options

#### Option A: Netlify (Recommended for Frontend)
1. Build the project: `npm run build`
2. Upload the `build` folder to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `build`

#### Option B: Vercel
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `build`

#### Option C: GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json:
   ```json
   "homepage": "https://yourusername.github.io/The Alankriti-jewells",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```
3. Deploy: `npm run deploy`

### Backend Deployment

#### Option A: Railway
1. Connect your GitHub repository
2. Set start command: `npm start`
3. Add environment variables

#### Option B: Render
1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`

#### Option C: Heroku
1. Install Heroku CLI
2. Create app: `heroku create your-app-name`
3. Push: `git push heroku main`

## 🔧 Environment Variables

### Backend (.env)
```
PORT=3001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

### Frontend (.env)
```
REACT_APP_API_URL=your_backend_url
```

## 📦 Quick Deploy Commands

### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
cd frontend
npm run build
netlify deploy --prod --dir=build
```

### Deploy Backend to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] MongoDB connection string updated
- [ ] API URL updated in frontend
- [ ] Build completed successfully
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and connected to backend
- [ ] Domain configured (optional)
- [ ] SSL certificate active

## 🌟 Your Beautiful Minimalist Design is Ready!

The website features:
- Clean, modern minimalist design
- Responsive layout for all devices
- Optimized performance
- Professional typography
- Smooth animations
- Easy navigation

Happy hosting! 🚀
