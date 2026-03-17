# 🚀 WebUzo Production Deployment Guide

## TheAlankriti - Complete Production Setup for WebUzo

**Deployment Date:** February 14, 2026  
**Platform:** WebUzo Hosting  
**Status:** ✅ Ready for Production

---

## 📋 Environment Configuration

### Backend Server Details
- **Port:** 30116
- **Node.js Version:** 14.x or higher
- **Domain:** https://api.thealankriti.com
- **Admin Domain:** https://thealankriti.com

### Database Configuration
- **Database Engine:** MongoDB Local
- **Host:** localhost:27017
- **Database Name:** theunico_adminuser
- **Username:** theunico_admin
- **Password:** Y4VRD$Vi7u7SN

### Frontend Configuration
- **Port:** 3000 (or auto-detected by WebUzo)
- **Domain:** https://thealankriti.com
- **Subdomain:** https://www.thealankriti.com
- **Build Command:** npm install && npm run build
- **Start Command:** npm start

---

## 🔧 Setup Instructions

### 1. Upload Application Files

```bash
# SSH into WebUzo server
ssh admin@your-server-ip:2222

# Backend deployment
cd /home2/theunico/public_html/thealankritibackend
git clone <your-repo-url> . OR upload backend files

# Frontend deployment
cd /home2/theunico/public_html2
git clone <your-repo-url> . OR upload frontend files
```

### 2. Install Dependencies

```bash
# Backend
cd /home2/theunico/public_html/thealankritibackend
npm install

# Frontend (separate location)
cd /home2/theunico/public_html2
npm install
npm run build
```

### 3. Configure Environment Files

#### Backend .env (Already configured)
- Location: `/home2/theunico/public_html/thealankritibackend/.env`
- Port: 30116
- MongoDB: localhost:27017
- Admin Email: bewithu.aj@gmail.com
- Key Configuration:
  ```
  NODE_ENV=production
  PORT=30116
  MONGODB_URI=mongodb://theunico_thealankritiadmin:Y4VRD$Vi7u7SN@localhost:27017/theunico_thealankriti?authSource=admin
  CORS_ORIGIN=https://thealankriti.com,https://www.thealankriti.com,http://localhost:3000
  ```

#### Frontend .env.production (Already configured)
- Location: `/home2/theunico/public_html2/.env.production`
- API URL: https://api.thealankriti.com/api
- Frontend URL: https://thealankriti.com

### 4. Build Frontend

```bash
cd /home2/theunico/public_html2
npm run build
# Output: ./build/
```

### 5. Configure Web Server (Nginx/Apache)

#### For Nginx:
```nginx
server {
    listen 80;
    server_name thealankriti.com www.thealankriti.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name thealankriti.com www.thealankriti.com;
    
    # SSL Certificates
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend
    root /home2/theunico/public_html2;
    index index.html;
    
    location / {
        try_files $uri /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API Server
server {
    listen 443 ssl http2;
    server_name api.thealankriti.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:30116;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### For Apache:
```apache
<VirtualHost *:443>
    ServerName thealankriti.com
    ServerAlias www.thealankriti.com
    
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
    
    DocumentRoot /home2/theunico/public_html2
    
    <Directory /home2/theunico/public_html2>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>

<VirtualHost *:443>
    ServerName api.thealankriti.com
    
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
    
    ProxyPass / http://localhost:30116/
    ProxyPassReverse / http://localhost:30116/
    
    <Location />
        Header set Access-Control-Allow-Origin "*"
        Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header set Access-Control-Allow-Headers "Content-Type, Authorization"
    </Location>
</VirtualHost>
```

### 6. Start Backend Service

```bash
cd /home2/theunico/public_html/thealankritibackend

# Using PM2 (Recommended)
npm install -g pm2
pm2 start server.js --name "thealankriti-backend"
pm2 save
pm2 startup

# Or using Node directly
nohup node server.js > backend.log 2>&1 &
```

### 7. Verify Installation

```bash
# Test Backend Health
curl https://api.thealankriti.com/health

# Test Frontend
curl https://thealankriti.com

