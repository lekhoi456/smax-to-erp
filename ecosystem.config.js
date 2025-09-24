module.exports = {
  apps: [
    {
      name: 'smax-to-erp',
      script: './server/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3668,
        API_PORT: 3668,
        CORS_ORIGIN: 'https://smax.ferry.vn',
        VITE_API_URL: 'https://smax.ferry.vn/api'
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};