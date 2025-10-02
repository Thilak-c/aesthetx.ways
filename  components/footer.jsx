import React from "react";
import Galaxy from "./Galaxy/Galaxy";
import Image from "next/image";
import { FaInstagram, FaYoutube, FaFacebook, FaTwitter } from "react-icons/fa";

export default function Footer() {
    return (
      <>
      <div className="h-[700px] md:h-[700px] w-full absolute z-40 bg-gradient-to-b from-white to-transparent"></div>
<div className="absolute z-50 h-[600px] w-full text-3xl"> 



<footer className="bg-transparent  text-black border-t border-gray-200" style={{ height: "700px" }}>
      <div className="max-w-7xl mx-auto h-full flex flex-col justify-between px-6 py-12">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          
          {/* Logo + About */}
          <div>
            <img
              src="/logo.png"
              alt="My Logo"
              width={200}
              height={55}
              className="mb-3 "
            />
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              Helping you grow your social presence with style, reach, and authenticity.
            </p>
          </div>

          {/* Quick Links */}
<div>
  <h3 className="font-bold text-base mb-3">Quick Links</h3>
  <ul className="grid grid-cols-2 gap-y-1 text-gray-600 text-sm">
    <li><a href="/" className="hover:text-black transition">Home</a></li>
    <li><a href="/about" className="hover:text-black transition">About</a></li>
    <li><a href="/services" className="hover:text-black transition">Services</a></li>
    <li><a href="/contact" className="hover:text-black transition">Contact</a></li>
    <li><a href="/trackorder" className="hover:text-black transition">Track Order</a></li>
    <li><a href="/profile" className="hover:text-black transition">Profile</a></li>
  </ul>
</div>


          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-base mb-3">Follow Us</h3>
            <div className="flex space-x-4 text-xl text-gray-600">
              <a href="https://www.instagram.com/aesthetx.ways_/" target="_blank" className="hover:text-pink-500 transition"><FaInstagram /></a>
              <a href="/comingsoon" target="_blank" className="hover:text-red-500 transition"><FaYoutube /></a>
              <a href="/comingsoon" target="_blank" className="hover:text-blue-500 transition"><FaFacebook /></a>
              <a href="/comingsoon" target="_blank" className="hover:text-sky-400 transition"><FaTwitter /></a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-base mb-3">Subscribe</h3>
            <p className="text-xs text-gray-600 mb-3">Get the latest updates and offers.</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-3 py-1.5 rounded-l-lg border border-gray-300 text-sm focus:outline-none"
              />
              <button className="bg-black px-4 py-1.5 rounded-r-lg text-white text-sm hover:bg-gray-800 transition">
                Go
              </button>
            </form>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t md:mb-0 mb-[100px] border-gray-200 mt-8 pt-5 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} AesthetX WAYS — All Rights Reserved.
        </div>
      </div>

    </footer>

</div>

    <div style={{ width: '100%', height: '700px', position: 'relative' }}>
  <Galaxy />
</div>
      </>
    );
  }
  