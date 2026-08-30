import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    return [
      // A2A's Agent Card must be served at this exact well-known URI.
      // The actual route lives at app/api/agent-card — a literal
      // `.well-known` App Router folder breaks Next's typed-routes
      // codegen, so this maps the public path to it instead.
      { source: "/.well-known/agent-card.json", destination: "/api/agent-card" },
    ];
  },
};

export default nextConfig;
