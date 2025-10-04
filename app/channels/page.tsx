// app/channels/page.tsx
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function ChannelsRootPage() {
  // 1. Ensure the user is logged in
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  // 2. Fetch all channels
  const channels = await prisma.channel.findMany({
    select: { id: true, name: true },
  });

  if (!channels.length) {
    // fallback if no channels exist
    throw new Error("No channels found");
  }

  // 3. Find the General channel, or fallback to first
  const general = channels.find((c) => c.name.toLowerCase() === "general");
  const targetChannel = general || channels[0];

  // 4. Redirect to the General channel
  redirect(`/channels/${targetChannel.id}`);
}