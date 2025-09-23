import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Config Next.js Image component
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },

      {
        protocol: "https",
        hostname: "sr12121.newzenler.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "image",
        pathname: "/example/**",
      },
    ],

    domains: [],
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  webpack: (config, { isServer }) => {
    // Handle Node.js polyfills for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        async_hooks: false,
      };
    }

    // Ignore specific Node.js modules on client side
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        "@langchain/langgraph": "commonjs @langchain/langgraph",
        "@langchain/core": "commonjs @langchain/core",
        "@langchain/openai": "commonjs @langchain/openai",
        "@langchain/community": "commonjs @langchain/community",
        "@langchain/textsplitters": "commonjs @langchain/textsplitters",
      });
    }

    return config;
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
