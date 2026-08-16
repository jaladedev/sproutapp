const R2_HOSTNAME = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_R2_URL || '').hostname;
  } catch {
    return 'pub-614b1fbd5c4f46ca8e95d0ccbde016c9.r2.dev';
  }
})();

const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  transpilePackages: ['leaflet', 'react-leaflet'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: R2_HOSTNAME,
        pathname: '/lands/**',
      },
    ],
  },
};

export default nextConfig;