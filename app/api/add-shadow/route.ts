import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';


export async function POST(req: NextRequest) {
  const { imageUrl } = await req.json();

  const photoroomUrl = `https://image-api.photoroom.com/v2/edit?background.color=FFFFFF&outputSize=1000x1000&padding=0.1&shadow.mode=ai.hard&imageUrl=${encodeURIComponent(imageUrl)}`;

  try {
    const response = await fetch(photoroomUrl, {
      headers: {
        'x-api-key':process.env.PHOTOROOM_API_KEY!,
      }
    });

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return NextResponse.json({
      finalImage: `data:image/png;base64,${base64}`,
    });
  } catch (err) {
    return NextResponse.json({ error: "Shadow addition failed" }, { status: 500 });
  }
}
