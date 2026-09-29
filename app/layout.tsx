'use client';

import type { Metadata } from "next";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <title>DocGenius - Professional Postman to API Documentation Generator</title>
        <meta name="description" content="Convert Postman Collection JSON into beautiful API documentation with PDF, HTML, and Markdown export." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;600&family=Roboto:wght@400;500;700&family=Merriweather:wght@300;400;700&display=swap" />
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/google-sans" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
