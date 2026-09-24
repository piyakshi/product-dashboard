/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // unoptimized: Next normally fetches external images server-side to
    // resize/optimize them. Some hosts (Google's gstatic thumbnails,
    // for example) block that kind of server-side hotlinking. Since
    // this app accepts arbitrary user-pasted URLs, we skip optimization
    // and just render a plain <img> in the browser instead — less
    // efficient, but far more resilient to odd/blocked image hosts.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
