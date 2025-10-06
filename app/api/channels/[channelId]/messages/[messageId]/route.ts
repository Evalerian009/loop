// app/api/channels/[channelId]/messages/[messageId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/session";
import { ApiError, errorResponse } from "@/lib/api-helpers";

// ---------------- GET ----------------
// Fetch messages in a channel (paginated)
export async function GET(
  req: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const user = await requireUserSession();
    const { searchParams } = new URL(req.url);
    const skip = Number(searchParams.get("skip") || 0);
    const take = Number(searchParams.get("take") || 30);

    const messages = await prisma.message.findMany({
      where: { channelId: params.channelId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    // reverse because we fetch newest first
    return NextResponse.json(messages.reverse());
  } catch (err) {
    return errorResponse(err);
  }
}

// ---------------- POST ----------------
// Send new message in a channel
export async function POST(
  req: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const user = await requireUserSession();
    const { content } = await req.json();

    if (!content?.trim()) {
      throw new ApiError("INVALID_INPUT", "Message content required", 400);
    }

    const channel = await prisma.channel.findUnique({
      where: { id: params.channelId },
    });
    if (!channel) throw new ApiError("NOT_FOUND", "Channel not found", 404);

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        userId: user.id,
        channelId: params.channelId,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json(message);
  } catch (err) {
    return errorResponse(err);
  }
}