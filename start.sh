#!/bin/bash

# Script để khởi động app trên production server

echo "🚀 Starting SMAX-to-ERP deployment..."

# Kiểm tra và tạo thư mục logs
if [ ! -d "logs" ]; then
    mkdir logs
    echo "✅ Created logs directory"
fi

# Install dependencies nếu chưa có
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Build frontend cho production
echo "🏗️ Building frontend..."
npm run build

# Kiểm tra PM2
if ! command -v pm2 &> /dev/null; then
    echo "⚠️ PM2 not found. Installing PM2 globally..."
    npm install -g pm2
fi

# Stop process cũ nếu có
echo "🛑 Stopping old processes..."
pm2 delete smax-to-erp-v2 2>/dev/null

# Start với PM2
echo "🎯 Starting app with PM2 on port 3668..."
pm2 start ecosystem.config.cjs

# Save PM2 process list
pm2 save

# Setup startup script
pm2 startup

echo "✅ Deployment complete!"
echo ""
echo "📊 App running on port 3668"
echo "🌐 Access via: https://smax.ferry.vn"
echo ""
echo "📝 PM2 Commands:"
echo "  pm2 status      - Check status"
echo "  pm2 logs        - View logs"
echo "  pm2 restart all - Restart app"
echo "  pm2 stop all    - Stop app"