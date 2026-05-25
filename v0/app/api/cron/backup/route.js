import { NextResponse } from "next/server";
import { executeDataOperation } from "@/lib/dataOperations";

export async function GET(request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    const isVercelCron = request.headers.get("x-vercel-cron") === "true";
    const isFromAdmin = (request.headers.get("referer") || "").includes("/admin");

    if (!isVercelCron && !isFromAdmin) {
      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const backupUrl = process.env.BACKUP_CONVEX_URL;
    if (!backupUrl) {
      return NextResponse.json({ error: "BACKUP_CONVEX_URL not configured" }, { status: 500 });
    }

    const normalizedBackupUrl = backupUrl.endsWith("/") ? backupUrl : backupUrl + "/";

    const results = {
      timestamp: new Date().toISOString(),
      backupUrl: normalizedBackupUrl,
      users: { success: false, count: 0 },
      products: { success: false, count: 0 },
      orders: { success: false, count: 0 },
    };

    async function callBackup(path, data) {
      const res = await fetch(`${normalizedBackupUrl}api/mutation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, args: data }),
      });
      if (!res.ok) throw new Error(`Backup failed: ${res.status}`);
      return res.json();
    }

    try {
      const users = await executeDataOperation({ table: "users", operation: "getAllUsers", args: {} });
      const syncUsers = await callBackup("backupReceiver:syncUsers", { users: users || [] });
      results.users = { success: true, synced: syncUsers?.synced || 0, deleted: syncUsers?.deleted || 0 };
    } catch (err) {
      results.users.error = err.message;
    }

    try {
      const products = await executeDataOperation({ table: "products", operation: "getAllProducts", args: { limit: 10000 } });
      const syncProducts = await callBackup("backupReceiver:syncProducts", { products: products || [] });
      results.products = { success: true, synced: syncProducts?.synced || 0, deleted: syncProducts?.deleted || 0 };
    } catch (err) {
      results.products.error = err.message;
    }

    try {
      const orders = await executeDataOperation({ table: "orders", operation: "getAllOrders", args: {} });
      const syncOrders = await callBackup("backupReceiver:syncOrders", { orders: orders || [] });
      results.orders = { success: true, synced: syncOrders?.synced || 0, deleted: syncOrders?.deleted || 0 };
    } catch (err) {
      results.orders.error = err.message;
    }

    return NextResponse.json({ success: true, message: "Hourly backup completed", results });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
