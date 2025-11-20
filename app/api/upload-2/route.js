// app/api/upload/route.js
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  const data = await req.formData();
  const file = data.get("file");

  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), "uploads_files");

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const fileName = Date.now() + "-" + file.name;
  const filePath = path.join(uploadsDir, fileName);

  fs.writeFileSync(filePath, buffer);
 const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    
  return NextResponse.json({ url: `${baseUrl}api/uploads/ + ${fileName}` });
};
