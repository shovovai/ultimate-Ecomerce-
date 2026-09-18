import { ReactNode } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import Script from "next/script";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { brand } from "@/config/brand";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: {
    template: `%s | ${brand.name}`,
    default: `${brand.name} - ${brand.tagline}`,
  },
  description: brand.description,
  keywords: [
    "online shopping",
    "e-commerce",
    "buy online",
    "shop online",
    "electronics",
    "fashion",
    "home goods",
    "deals",
    "discounts",
    brand.name,
  ],
  authors: [{ name: brand.name }],
  creator: brand.name,
  publisher: brand.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: brand.url,
    siteName: brand.name,
    title: `${brand.name} - ${brand.tagline}`,
    description: brand.description,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${brand.name} Online Store`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} - ${brand.tagline}`,
    description: brand.description,
    images: ["/og-image.jpg"],
    creator: brand.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  }),
  alternates: {
    canonical: brand.url,
  },
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  // Optional: set your own Google AdSense publisher ID in .env to enable ads
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  return (
    <ClerkProvider>
      <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`}>
        <body
          className="font-sans antialiased"
        >
          <UserDataProvider>{children}</UserDataProvider>
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "#ffffff",
                color: "#1f2937",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
              },
              className: "sonner-toast",
            }}
          />

          {adsenseClientId && (
            <Script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
              strategy="afterInteractive"
              crossOrigin="anonymous"
            />
          )}
        </body>
      </html>
    </ClerkProvider>
  );
};

export default RootLayout;
