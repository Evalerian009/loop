// app/api/messages/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { channelId, content } = await req.json();
  if (!content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // If no channelId is provided → default to "General"
  let targetChannelId = channelId;
  if (!targetChannelId) {
    const generalChannel = await prisma.channel.findUnique({
      where: { name: "General" },
    });
    if (!generalChannel) {
      return NextResponse.json(
        { error: "General channel not found" },
        { status: 500 }
      );
    }
    targetChannelId = generalChannel.id;
  }

  // Create the message
  const message = await prisma.message.create({
    data: {
      content,
      channelId: targetChannelId,
      userId: user.id,
    },
    include: {
      user: true,
    },
  });

  return NextResponse.json(message);
}