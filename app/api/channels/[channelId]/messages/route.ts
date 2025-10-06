// app/api/channels/[channelId]/messages/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse } from "@/lib/api-helpers";
import { requireUserSession } from "@/lib/session";
import { createMessageSchema } from "@/lib/validators";
import { getChannelOrThrow, ensureUserInChannel } from "@/lib/channel-helpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: { channelId: string } }) {
  try {
    const channelId = params.channelId;
    await getChannelOrThrow(channelId);

    const { searchParams } = new URL(req.url);
    const take = Number(searchParams.get("take")) || 50;
    const skip = Number(searchParams.get("skip")) || 0;

    const messages = await prisma.message.findMany({
      where: { channelId, isDeleted: false },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "asc" },
      skip,
      take,
    });

    return NextResponse.json(messages);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request, context: { params: Promise<{ channelId: string }> }) {
  try {
    // ✅ Await the params properly
    const { channelId } = await context.params;

    if (!channelId) {
      throw new Error("Missing channelId in route params");
    }

    // ✅ Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Parse the request body
    const { content } = await req.json();
    if (!content || !content.trim()) {
      return Response.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    // ✅ Ensure the channel exists
    const channel = await getChannelOrThrow(channelId);

    // ✅ Save message to DB
    const message = await prisma.message.create({
      data: {
        content,
        userId: session.user.id,
        channelId: channel.id,
      },
    });

    return Response.json(message, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/channels/[channelId]/messages:", error);
    return Response.json(
      { error: { message: error.message || "Something went wrong" } },
      { status: 500 }
    );
  }
}