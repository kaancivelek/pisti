import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Recipe from '@/lib/models/Recipe';
import { generateRecipePdf } from '@/lib/pdf/generateRecipePdf';
export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const recipe = await Recipe.findById(id).lean();
    if (!recipe) {
      return NextResponse.json(
        { error: 'Tarif bulunamadı.' },
        { status: 404 }
      );
    }

    const r = recipe as any;

    const pdfBuffer = await generateRecipePdf({
      title: r.title,
      shortTitle: r.shortTitle,
      description: r.description,
      categoryName: r.categoryName,
      prepTime: r.prepTime,
      prepTimeUnit: r.prepTimeUnit,
      cookTime: r.cookTime,
      cookTimeUnit: r.cookTimeUnit,
      servings: r.servings,
      servingUnit: r.servingUnit,
      ingredientGroups: r.ingredientGroups,
      instructionGroups: r.instructionGroups,
    });

    const safeName = (r.title ?? 'tarif')
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });

  } catch (error: any) {
    console.error('[PDF] generation error:', error);

    return NextResponse.json(
      {
        error: 'PDF oluşturulamadı.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}