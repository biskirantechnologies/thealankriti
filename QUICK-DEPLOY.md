# 🚀 Quick Hosting Guide for Ukriti Jewells

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click "New repository" (+ icon in top right)
3. Repository name: `ukriti-jewells`
4. Make it Public
5. Click "Create repository"

## Step 2: Upload Your Code

```bash
cd "/Users/aashisjha/Desktop/Ukriti Jewells"
git remote add origin https://github.com/YOUR_USERNAME/ukriti-jewells.git
git push -u origin main
```

## Step 3: Deploy Frontend (Choose ONE)

### Option A: Netlify (Easiest - Recommended) 🌟

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Deploy manually"
3. Drag and drop your `frontend/build` folder
4. Your site is live instantly!

**OR use Netlify CLI:**
```bash
npm install -g netlify-cli
cd frontend
npm run build
netlify deploy --prod --dir=build
```

### Option B: GitHub Pages (Free)

1. After pushing to GitHub, run:
```bash
cd frontend
npm run deploy
```
2. Go to your repository → Settings → Pages
3. Enable Pages with `gh-pages` branch
4. Your site will be at: `https://YOUR_USERNAME.github.io/ukriti-jewells`

### Option C: Vercel (Fast)

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set:
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/build`
4. Deploy!

## Step 4: Deploy Backend (Optional)

### Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy the backend folder
4. Add environment variables

### Render
1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service
4. Set start command: `npm start`

## Quick Deploy Commands

```bash
# Build everything
./deploy.sh

# Deploy to GitHub Pages
cd frontend && npm run deploy

# Deploy to Netlify
cd frontend && npm run build && netlify deploy --prod --dir=build
```

## 🎯 Your Site Will Be Live At:

- **Netlify**: Your custom URL (e.g., `https://amazing-site-123.netlify.app`)
- **GitHub Pages**: `https://YOUR_USERNAME.github.io/ukriti-jewells`
- **Vercel**: Your custom URL (e.g., `https://ukriti-jewells.vercel.app`)

## 🔥 Pro Tips:

1. **Custom Domain**: Add your own domain in hosting platform settings
2. **SSL**: Automatically included with all these platforms
3. **Updates**: Just push to GitHub and redeploy
4. **Analytics**: Add Google Analytics in index.html

Your beautiful minimalist jewelry website is ready to shine online! ✨
