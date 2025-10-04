// app/api/channels/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const name = body.name?.trim();

  if (!name) return NextResponse.json({ error: "Channel name required" }, { status: 400 });

  // Create channel
  const channel = await prisma.channel.create({
    data: { name, isDM: false },
  });

  // Add creator to the channel
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (user) {
    await prisma.channelMember.create({
      data: { userId: user.id, channelId: channel.id },
    });
  }

  return NextResponse.json(channel);
}