// lib/channel-helpers.ts
import { prisma } from "./prisma";
import { ChannelType } from "./types";
import { ApiError } from "./api-helpers";

// Fetch all channels
export async function getAllChannels(): Promise<ChannelType[]> {
  return prisma.channel.findMany({
    select: { id: true, name: true, isDM: true, createdAt: true },
    orderBy: { name: "asc" },
  });
}

// Get or create the General channel
export async function getOrCreateGeneralChannel(): Promise<ChannelType> {
  let general = await prisma.channel.findUnique({
    where: { name: "General" },
    select: { id: true, name: true, isDM: true, createdAt: true },
  });

  if (!general) {
    general = await prisma.channel.create({
      data: { name: "General", isDM: false },
      select: { id: true, name: true, isDM: true, createdAt: true },
    });
    console.log("✅ Created General channel");
  }

  return general;
}

/**
 * Ensures a user is a member of the given channel.
 * If not, it safely adds them.
 */
export async function ensureUserInChannel(userId: string, channelId: string) {
  // 🧩 1️⃣ Ensure the user exists
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!userExists) {
    throw new Error(`❌ ensureUserInChannel: User not found for id: ${userId}`);
  }

  // 🧩 2️⃣ Ensure the channel exists
  const channelExists = await prisma.channel.findUnique({
    where: { id: channelId },
    select: { id: true },
  });
  if (!channelExists) {
    throw new Error(`❌ ensureUserInChannel: Channel not found for id: ${channelId}`);
  }

  // 🧩 3️⃣ Check existing membership
  const membership = await prisma.channelMember.findUnique({
    where: { userId_channelId: { userId, channelId } },
  });

  // 🧩 4️⃣ Create membership if missing
  if (!membership) {
    await prisma.channelMember.create({
      data: { userId, channelId },
    });
    console.log(`✅ Added user ${userId} to channel ${channelId}`);
  }
}

// Fetch a specific channel or throw 404
export async function getChannelOrThrow(channelId?: string): Promise<ChannelType> {
  // ✅ Defensive guard — prevents Prisma from receiving undefined
  if (!channelId || typeof channelId !== "string") {
    throw new ApiError("INVALID_CHANNEL_ID", "Invalid or missing channelId", 400);
  }

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: { id: true, name: true, isDM: true, createdAt: true },
  });

  if (!channel) {
    throw new ApiError("CHANNEL_NOT_FOUND", "Channel not found", 404);
  }

  return channel;
}

// Fetch channels the user belongs to
export async function getUserChannels(userId: string): Promise<ChannelType[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { channels: { include: { channel: true } } },
  });

  if (!user) throw new ApiError("USER_NOT_FOUND", "User not found", 404);

  let channels = user.channels.map((cm) => cm.channel);

  // Always include General if user has no channels
  if (channels.length === 0) {
    const general = await getOrCreateGeneralChannel();
    channels = [general];
  }

  return channels;
}