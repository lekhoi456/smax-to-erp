# 📚 Hướng dẫn Deploy SMAX-to-ERP với PM2

## 📋 Yêu cầu Server
- Node.js >= 16.x
- NPM hoặc Yarn
- PM2 (sẽ tự cài nếu chưa có)
- Git

## 🚀 Cách 1: Deploy Nhanh (Recommended)

### Bước 1: Clone code từ GitHub
```bash
# Clone repository
git clone https://github.com/lekhoi456/smax-to-erp.git
cd smax-to-erp

# Checkout branch version-2.0
git checkout version-2.0
```

### Bước 2: Cấu hình environment
```bash
# Copy file env mẫu
cp .env.example .env

# Sửa file .env với thông tin của bạn
nano .env
```

### Bước 3: Chạy script tự động
```bash
# Cấp quyền execute cho script
chmod +x start.sh

# Chạy script deploy
./start.sh
```

Script sẽ tự động:
- ✅ Cài đặt dependencies
- ✅ Build frontend
- ✅ Khởi động với PM2
- ✅ Setup auto-restart

## 🛠️ Cách 2: Deploy Thủ Công

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Build production
```bash
npm run build
```

### Bước 3: Cài đặt PM2 (nếu chưa có)
```bash
npm install -g pm2
```

### Bước 4: Start với PM2
```bash
# Start cả frontend và backend
pm2 start ecosystem.config.cjs

# Hoặc start riêng lẻ:
# Frontend (port 4173)
pm2 start npm --name "smax-frontend" -- run preview

# Backend API (port 3000)
pm2 start server/index.js --name "smax-api"
```

### Bước 5: Setup auto-start khi reboot
```bash
# Lưu process list
pm2 save

# Tạo startup script
pm2 startup
# (Copy và chạy lệnh mà PM2 hiển thị)
```

## 📊 Quản lý với PM2

### Xem status
```bash
pm2 status
```

### Xem logs
```bash
# Tất cả logs
pm2 logs

# Logs của frontend
pm2 logs smax-to-erp-frontend

# Logs của API
pm2 logs smax-to-erp-api
```

### Restart/Stop/Delete
```bash
# Restart all
pm2 restart all

# Stop all
pm2 stop all

# Delete all
pm2 delete all

# Restart một app cụ thể
pm2 restart smax-to-erp-frontend
```

### Monitoring
```bash
# Real-time monitoring
pm2 monit

# Web dashboard (optional)
pm2 install pm2-web
pm2 web
```

## 🔧 Cấu hình Nginx (Optional)

Nếu muốn sử dụng Nginx làm reverse proxy:

```nginx
# /etc/nginx/sites-available/smax-to-erp
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/smax-to-erp /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 🔒 SSL với Certbot (Optional)
```bash
# Cài Certbot
apt install certbot python3-certbot-nginx

# Generate SSL
certbot --nginx -d your-domain.com

# Auto-renew
certbot renew --dry-run
```

## 📝 Environment Variables

### Frontend (.env)
```env
VITE_PORT=4173
VITE_API_URL=http://localhost:3000
```

### Backend (.env)
```env
API_PORT=3000
NODE_ENV=production
CORS_ORIGIN=http://localhost:4173
```

## 🐛 Troubleshooting

### Port đã được sử dụng
```bash
# Kiểm tra port
lsof -i :4173
lsof -i :3000

# Kill process
kill -9 <PID>
```

### PM2 không lưu được process
```bash
# Check PM2 directory permissions
ls -la ~/.pm2

# Fix permissions
sudo chown -R $USER:$USER ~/.pm2
```

### Build failed
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 📞 Support

- GitHub Issues: https://github.com/lekhoi456/smax-to-erp/issues
- Documentation: https://github.com/lekhoi456/smax-to-erp/wiki

---
**Version:** 2.0
**Last Updated:** 2024