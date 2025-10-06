// app/api/users/[userId]/last-visited/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params?: Promise<{ userId?: string }> }
) {
  try {
    const params = await context.params; // ✅ await params
    const userId = params?.userId;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const { channelId } = await req.json();
    if (!channelId) {
      return NextResponse.json({ error: "channelId required" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { lastVisitedChannelId: channelId },
    });

    return NextResponse.json(user);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update last visited channel" },
      { status: 500 }
    );
  }
}