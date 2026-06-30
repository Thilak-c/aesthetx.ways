const { ConvexHttpClient } = require("convex/browser");
const path = require("path");
const fs = require("fs");

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf8");
envContent.split("\n").forEach(line => {
  const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
});

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
console.log("Convex URL:", convexUrl);
const client = new ConvexHttpClient(convexUrl);

async function test() {
  try {
    const product = await client.query("webStore:getProductByItemId", { itemId: "AWFS9296322" });
    console.log("Product found:", JSON.stringify(product, null, 2));
  } catch (err) {
    console.error("Error running Convex query:", err);
  }
}
test();
