/** @type {import('next').NextConfig} */
const nextConfig = {
  // El bundle de diseño original vive en design-reference/ y no forma parte del build.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
