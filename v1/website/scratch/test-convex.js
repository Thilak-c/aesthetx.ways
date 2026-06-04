const { ConvexHttpClient } = require('convex/browser');

const convexUrl = "http://187.127.164.186:5001";
const client = new ConvexHttpClient(convexUrl);

async function run() {
  try {
    console.log("Fetching products...");
    const products = await client.query('webStore:getAllProducts', { limit: 100 });
    console.log(`Fetched ${products.length} products:`);
    products.forEach(p => {
      console.log(`- ID: ${p.itemId}, Name: ${p.name}, Category: ${p.category}, MainCategory: ${p.mainCategory}, Subcategories: ${p.subcategories}, Type: ${JSON.stringify(p.type)}`);
    });
  } catch (error) {
    console.error("Error running query:", error);
  }
}

run();
