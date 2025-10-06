// lib/session.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { UserType } from "./types";

export async function requireUserSession(): Promise<UserType> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  // Fetch full user data from DB
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      lastVisitedChannelId: true,
    },
  });

  if (!user) redirect("/login");

  return user;
}