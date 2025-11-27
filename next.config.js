/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sodkzjewxiwjlogvwnlv.supabase.co'
      },
      {
        protocol: 'https',
        hostname: 'placehold.co'
      }
    ]
  }
}

module.exports = nextConfig
