import Image from "next/image";

const categories = [
  { name: "CROP TEES", img: "/categories/crop-tees.jpg" },
  { name: "OVERSIZED TEES", img: "/categories/oversized-tees.jpg" },
  { name: "BAGGY JEANS", img: "/categories/baggy-jeans.jpg" },
  { name: "BAGGY LOWERS", img: "/categories/BAGGY LOWERS.webp" },
  { name: "HOODIE", img: "/categories/hoodie.webp" },
  { name: "FULL SLEEVES", img: "/categories/FULL SLEEVES.webp" },
  { name: "TRACK PANTS", img: "/categories/TRACK PANTS.webp" },
];

export default function CategoriesGrid() {
  return (
    <section className="w-full flex flex-col items-center py-10 bg-white">
      
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide text-gray-800">
          CATEGORIES
        </h2>
        <span className="block w-28 sm:w-36 h-[2px] mx-auto mt-1 opacity-50 rounded-full bg-gradient-to-r from-white via-black to-white"></span>
      </div>
      
      {/* Mobile: Full width stacked */}
      <div className="flex md:hidden flex-col gap-6 w-full px-">
        {categories.map((cat) => (
          <div key={cat.name} className="relative justify-center flex overflow-hidden shadow bg-white group transition hover:shadow-lg cursor-pointer w-full">
            <Image
              src={cat.img}
              alt={cat.name}
              width={400}
              height={400}
              className="object-cover w-full h-48 transition group-hover:scale-105"
            />
            <span className="absolute top-[90px] left-0 bg-white px-4 py-1 text-[10px] font-extrabold tracking-widest text-gray-800 shadow-sm border border-gray-200">
              {cat.name}
            </span>
          </div>
        ))}
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden md:grid grid-cols-4 gap-6 w-full max-w-6xl px-2 md:px-0">
        {categories.map((cat) => (
          <div key={cat.name} className="relative rounded-2xl justify-center flex overflow-hidden shadow bg-white group transition hover:shadow-lg cursor-pointer">
            <Image
              src={cat.img}
              alt={cat.name}
              width={400}
              height={400}
              className="object-cover w-full h-48 md:h-56 lg:h-64 transition group-hover:scale-105"
            />
            <span className="absolute top-[90px] left-0 bg-white px-4 py-1 text-[10px] font-extrabold tracking-widest text-gray-800 shadow-sm border border-gray-200">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}