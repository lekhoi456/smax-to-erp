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

# Stop các process cũ nếu có
echo "🛑 Stopping old processes..."
pm2 delete smax-to-erp-frontend 2>/dev/null
pm2 delete smax-to-erp-api 2>/dev/null

# Start với PM2
echo "🎯 Starting services with PM2..."
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup startup script
pm2 startup

echo "✅ Deployment complete!"
echo ""
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs"
echo "🔄 Restart: pm2 restart all"
echo "🛑 Stop: pm2 stop all"