import Image from "next/image";
import Link from "next/link";

const categories = [
  { name: "OVERSIZED T-SHIRTS", img: "/categories/oversized-tshirt.jpg", slug: "oversized-tshirts" },
  { name: "ALL BOTTOMS", img: "/categories/all-bottoms.jpg", slug: "all-bottoms" },
  { name: "SHIRTS", img: "/categories/shirts.jpg", slug: "shirts" },
  { name: "POLOS", img: "/categories/polos.jpg", slug: "polos" },
  { name: "SNEAKERS", img: "/categories/sneakers.jpg", slug: "sneakers" },
  { name: "BACKPACKS", img: "/categories/backpacks.jpg", slug: "backpacks" },
  { name: "PERFUMES", img: "/categories/perfumes.jpg", slug: "perfumes" },
  { name: "CAPS", img: "/categories/caps.jpg", slug: "caps" },
];

export default function CategoriesGrid() {
  return (
    <section className="w-full flex flex-col items-center py-10">
      
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide text-gray-800">
          CATEGORIES
        </h2>
        <span className="block w-28 sm:w-36 h-[2px] mx-auto mt-1 opacity-50 rounded-full bg-gradient-to-r from-white via-black to-white"></span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl px-2 md:px-0">
        {categories.map((cat) => (
          <Link 
            key={cat.name} 
            href={`/subcategories/${cat.slug}`}
            className="relative rounded-2xl justify-center flex overflow-hidden shadow bg-gray-50 group transition hover:shadow-lg cursor-pointer"
          >
            <img
              src={cat.img}
              alt={cat.name}
              width={400}
              height={400}
              className="object-cover w-full h-48 md:h-56 lg:h-64 transition group-hover:scale-105"
            />
            <span className="absolute top-[90px] left-0 bg-white px-4 py-1 text-[10px] font-extrabold tracking-widest text-gray-800 shadow-sm border border-gray-200">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
