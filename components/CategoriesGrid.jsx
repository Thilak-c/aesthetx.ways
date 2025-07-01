import Image from "next/image";

const categories = [
  { name: "OVERSIZED T-SHIRTS", img: "/categories/oversized-tshirt.jpg" },
  { name: "ALL BOTTOMS", img: "/categories/all-bottoms.jpg" },
  { name: "SHIRTS", img: "/categories/shirts.jpg" },
  { name: "POLOS", img: "/categories/polos.jpg" },
  { name: "SNEAKERS", img: "/categories/sneakers.jpg" },
  { name: "BACKPACKS", img: "/categories/backpacks.jpg" },
  { name: "PERFUMES", img: "/categories/perfumes.jpg" },
  { name: "CAPS", img: "/categories/caps.jpg" },
];

export default function CategoriesGrid() {
  return (
    <section className="w-full  flex flex-col items-center py-10 bg-white">
      <h2 className="text-3xl  md:text-4xl font-extrabold text-center mb-8 tracking-wide text-gray-800 border-b-2 border-gray-200 pb-2 w-fit mx-auto">CATEGORIES</h2>
      <div className="grid grid-cols-2 md:grid-cols-4  gap-6 w-full max-w-6xl px-2 md:px-0">
        {categories.map((cat) => (
          <div key={cat.name} className="relative rounded-2xl justify-center flex overflow-hidden shadow bg-gray-50 group transition hover:shadow-lg">
            <Image
              src={cat.img}
              alt={cat.name}
              width={400}
              height={400}
              className="object-cover w-full h-48 md:h-56 lg:h-64 transition group-hover:scale-105"
            />
            <span className="absolute top-[90px] left-0 bg-white px-4 py-1  text-[10px] font-extrabol tracking-widest text-gray-800 shadow-sm border border-gray-200">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
} 