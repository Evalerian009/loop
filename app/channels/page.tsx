// app/channels/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function ChannelsRootPage() {
  // 1️⃣ Ensure user is logged in
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  // 2️⃣ Fetch user’s channels from API (goes through session auth)
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/channels/user`, {
    headers: { Cookie: "" }, // Session cookies automatically included by Next
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to load channels");
  const channels = await res.json();

  // 3️⃣ Ensure there’s at least one channel (General fallback)
  if (!channels.length) throw new Error("No channels found");

  const general = channels.find(
    (c: { name: string }) => c.name.toLowerCase() === "general"
  );

  const targetChannel = general || channels[0];

  // 4️⃣ Redirect to user’s default (General) channel
  redirect(`/channels/${targetChannel.id}`);
}