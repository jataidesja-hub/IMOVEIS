import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const pasta = (formData.get('pasta') as string) || 'imoveis';

    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `imoveis-app/${pasta}`,
      transformation: [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
      ],
    });

    return NextResponse.json({ url: result.secure_url, public_id: result.public_id });
  } catch (error: any) {
    console.error('Erro upload Cloudinary:', error);
    return NextResponse.json({ error: error?.message || 'Erro ao fazer upload' }, { status: 500 });
  }
}
