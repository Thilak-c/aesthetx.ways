import { Geist, Geist_Mono } from "next/font/google";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { ConvexProvider, convex } from "../convexClient"; // Revert to named import
import LayoutWrapper from "../components/LayoutWrapper";
import { Suspense } from "react"; // Import Suspense
import AccessGate from "@/components/AccessGate";
import Footer from "@/ components/footer";
import { WebsiteStructuredData, OrganizationStructuredData } from "@/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  metadataBase: new URL('https://aesthetxways.com'), // Replace with your actual domain
  title: {
    default: "AesthetX Ways - Premium Fashion & Lifestyle Store",
    template: "%s | AesthetX Ways"
  },
  description: "Discover premium fashion, sneakers, and lifestyle products. Shop the latest trends in men's and women's fashion with fast shipping and easy returns.",
  keywords: ["fashion", "sneakers", "lifestyle", "men's fashion", "women's fashion", "online shopping", "premium clothing", "streetwear"],
  authors: [{ name: "AesthetX Ways" }],
  creator: "AesthetX Ways",
  publisher: "AesthetX Ways",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aesthetxways.com",
    title: "AesthetX Ways - Premium Fashion & Lifestyle Store",
    description: "Discover premium fashion, sneakers, and lifestyle products. Shop the latest trends with fast shipping.",
    siteName: "AesthetX Ways",
    images: [
      {
        url: "/og-image.jpg", // You'll need to add this image
        width: 1200,
        height: 630,
        alt: "AesthetX Ways Fashion Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AesthetX Ways - Premium Fashion & Lifestyle Store",
    description: "Discover premium fashion, sneakers, and lifestyle products.",
    images: ["/og-image.jpg"],
    creator: "@aesthetxways", // Replace with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <WebsiteStructuredData />
        <OrganizationStructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} antialiased`}
      >
        <ConvexProvider client={convex}>
              {/* <AccessGate> */}
          <Suspense fallback={<div>Loading page...</div>}>
            {" "}
            {/* Add Suspense boundary */}
            <LayoutWrapper>
              {children}
              <Footer/>
            </LayoutWrapper>
          </Suspense>
              {/* </AccessGate> */}
        </ConvexProvider>
      </body>
    </html>
  );
}
