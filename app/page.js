import Navbar, { NavbarMobile } from "@/ components/Navbar";

export default function Home() {
  return (
    <>
      <div className="md:hidden"><NavbarMobile /></div>
      <div className="hidden md:block"><Navbar /></div>
      {/* ...rest of your page... */}
    </>
  );
}