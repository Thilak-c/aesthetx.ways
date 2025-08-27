"use client"
import Navbar, { NavbarMobile } from "@/components/Navbar";
import Footer from "@/ components/footer";
import { useState } from "react";
import Image from "next/image";
import ProductSlider from "@/components/ProductSlider";
import CategoriesGrid from "@/components/CategoriesGrid";
import NewArrivalsSlider from "@/components/NewArrivalsSlider";
import TopPicksSlider from "@/components/TopPicksSlider";


export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="md:block hidden h-[100px]"></div>
      <div className="md:hidden"><NavbarMobile /></div>
      <div className="hidden md:block"><Navbar /></div>
      <ProductSlider />
      <TopPicksSlider />
      <NewArrivalsSlider />
      <CategoriesGrid />
      {/* ...rest of your page... */}
      <Footer/>
    </>
  );
}
