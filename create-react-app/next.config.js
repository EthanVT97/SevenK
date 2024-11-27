/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    output: 'standalone',
    experimental: {
        appDir: true
    },
    env: {
        API_URL: process.env.API_URL || 'http://localhost:3000/api',
        WS_URL: process.env.WS_URL || 'ws://localhost:3000'
    }
}

module.exports = nextConfig 