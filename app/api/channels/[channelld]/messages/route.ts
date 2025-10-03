// app/api/messages/[channelId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  const messages = await prisma.message.findMany({
    where: { channelId: params.channelId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}