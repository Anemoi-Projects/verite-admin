/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    apiURL: "http://localhost:8080",
    // apiURL: "https://verite-be.vercel.app",
    APP_ENV: "production",
  },
};

export default nextConfig;
