// app/channels/[channelId]/page.tsx
import { redirect } from "next/navigation";
import ChannelClient from "./ChannelClient";
import { prisma } from "@/lib/prisma";
import { ensureUserInChannel, getOrCreateGeneralChannel } from "@/lib/channel-helpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ChannelPage({ params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;

  // 1️⃣ Validate session
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true },
  });
  if (!user) redirect("/login");

  // 2️⃣ Ensure user is part of this channel
  await ensureUserInChannel(user.id, channelId);

  // 3️⃣ Fetch channels
  let channels = await prisma.channel.findMany({
    select: { id: true, name: true, isDM: true, createdAt: true },
    orderBy: { name: "asc" },
  });

  if (!channels.length) {
    const general = await getOrCreateGeneralChannel();
    channels = [general];
  }

  // 4️⃣ Pick current channel
  const currentChannel =
    channels.find((c) => c.id === channelId) ||
    channels.find((c) => c.name.toLowerCase() === "general") ||
    channels[0];

  if (!currentChannel || currentChannel.id !== channelId) {
    redirect(`/channels/${currentChannel?.id ?? channels[0].id}`);
  }

  // 🆕 5️⃣ Update user's last visited channel
  await prisma.user.update({
    where: { id: user.id },
    data: { lastVisitedChannelId: currentChannel.id },
  });

  // 6️⃣ Fetch last 30 messages
  const messages = await prisma.message.findMany({
    where: { channelId: currentChannel.id, isDeleted: false },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
    take: 30,
  });

  // 7️⃣ Render
  return (
    <ChannelClient
      currentUser={user}
      currentChannel={currentChannel}
      channels={channels}
      initialMessages={messages}
    />
  );
}