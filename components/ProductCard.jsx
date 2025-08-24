import Image from "next/image";
import Link from "next/link";
import { Poppins, Inter } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
});

export default function ProductCard({ img, name, category, price, productId, className = "" }) {
  return (
    <Link href={`/product/${productId}`} className="block">
      <div
        className={`flex-shrink-0 w-[180px] md:w-[200px] lg:w-[250px]
        bg-white rounded-xl overflow-hidden group flex flex-col cursor-pointer  transition- duration-300 ${className}`}
      >
        <div className="relative rounded-t-xl w-full aspect-[3/4] bg-gray-100 overflow-hidden">
          <Image
            src={img}
            alt={name}
            fill
            className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
          />
        </div>
        <div className="p-2 sm:p-3 flex flex-col gap- sm:gap-1">
        <div
          className={`${poppins.className} font-normal md:font-semibold border-b border-gray-200 pb-1 sm:pb- text-gray-800 text-[12px] sm:text-[14px] leading-snug line-clamp-2`}
        >
          {name}
        </div>
        <div
          className={`${inter.className} text-[10px] sm:text-[11px] font-light text-gray-500`}
        >
          {category}
        </div>
        <div
          className={`${poppins.className} text-[12px] sm:text-[14px] text-gray-900 font-semibold md:font-bold`}
        >
          ₹ {price}
        </div>
      </div>
      </div>
    </Link>
  );
}
