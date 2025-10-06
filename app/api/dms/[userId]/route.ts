// app/api/dms/[userId]/route.ts
import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { userId: string } }) {
  const currentUser = await requireUserSession();
  const otherUserId = params.userId;

  if (currentUser.id === otherUserId) {
    return NextResponse.json({ error: "Cannot DM yourself" }, { status: 400 });
  }

  // Check if DM already exists
  let channel = await prisma.channel.findFirst({
    where: {
      isDM: true,
      members: {
        every: { userId: { in: [currentUser.id, otherUserId] } },
      },
    },
    include: { members: true },
  });

  if (!channel) {
    channel = await prisma.channel.create({
      data: {
        name: "DM",
        isDM: true,
        members: {
          create: [
            { userId: currentUser.id },
            { userId: otherUserId },
          ],
        },
      },
      include: {
        members: true, // <-- include the members relation
      },
    });
  }

  return NextResponse.json(channel);
}