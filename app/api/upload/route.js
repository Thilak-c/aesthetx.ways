import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "uploads_files"); // save here
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.name);
    const fileName = `${nanoid()}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return NextResponse.json({
      url: `${baseUrl}/api/uploads/${fileName}`, // clean URL
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
