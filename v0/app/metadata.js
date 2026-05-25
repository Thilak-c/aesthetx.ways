// app/metadata.js - Shared metadata configuration
export const homeMetadata = {
  title: "Home - Shop Premium Fashion & Sneakers",
  description: "Discover the latest trends in fashion and sneakers. Shop premium men's and women's clothing, footwear, and accessories with fast shipping and easy returns.",
  keywords: ["fashion store", "buy sneakers online", "men's fashion", "women's fashion", "premium clothing", "online shopping India"],
  openGraph: {
    title: "AesthetX Ways - Premium Fashion & Lifestyle Store",
    description: "Discover the latest trends in fashion and sneakers. Shop premium products with fast shipping.",
    type: "website",
    images: ["/og-home.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AesthetX Ways - Premium Fashion & Lifestyle Store",
    description: "Discover the latest trends in fashion and sneakers.",
  },
};

export const shopMetadata = {
  title: "Shop All Products - Men, Women & Sneakers",
  description: "Browse our complete collection of premium fashion products. Filter by category, size, and price to find your perfect style.",
  openGraph: {
    title: "Shop All Products | AesthetX Ways",
    description: "Browse our complete collection of premium fashion products.",
    type: "website",
  },
};

export const generateProductMetadata = (product) => {
  if (!product) return {};
  
  return {
    title: `${product.name} - ${product.category} | Buy Online`,
    description: `Buy ${product.name} online. ${product.description || `Premium ${product.category} product available in multiple sizes.`} Price: ₹${product.price}. Fast shipping and easy returns.`,
    keywords: [product.name, product.category, product.brand, "buy online", "fashion", "sneakers"].filter(Boolean),
    openGraph: {
      title: `${product.name} | AesthetX Ways`,
      description: `Buy ${product.name} - ${product.category}. Price: ₹${product.price}`,
      type: "website",
      siteName: "AesthetX Ways",
      images: [
        {
          url: product.mainImage,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | AesthetX Ways`,
      description: `Buy ${product.name} - ${product.category}. Price: ₹${product.price}`,
      images: [product.mainImage],
    },
  };
};
