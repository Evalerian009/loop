// app/channels/[channelId]/page.tsx
import { redirect } from "next/navigation";
import ChannelClient from "./ChannelClient";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface Props {
  params: { channelId: string };
}

export default async function ChannelPage(props: Props) {
  // ⚠️ Await params to satisfy Next.js App Router
  const params = await props.params; // <--- THIS is key
  const channelIdFromParams = params.channelId;

  // --- 1. Check user session ---
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, name: true },
  });
  if (!user) redirect("/login");

  // --- 2. Fetch all channels ---
  let channels = await prisma.channel.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Auto-create General if empty
  if (!channels.length) {
    const general = await prisma.channel.create({
      data: { name: "General", isDM: false },
    });
    channels = [general];
  }

  // --- 3. Validate channelId ---
  const currentChannel =
    channels.find((c) => c.id === channelIdFromParams) ||
    channels.find((c) => c.name.toLowerCase() === "general") ||
    channels[0];

  // Redirect if the requested channelId is invalid
  if (currentChannel.id !== channelIdFromParams) {
    redirect(`/channels/${currentChannel.id}`);
  }

  // --- 4. Fetch recent messages ---
  const messages = await prisma.message.findMany({
    where: { channelId: currentChannel.id, isDeleted: false },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
    take: 30,
  });

  // --- 5. Render client component ---
  return (
    <ChannelClient
      currentUser={user}
      currentChannel={currentChannel}
      channels={channels}
      initialMessages={messages}
    />
  );
}