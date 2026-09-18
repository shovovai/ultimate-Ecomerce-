import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { brand } from "@/config/brand";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import SiteAnalytics from "@/components/SiteAnalytics";
import { defaultOgImage, getSiteSettings, siteIcon, toPublicSettings } from "@/lib/siteSeo";
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

// All SEO values come from Admin → SEO & Branding (with sensible defaults)
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const ogImage = defaultOgImage(s);
  const icon = siteIcon(s);
  const keywords = s.seoKeywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    metadataBase: new URL(brand.url),
    applicationName: s.storeName,
    title: { template: s.seoTitleTemplate || `%s | ${s.storeName}`, default: s.seoTitle },
    description: s.seoDescription,
    keywords,
    authors: [{ name: s.storeName }],
    creator: s.storeName,
    publisher: s.storeName,
    formatDetection: { email: false, address: false, telephone: false },
    icons: { icon, shortcut: icon, apple: icon },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: brand.url,
      siteName: s.storeName,
      title: s.seoTitle,
      description: s.seoDescription,
      images: [{ url: ogImage, width: 1200, height: 630, alt: s.storeName }],
    },
    twitter: {
      card: "summary_large_image",
      title: s.seoTitle,
      description: s.seoDescription,
      images: [ogImage],
      ...(s.twitterHandle && { site: s.twitterHandle, creator: s.twitterHandle }),
    },
    robots: s.noindex
      ? { index: false, follow: false }
      : {
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
    verification: {
      ...(s.googleVerification && { google: s.googleVerification }),
      other: {
        ...(s.bingVerification && { "msvalidate.01": s.bingVerification }),
        ...(s.facebookDomainVerification && {
          "facebook-domain-verification": s.facebookDomainVerification,
        }),
      },
    },
    appleWebApp: { capable: true, title: s.storeName, statusBarStyle: "default" },
    alternates: { canonical: "/" },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const s = await getSiteSettings();
  return {
    themeColor: s.themeColor || "#c2542d",
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  };
}

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const settings = await getSiteSettings();
  return (
    <ClerkProvider>
      <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`}>
        <body className="font-sans antialiased">
          <SiteSettingsProvider value={toPublicSettings(settings)}>
            <UserDataProvider>{children}</UserDataProvider>
          </SiteSettingsProvider>
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "#ffffff",
                color: "#1f2937",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                fontSize: "14px",
              },
              className: "sonner-toast",
            }}
          />
          <SiteAnalytics settings={settings} />
        </body>
      </html>
    </ClerkProvider>
  );
};

export default RootLayout;
