"use client";

import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <head>
        <title>IftarMap BD | ইফতার ম্যাপ</title>
        <meta name="description" content="আপনার কাছের ইফতার পয়েন্ট খুঁজে নিন এবং শেয়ার করুন।" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}