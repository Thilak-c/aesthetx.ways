import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexProvider, convex } from "../convexClient"; // Revert to named import
import LayoutWrapper from "../components/LayoutWrapper";
import { Suspense } from "react"; // Import Suspense

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AesthetX",
  description: "Your ultimate fashion and lifestyle companion.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConvexProvider client={convex}>
          <Suspense fallback={<div>Loading page...</div>}> {/* Add Suspense boundary */}
            <LayoutWrapper>{children}</LayoutWrapper>
          </Suspense>
        </ConvexProvider>
      </body>
    </html>
  );
}
