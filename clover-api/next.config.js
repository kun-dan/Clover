/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    // Required in Next 14 for instrumentation.ts to run at all; without it the
    // proxy dispatcher and the hourly chapter update job are silently skipped.
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
