"use client";

import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <head>
        <title>Bogura Iftar Tracker</title>
        <meta name="description" content="বগুড়ার সকল ইফতারের তথ্য এক ম্যাপে। আপনার কাছের ইফতার পয়েন্ট খুঁজে নিন এবং শেয়ার করুন।" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        
        {/* PWA Specific Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bogura Iftar" />
        
        {/* Icons for iOS and others */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}