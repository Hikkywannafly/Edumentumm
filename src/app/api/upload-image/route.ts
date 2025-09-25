import { put } from "@vercel/blob";
import { customAlphabet } from "nanoid";
import type { NextRequest } from "next/server";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 16);

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({
          error: "Invalid content type. Expected multipart/form-data",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!file.type.startsWith("image/")) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Only images are allowed" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 5MB" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const fileExtension = file.name.split(".").pop();
    // Generate a more robust unique filename using nanoid
    const timestamp = Date.now();
    const randomId = nanoid();
    const uniqueFileName = `${timestamp}-${randomId}.${fileExtension}`;

    const blob = await put(uniqueFileName, file, {
      access: "public",
    });

    return new Response(JSON.stringify(blob), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return new Response(JSON.stringify({ error: "Failed to upload image" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const runtime = "edge";
