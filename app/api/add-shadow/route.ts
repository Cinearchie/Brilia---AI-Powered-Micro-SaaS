// app/api/add-shadow/route.ts

import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { nanoid } from 'nanoid';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    const res = await fetch(imageUrl);
    const buffer = Buffer.from(await res.arrayBuffer());
    const original = sharp(buffer).ensureAlpha();

    const metadata = await original.metadata();
    const width = metadata.width ?? 600;
    const height = metadata.height ?? 600;

    const offsetX = 20;
    const offsetY = 20;
    const blurRadius = 15;

    // Step 1: Get alpha channel and blur it (shape of shadow)
    const alphaChannel = await original
      .clone()
      .extractChannel('alpha')
      .toColourspace('b-w') // grayscale
      .blur(blurRadius)
      .toBuffer();

    // Step 2: Color the blurred alpha with black
    const blackShadow = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: alphaChannel,
          blend: 'dest-in',
        },
      ])
      .png()
      .toBuffer();

    // Step 3: Create a white canvas, place shadow & image
    const finalBuffer = await sharp({
      create: {
        width: width + offsetX,
        height: height + offsetY,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([
        { input: blackShadow, top: offsetY, left: offsetX }, // shadow
        { input: await original.png().toBuffer(), top: 0, left: 0 }, // main image
      ])
      .png()
      .toBuffer();

    // Step 4: Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          public_id: `shadowed_${nanoid()}`,
          folder: 'sellora/shadowed',
          format: 'png',
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(finalBuffer);
    });

    return NextResponse.json({ finalImage: uploadResult.secure_url });

  } catch (error) {
    console.error('Shadow API Error:', error);
    return NextResponse.json({ error: 'Shadow generation failed' }, { status: 500 });
  }
}
