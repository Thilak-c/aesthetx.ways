import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req, { params }) {
  try {
    const { fileName } = await params; // from URL

    if (!fileName) {
      return NextResponse.json({ error: "No file specified" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "uploads_files", fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(filePath);
    const ext = path.extname(filePath).substring(1);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": `image/${ext}`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}
