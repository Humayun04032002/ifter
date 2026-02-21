import type { NextConfig } from "next";
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* আপনার অন্য কোনো কনফিগ অপশন থাকলে এখানে দিন */
};

export default withPWA(nextConfig);