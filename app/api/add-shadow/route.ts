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

    // Fetch and prepare the image
    const res = await fetch(imageUrl);
    const buffer = Buffer.from(await res.arrayBuffer());
    
    // Get metadata first to understand the image
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width ?? 600;
    const height = metadata.height ?? 600;
    const hasAlpha = metadata.hasAlpha;

    const offsetX = 20;
    const offsetY = 20;
    const blurRadius = 15;

    // Step 1: Create a mask 
    let shadowMask: Buffer;
    
    if (hasAlpha) {
      shadowMask = await sharp(buffer)
        .extractChannel(3) // Alpha channel
        .toColourspace('b-w')
        .blur(blurRadius)
        .toBuffer();
    } else {

      shadowMask = await sharp(buffer)
        .flatten({ background: '#000000' }) // Convert to black
        .toColourspace('b-w')
        .blur(blurRadius)
        .toBuffer();
    }

    // Step 2: Create the shadow 
    const shadowLayer = await sharp(shadowMask)
      .composite([{
        input: Buffer.from([0, 0, 0, 128]), // Black with 50% opacity
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'dest-in'
      }])
      .toBuffer();

    // Step 3: Create final composition
    const finalBuffer = await sharp({
      create: {
        width: width + offsetX,
        height: height + offsetY,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }, // white background
      },
    })
      .composite([
        {
          input: shadowLayer,
          top: offsetY,
          left: offsetX,
        },
        {
          input: buffer, // Original image
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    // Step 4: Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
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
      );
      uploadStream.end(finalBuffer);
    });

    return NextResponse.json({ 
      finalImage: uploadResult.secure_url,
      imageInfo: {
        originalWidth: width,
        originalHeight: height,
        hadAlphaChannel: hasAlpha
      }
    });

  } catch (error) {
    console.error('Shadow API Error:', error);
    return NextResponse.json(
      { 
        error: 'Shadow generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Please ensure the image URL is valid and accessible'
      },
      { status: 500 }
    );
  }
}