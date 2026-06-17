const { ConvexHttpClient } = require('convex/browser');
const client = new ConvexHttpClient('https://db.aesthetxways.com');
async function run() {
  try {
    const banners = await client.query('banners:getBanners');
    console.log("BANNERS:", JSON.stringify(banners, null, 2));

    const products = await client.query('webStore:getAllProducts', { limit: 5 });
    console.log("PRODUCTS IMAGES:");
    products.forEach(p => {
      console.log(`- ItemId: ${p.itemId}, mainImage: ${p.mainImage}`);
    });
  } catch (err) {
    console.error(err);
  }
}
run();
