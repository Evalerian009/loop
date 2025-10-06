// app/api/channels/user/route.ts
import { requireUserSession } from "@/lib/session";   // session helper
import { errorResponse } from "@/lib/api-helpers";    // error handling
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getOrCreateGeneralChannel } from "@/lib/channel-helpers";
import { ChannelType } from "@/lib/types";


export async function GET() {
  try {
    const user = await requireUserSession();

    const userWithChannels = await prisma.user.findUnique({
      where: { id: user.id },
      include: { channels: { include: { channel: true } } },
    });

    if (!userWithChannels) throw new Error("User not found");

    let channels = userWithChannels.channels.map((cm) => cm.channel) as ChannelType[];

    // Ensure General channel exists and is included
    if (channels.length === 0) {
      const general = await getOrCreateGeneralChannel();
      channels = [general];
    }

    return NextResponse.json(channels);
  } catch (err) {
    return errorResponse(err);
  }
}
