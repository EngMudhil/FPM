import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@fpm/ui', '@fpm/types'],
};

export default nextConfig;
