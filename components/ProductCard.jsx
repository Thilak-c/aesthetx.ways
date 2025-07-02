import Image from "next/image";

export default function ProductCard({ img, name, category, price, className = "" }) {
  return (
    <div className={`flex-shrink-0 w-1/2 sm:w-1/2 md:w-1/4 bg-white rounded-lg overflow-hidden group flex flex-col px-2 ${className}`}>
      <div className="relative rounded-lg w-full aspect-[3/4] bg-gray-100">
        <Image
          src={img}
          alt={name}
          fill
          className="object-cover object-top group-hover:scale-105 transition"
        />
      </div>
      <div className="p-3 flex flex-col gap-1">
        <div className="font-extrabold border-b border-gray-300 pb-2 text-gray-700 text-[12px] leading-tight">{name}</div>
        <div className="text-[10px] font-light text-gray-500">{category}</div>
        <div className="text-[12px] text-gray-700 font-extrabold">₹ {price}</div>
      </div>
    </div>
  );
} 