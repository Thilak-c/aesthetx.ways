import { executeDataOperation } from "@/lib/dataOperations";

export default async function sitemap() {
  const baseUrl = "https://aesthetxways.com";

  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/offline-shops`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/track-order`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const products = await executeDataOperation({ table: "products", operation: "getAllProducts", args: { limit: 1000 } });

    const productRoutes = products?.map((product) => ({
      url: `${baseUrl}/product/${product.itemId}`,
      lastModified: new Date(product.createdAt || Date.now()),
      changeFrequency: "weekly",
      priority: 0.7,
    })) || [];

    const categories = [...new Set(products?.map(p => p.category) || [])];
    const collectionRoutes = categories.map((category) => ({
      url: `${baseUrl}/collections/${category.toLowerCase().replace(/\s+/g, '-')}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...collectionRoutes, ...productRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticRoutes;
  }
}
