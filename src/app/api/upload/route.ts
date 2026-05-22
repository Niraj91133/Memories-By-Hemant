import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const useMock = !cloudName || !apiKey || !apiSecret;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (useMock) {
      console.log('Cloudinary credentials missing. Using local public/uploads mock.');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileExt = path.extname(file.name) || '.png';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, buffer);
      
      const fileUrl = `/uploads/${fileName}`;
      return NextResponse.json({ url: fileUrl });
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    
    return new Promise<NextResponse>((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'hemant_memories',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error details:', error);
            resolve(NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 }));
          } else {
            resolve(NextResponse.json({ url: result!.secure_url }));
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

