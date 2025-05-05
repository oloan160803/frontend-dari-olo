// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          // Proxy all /api/* requests to your real backend
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*'
        }
      ]
    }
  }
  
  module.exports = nextConfig
  