// app/shop/layout.jsx
export const metadata = {
  title: "Shop All Products - Men, Women & Sneakers Collection",
  description: "Browse our complete collection of premium fashion products. Shop men's fashion, women's clothing, sneakers, and accessories. Filter by category, size, and price.",
  keywords: ["shop fashion", "buy clothes online", "men's collection", "women's collection", "sneakers", "online shopping"],
  openGraph: {
    title: "Shop All Products | AesthetX Ways",
    description: "Browse our complete collection of premium fashion products.",
    type: "website",
    images: ["/og-shop.jpg"],
  },
  alternates: {
    canonical: "https://aesthetxways.com/shop",
  },
};

export default function ShopLayout({ children }) {
  return children;
}
