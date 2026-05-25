import { Geist, Geist_Mono } from "next/font/google";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import LayoutWrapper from "../components/LayoutWrapper";
import { Suspense } from "react";
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
  metadataBase: new URL('https://aesthetxways.com'),
  title: {
    default: "AesthetX Ways - Premium Fashion & Lifestyle Store",
    template: "%s | AesthetX Ways"
  },
  description: "Discover premium fashion, sneakers, and lifestyle products. Shop the latest trends in men's and women's fashion with fast shipping and easy returns.",
  keywords: ["fashion", "sneakers", "lifestyle", "men's fashion", "women's fashion", "online shopping", "premium clothing", "streetwear"],
  authors: [{ name: "AesthetX Ways" }],
  creator: "AesthetX Ways",
  publisher: "AesthetX Ways",
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
        <ClientLayout>
          <Suspense fallback={<div>Loading...</div>}>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </Suspense>
        </ClientLayout>
      </body>
    </html>
  );
}
