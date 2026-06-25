import bundleAnalyzer from '@next/bundle-analyzer';

/**
 * Security Headers — A+ rating için
 * @see https://securityheaders.com/
 */
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Güvenlik: X-Powered-By header'ı gizle
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  // Gzip/Brotli sıkıştırma — response boyutunu ~70% küçültür
  compress: true,

  images: {
    // Cloudinary ve remote görseller için default Next.js loader
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  outputFileTracingIncludes: {
    '/api/admin/extensions': ['./src/plugins/**/*', './src/themes/**/*'],
  },

  experimental: {
    // Tree-shaking: yalnızca kullanılan ikonlar/animasyonlar bundle'a girer
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Turbopack kuralı: SQL, MD ve bilinmeyen dosya türlerini yoksay
  // (webpack'teki asset/resource rule'un Turbopack karşılığı)
  turbopack: {
    rules: {
      '*.sql': {
        loaders: ['ignore-loader'],
        as: '*.js',
      },
      '*.md': {
        loaders: ['ignore-loader'],
        as: '*.js',
      },
    },
  },

  // Webpack fallback config to prevent fs/path errors in client-side bundles
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        child_process: false,
        net: false,
        tls: false,
      };
    }
    
    // Exclude test files, SQL, example, and md files from webpack processing
    config.module.rules.push({
      test: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
      type: 'asset/resource',
      generator: {
        emit: false,
      },
    });
    
    config.module.rules.push({
      test: /\.(sql|example|md)$/,
      type: 'asset/resource',
      generator: {
        emit: false,
      },
    });
    
    return config;
  },

  /**
   * REDIRECT MOTORU — Google SEO Koruma Katmanı
   */
  async redirects() {
    return [
      { source: "/hizmetler/:service/izmir-bornova", destination: "/hizmetler/:service/genel/izmir/bornova", permanent: true },
      { source: "/hizmetler/:service/:sector/izmir-bornova", destination: "/hizmetler/:service/:sector/izmir/bornova", permanent: true },
    ];
  },
};

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

export default withBundleAnalyzer(nextConfig);
