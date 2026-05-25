import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AESTHETX WAYS | Online Store",
  description: "Sleek, minimalistic clothing, footwear, headwear, and eyewear.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-100 flex justify-center items-start text-zinc-950 font-sans">
        {/* Minimal Mobile Container */}
        <div id="mobile-frame" className="w-full max-w-[450px] min-h-screen bg-white flex flex-col relative shadow-xl border-x border-zinc-200">
          {children}
        </div>
      </body>
    </html>
  );
}
