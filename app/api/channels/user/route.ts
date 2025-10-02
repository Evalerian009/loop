import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      channels: {
        include: { channel: true },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let channels = user.channels.map((cm: { channel: any }) => cm.channel);

  // Ensure General channel is included if user has no channels
  if (channels.length === 0) {
    const generalChannel = await prisma.channel.findUnique({
      where: { name: "General" },
    });
    if (generalChannel) channels = [generalChannel];
  }

  return NextResponse.json(channels);
}