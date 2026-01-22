import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Proxy other API requests to Python backend
  // analyze-wallet now uses its own API route with extended timeout
  async rewrites() {
    return [
      {
        source: '/portfolio/:path*',
        destination: 'http://127.0.0.1:8000/portfolio/:path*',
      },
    ]
  },
}

export default nextConfig
