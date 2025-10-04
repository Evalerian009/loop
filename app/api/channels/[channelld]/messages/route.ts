// app/api/channels/[channelId]/messages/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, ApiError, errorResponse } from "@/lib/api-helpers";
import { createMessageSchema } from "@/lib/validators";

// --- GET: Fetch all messages in a channel ---
export async function GET(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const channel = await prisma.channel.findUnique({
      where: { id: params.channelId },
    });
    if (!channel)
      throw new ApiError("CHANNEL_NOT_FOUND", "Channel not found", 404);

    const { searchParams } = new URL(req.url);
    const take = Number(searchParams.get("take")) || 50;
    const skip = Number(searchParams.get("skip")) || 0;

    const messages = await prisma.message.findMany({
      where: { channelId: params.channelId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
      skip,
      take,
    });

    return NextResponse.json(messages);
  } catch (error) {
    return errorResponse(error);
  }
}

// --- POST: Create a new message in this channel ---
export async function POST(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await requireSession();

    // Type-safe email
    const email = session.user?.email;
    if (!email) throw new ApiError("UNAUTHORIZED", "No email found in session", 401);

    const body = createMessageSchema.parse(await req.json());

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new ApiError("USER_NOT_FOUND", "User not found", 404);

    const channel = await prisma.channel.findUnique({
      where: { id: params.channelId },
    });
    if (!channel)
      throw new ApiError("CHANNEL_NOT_FOUND", "Channel not found", 404);

    const message = await prisma.message.create({
      data: {
        content: body.content,
        channelId: params.channelId,
        userId: user.id,
      },
      include: { user: true },
    });

    return NextResponse.json(message);
  } catch (error) {
    return errorResponse(error);
  }
}