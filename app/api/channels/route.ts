// app/api/channels/route.ts
import { requireUserSession } from "@/lib/session";   // session helper
import { ApiError, errorResponse } from "@/lib/api-helpers"; // error handling
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const user = await requireUserSession();
    const body = await req.json();
    const name = body.name?.trim();

    if (!name) throw new ApiError("INVALID_INPUT", "Channel name required", 400);

    const existing = await prisma.channel.findUnique({ where: { name } });
    if (existing) throw new ApiError("DUPLICATE_CHANNEL", "Channel already exists", 400);

    // Create channel
    const channel = await prisma.channel.create({
      data: { name, isDM: false },
    });

    // Add creator as member
    await prisma.channelMember.create({
      data: { userId: user.id, channelId: channel.id },
    });

    return NextResponse.json(channel);
  } catch (err) {
    return errorResponse(err);
  }
}
