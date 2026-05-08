import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Recipe from '@/lib/models/Recipe';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/recipes/:id
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const recipe = await Recipe.findOne({ _id: id, authorId: session.user.id }).lean();
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    const serialized = { ...(recipe as any), _id: (recipe as any)._id.toString() };
    return NextResponse.json(serialized);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/recipes/:id
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    await dbConnect();

    const recipe = await Recipe.findOneAndUpdate(
      { _id: id, authorId: session.user.id },
      { $set: body },
      { new: true }
    ).lean();

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found or unauthorized' }, { status: 404 });
    }

    const serialized = { ...(recipe as any), _id: (recipe as any)._id.toString() };
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('[API] PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/recipes/:id
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const recipe = await Recipe.findOneAndDelete({ _id: id, authorId: session.user.id });
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}