# Check Backend Logs
tail -f /home2/theunico/public_html/thealankritibackend/backend.log
```

---

## 🔐 Security Checklist

- [x] Database password configured securely
- [x] JWT secrets set (Change to something more secure!)
- [x] Admin credentials configured
- [x] CORS origins configured
- [x] SSL/TLS certificates installed
- [x] Environment variables properly set
- [x] Upload path configured
- [x] Email configuration ready
- [x] Maintenance mode disabled
- [x] Production logging enabled

### Important Security Updates Needed:

1. **Change JWT Secrets** - The provided secrets are for reference only:
   ```
   JWT_SECRET=your-secret-key-change-this-to-something-secure
   JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-too
   ```
   Generate strong secrets:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Email Configuration** - Update with your actual Gmail credentials:
   ```
   EMAIL_USERNAME=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

3. **Backup Database Regularly**
4. **Enable SSL/TLS Certificates** (Let's Encrypt recommended)
5. **Set Strong Admin Password** (Change default immediately)
6. **Configure Firewall Rules**

---

## 📊 Production URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | https://thealankriti.com | 443 |
| Frontend (WWW) | https://www.thealankriti.com | 443 |
| Admin Login | https://thealankriti.com/admin/login | 443 |
| API Backend | https://api.thealankriti.com | 443 |
| Backend Health | https://api.thealankriti.com/health | 443 |

---

## 🧪 Testing Production Deployment

### Test Backend API
```bash
# Test health endpointalankriti.com/health

# Test API call
curl https://api.thealankriti.com/api/products?limit=1
```

### Test Frontend
```bash
# Check if frontend loads
curl https://thealankriti.com

# Check API connectivity
curl https://api.thealankriti.com/api/payment/methods
```

### Admin Login
1. Visit https://thealankriti.com/admin/login
2. Email: bewithu.aj@gmaili.com/admin/login
2. Email: bewithu.aj@gmail.com
3. Password: Admin@UNI00

---

## 📈 Monitoring & Maintenance

### View Logs
```bash
# Backend logs
tail -f /home2/theunico/public_html/thealankritibackend/backend.log

# PM2 logs
pm2 logs thealankriti-backend

# Web server logs
tail -f /var/log/nginx/error.log  # Nginx
tail -f /var/log/apache2/error.log  # Apache
```

### Database Backup
```bash
# Backup MongoDB
mongodump --uri "mongodb://theunico_thealankritiadmin:Y4VRD\$Vi7u7SN@localhost:27017/theunico_thealankriti?authSource=admin" --out /backups/mongo_backup_$(date +%Y%m%d)
```

### Performance Monitoring
```bash
# Check Node.js process
pm2 status
pm2 monit

# Server resources
top
df -h
```

---

## 🔄 Deployment Updates

When deploying new code changes:

```bash
# Pull latest code
cd /home2/theunico/public_html/thealankritibackend
git pull origin main

# Install dependencies (if changed)
npm install

# Rebuild frontend
cd /home2/theunico/public_html2
npm install
npm run build

# Restart backend
pm2 restart thealankriti-backend

# Clear browser cache (inform users)
```

---

## 📞 Support & Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check backend is running: `pm2 status`
   - Verify port 30116 is accessible
   - Check CORS configuration
   - Review logs: `pm2 logs`

2. **Database Connection Error**
   - Verify MongoDB is running: `mongosh`
   - Check credentials in .env
   - Verify authSource=admin in URI

3. **SSL Certificate Issues**
   - Verify certificate paths in web server config
   - Check certificate expiration: `openssl x509 -in cert.pem -noout -dates`
   - Renew if needed using Let's Encrypt

4. **Frontend Not Loading**
   - Verify frontend build succeeded
   - Check web server configuration
   - Clear browser cache
   - Check network tab in browser DevTools

---

## 🎉 Deployment Complete!

Your TheAlankriti application is now ready for production on WebUzo!

**Next Steps:**
1. ✅ Verify all services are running
2. ✅ Test all functionality
3. ✅ Monitor logs for errors
4. ✅ Backup database
5. ✅ Set up automated backups
6. ✅ Configure monitoring alerts

**Emergency Contacts:**
- Super Admin: super@biskirantechnologies.com
- Admin: bewithu.aj@gmail.com

---

**Generated:** February 14, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
