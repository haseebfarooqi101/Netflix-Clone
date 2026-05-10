/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['image.tmdb.org'],
    formats: ['image/webp'],
  },
  env: {
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    TMDB_BASE_URL: process.env.TMDB_BASE_URL,
    MOVIES_DIR: process.env.MOVIES_DIR,
  },
};

module.exports = nextConfig;
