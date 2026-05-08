import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Recipe from '@/lib/models/Recipe';
import { generateRecipePdf } from '@/lib/pdf/generateRecipePdf';

export const runtime = 'nodejs';

// Tip tanımını bu şekilde yapmak çakışmaları önler
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _req: NextRequest,
  context: RouteContext // 'context' üzerinden erişmek tip güvenliğini artırır
) {
  try {
    await dbConnect();

    // Next.js 15/16'da params UNWRAP edilmelidir
    const { id } = await context.params;

    const recipe = await Recipe.findById(id).lean();
    if (!recipe) {
      return NextResponse.json(
        { error: 'Tarif bulunamadı.' },
        { status: 404 }
      );
    }

    const pdfBuffer = await generateRecipePdf(recipe as any);

    const safeName = (recipe.title || 'tarif')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');


    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error('[PDF_GEN_ERROR]:', error);
    return NextResponse.json(
      { error: 'PDF oluşturulamadı.', details: error.message },
      { status: 500 }
    );
  }
}