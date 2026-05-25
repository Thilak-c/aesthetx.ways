import { executeDataOperation } from "@/lib/dataOperations";

function escapeXml(str) {
  return String(str).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

export async function GET() {
  try {
    const products = await executeDataOperation({ table: "products", operation: "getAllProducts", args: { limit: 1000 } });

    if (!products || products.length === 0) {
      return new Response("<?xml version=\"1.0\" encoding=\"UTF-8\"?><rss version=\"2.0\"><channel><title>No products</title></channel></rss>", {
        headers: { "Content-Type": "application/xml" },
      });
    }

    const items = products.map((product) => {
      const totalStock = product.sizeStock
        ? Object.values(product.sizeStock).reduce((sum, stock) => sum + stock, 0)
        : 0;
      const availability = totalStock > 0 ? "in stock" : "out of stock";
      const availableSizes = product.sizeStock
        ? Object.entries(product.sizeStock).filter(([_, stock]) => stock > 0).map(([size]) => size)
        : ["One Size"];

      return `
    <item>
      <g:id>${escapeXml(product.itemId)}</g:id>
      <title>${escapeXml(product.name)}</title>
      <description>${escapeXml(product.description || `Premium ${product.category} - ${product.name}`)}</description>
      <g:price>${product.price} INR</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <link>https://aesthetxways.com/product/${escapeXml(product.itemId)}</link>
      <g:image_link>${escapeXml(product.mainImage)}</g:image_link>
      <g:brand>AesthetX Ways</g:brand>
      <g:google_product_category>Apparel &amp; Accessories</g:google_product_category>
      <g:product_type>${escapeXml(product.category || '')}</g:product_type>
      <g:size>${escapeXml(availableSizes.join(', '))}</g:size>
      <g:color>${escapeXml(product.color || 'Multiple Colors')}</g:color>
    </item>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>AesthetX Ways Product Feed</title>
    <link>https://aesthetxways.com</link>
    <description>Product feed for Google Shopping</description>${items.join('')}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating XML feed:", error);
    return new Response("<?xml version=\"1.0\" encoding=\"UTF-8\"?><rss version=\"2.0\"><channel><title>Error</title></channel></rss>", {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
