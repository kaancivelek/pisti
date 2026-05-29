import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

// GET /api/admin/users?search=...
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() ?? "";

    await dbConnect();

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const serialized = users.map((u: any) => ({
      ...u,
      _id: u._id.toString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("[API] GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/admin/users - Rol Güncelleme
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: "Kendi rolünüzü değiştiremezsiniz!" }, { status: 400 });
    }

    if (role !== "admin" && role !== "user") {
      return NextResponse.json({ error: "Geçersiz rol." }, { status: 400 });
    }

    await dbConnect();

    const updated = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password").lean();

    if (!updated) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ ...(updated as any), _id: (updated as any)._id.toString() });
  } catch (error) {
    console.error("[API] PATCH /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/admin/users?userId=...
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: "Kendinizi silemezsiniz!" }, { status: 400 });
    }

    await dbConnect();

    const deleted = await User.findByIdAndDelete(userId);

    if (!deleted) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
