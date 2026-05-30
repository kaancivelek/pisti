import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

// GET /api/profile — oturumdaki kullanıcının bilgilerini döner
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select('-password').lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userObj = user as Record<string, unknown> & { _id: { toString(): string } };
    return NextResponse.json({ ...userObj, _id: userObj._id.toString() });
  } catch (error) {
    console.error('[API] GET /api/profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/profile — ad, e-posta ve/veya şifre güncelle
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, currentPassword, newPassword } = await req.json();

    await dbConnect();

    // E-posta başkasına ait mi?
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: session.user.id } });
      if (existing) {
        return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanımda.' }, { status: 409 });
      }
    }

    const updateFields: Record<string, string> = {};
    if (name) updateFields.name = name.trim();
    if (email) updateFields.email = email.trim().toLowerCase();

    // Şifre değişikliği isteniyorsa mevcut şifreyi doğrula
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Mevcut şifrenizi girmeniz gerekiyor.' }, { status: 400 });
      }
      const user = await User.findById(session.user.id);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const isValid = await bcrypt.compare(currentPassword, user.password as string);
      if (!isValid) {
        return NextResponse.json({ error: 'Mevcut şifreniz yanlış.' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Yeni şifre en az 6 karakter olmalıdır.' }, { status: 400 });
      }

      updateFields.password = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'Güncellenecek bir alan yok.' }, { status: 400 });
    }

    const updated = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password').lean();

    const updatedObj = updated as Record<string, unknown> & { _id: { toString(): string } };
    return NextResponse.json({ ...updatedObj, _id: updatedObj._id.toString() });
  } catch (error) {
    console.error('[API] PATCH /api/profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/profile — hesabı sil
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    await User.findByIdAndDelete(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /api/profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
