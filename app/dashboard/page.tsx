import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, lastVisitedChannelId: true },
  });
  if (!user) redirect("/login");

  const channels = await prisma.channel.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <DashboardClient
      user={user}
      channels={channels}
      lastVisitedChannelId={user.lastVisitedChannelId}
    />
  );
}