import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const billNumber = resolvedParams?.billNumber ? String(resolvedParams.billNumber) : "";
  
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return {
      title: `Bill #${billNumber} | AesthetX Ways`,
      description: `Digital E-bill #${billNumber} at AesthetX Ways.`,
      icons: {
        icon: "/logo_t.svg",
      },
    };
  }
  
  const client = new ConvexHttpClient(convexUrl);
  
  let bill = null;
  try {
    bill = await client.query(api.inventory.getBillByNumber, { billNumber });
  } catch (error) {
    console.error("Failed to fetch bill metadata:", error);
  }
  
  const title = bill 
    ? `Bill #${billNumber} | AesthetX Ways` 
    : `Bill #${billNumber} | AesthetX Ways`;
  
  const customerName = bill?.customerName ? bill.customerName.toUpperCase() : "Valued Guest";
  const itemsText = bill?.items?.map(item => `${item.productName} (Size ${item.size})`).join(", ") || "";
  const description = bill 
    ? `Digital E-bill #${billNumber} for ${customerName} at AesthetX Ways. Items: ${itemsText}`
    : `Digital receipt verification terminal at AesthetX Ways.`;
    
  return {
    title,
    description,
    icons: {
      icon: "/logo_t.svg",
    },
  };
}

export default function BillLayout({ children }) {
  return <>{children}</>;
}
