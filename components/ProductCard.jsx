import Image from "next/image";
import Link from "next/link";
import { Poppins, Inter } from "next/font/google";
import { useProductView } from "@/hooks/useProductView";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Skeleton shimmer component
function SkeletonBox({ className }) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 rounded ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}

export default function ProductCard({
  img,
  name,
  category,
  price,
  productId,
  className = "",
  loading = false,
}) {
  // Track views only if not loading
  if (!loading) {
    useProductView(productId);
  }
console.log(img)
  if (loading) {
    return (
      <div
        className={`flex-shrink-0 w-[180px] md:w-[200px] lg:w-[250px] 
        bg-white rounded-xl overflow-hidden flex flex-col ${className}`}
      >
        {/* Image skeleton */}
        <SkeletonBox className="w-full aspect-[3/4] rounded-t-xl" />

        <div className="p-2 sm:p-3 flex flex-col gap-2">
          {/* Name skeleton */}
          <SkeletonBox className="h-4 w-3/4" />
          {/* Category skeleton */}
          <SkeletonBox className="h-3 w-1/2" />
          {/* Price skeleton */}
          <SkeletonBox className="h-4 w-1/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="block ">
      <div
        className={`flex-shrink-0 w-[180px] md:w-[200px] lg:w-[250px]
         rounded-xl overflow-hidden group flex flex-col cursor-pointer transition duration-300 ${className}`}
      >
        <div className="relative  rounded-t-xl w-full aspect-[3/4] bg-gray-100 overflow-hidden">
          <img
            src={img}
            alt={name}
            fill={name}
            className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
          />
        </div>
        <div className="p-2 sm:p-3 flex flex-col gap-1 sm:gap-1">
          <div
            className={`${poppins.className} font-normal md:font-semibold border-b border-gray-200 pb-1 sm:pb-1 text-gray-800 text-[12px] sm:text-[14px] leading-snug line-clamp-2`}
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
    </div>
  );
}
