import { Geist, Geist_Mono } from "next/font/google";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { ConvexProvider, convex } from "../convexClient"; // Revert to named import
import LayoutWrapper from "../components/LayoutWrapper";
import { Suspense } from "react"; // Import Suspense
import AccessGate from "@/components/AccessGate";
import Footer from "@/ components/footer";

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
  title: "AesthetX Ways",
  description: "Your ultimate fashion and lifestyle companion.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
              {/* <Footer/> */}
            </LayoutWrapper>
          </Suspense>
              {/* </AccessGate> */}
        </ConvexProvider>
      </body>
    </html>
  );
}
