import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {NextConfig} */
const nextConfig: NextConfig = {
  // ⛔ Turbopack explicitly disable / silence
  turbopack: {},

  // optional but safe
  reactStrictMode: true,
};

export default withPWA(nextConfig);
