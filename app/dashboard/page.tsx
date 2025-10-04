import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, name: true, lastVisitedChannelId: true },
  });

  if (!user) redirect("/login");

  const channels = await prisma.channel.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // --- Ensure General membership & redirect first-time login ---
  const general = channels.find((c) => c.name.toLowerCase() === "general");
  if (general) {
    const membership = await prisma.channelMember.findUnique({
      where: { userId_channelId: { userId: user.id, channelId: general.id } },
    });

    if (!membership) {
      await prisma.channelMember.create({ data: { userId: user.id, channelId: general.id } });
    }

    if (!user.lastVisitedChannelId) {
      redirect(`/channels/${general.id}`);
    }
  }

  // --- Pass server-fetched data to client component ---
  return <DashboardClient user={user} channels={channels} />;
}
