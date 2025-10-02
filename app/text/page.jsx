"use client";
import React, { useState, useEffect,useMemo } from "react";
import Navbar, { NavbarMobile } from "@/components/Navbar";;

export default function MenWomenSneakersPage() {



  return (
    <div>


        <div className="md:block h-[80px] md:h-[100px]"></div>
              <div className="md:hidden">
                <NavbarMobile />
              </div>
              <div className="hidden md:block">
                <Navbar />
              </div>
    </div>
  );
}
