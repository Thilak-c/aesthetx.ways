import { executeDataOperation } from "@/lib/dataOperations";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
  }

  try {
    const data = await executeDataOperation({ table: "analytics", operation: "getAnalyticsForDay", args: { date } });
    return Response.json(data, {
      headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" },
    });
  } catch (error) {
    return Response.json({ error: "Failed to fetch analytics", details: error.message }, { status: 500 });
  }
}
