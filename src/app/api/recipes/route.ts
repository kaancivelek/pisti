import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Recipe from '@/lib/models/Recipe';

// GET /api/recipes?authorId=xxx
export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const recipes = await Recipe.find({ authorId: session.user.id })
      .select('-contentText -ingredientGroups -instructionGroups')
      .sort({ createdAt: -1 })
      .lean();

    const serialized = recipes.map((r) => ({ ...r, _id: (r._id as { toString(): string }).toString(), authorId: (r.authorId as { toString(): string } | undefined)?.toString() }));
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('[API] GET /api/recipes error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/recipes
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Slug oluştur
    const baseSlug = body.title
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const slug = `${baseSlug}-${Date.now()}`;

    await dbConnect();
    const recipe = await Recipe.create({
      ...body,
      slug,
      authorId: session.user.id,
    });

    return NextResponse.json({ ...recipe.toObject(), _id: recipe._id.toString() }, { status: 201 });
  } catch (error: unknown) {
    console.error('[API] POST /api/recipes error:', error);
    if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 11000) {
      return NextResponse.json({ error: 'Bu başlıkta zaten bir tarif var.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
