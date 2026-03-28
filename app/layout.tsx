import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata (SEO + Preview)
export const metadata: Metadata = {
  title: "Cluedo Round 1",
  description: "Crack the mystery. Solve the clues. Enter the game.",

  // Favicon (browser tab icon)
  icons: {
    icon: "/logo.png",
  },

  // Open Graph (WhatsApp, LinkedIn, Discord, etc.)
  openGraph: {
    title: "Cluedo Round 1",
    description: "Crack the mystery. Solve the clues. Enter the game.",
    url: "https://yourdomain.com", // 🔥 change this in production
    siteName: "Cluedo",
    images: [
      {
        url: "/logo.png", // 🔥 should ideally be 1200x630
        width: 1200,
        height: 630,
        alt: "Cluedo Game Logo",
      },
    ],
    type: "website",
  },

  // Twitter preview
  twitter: {
    card: "summary_large_image",
    title: "Cluedo Round 1",
    description: "Crack the mystery. Solve the clues. Enter the game.",
    images: ["/logo.png"],
  },
};

// Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}