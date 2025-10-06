// lib/message-helpers.ts
import { prisma } from "./prisma";
import { MessageType } from "./types";
import { ApiError } from "./api-helpers";

export async function ensureMessageOwner(messageId: string, userEmail: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { user: true },
  });
  if (!message) throw new ApiError("MESSAGE_NOT_FOUND", "Message not found", 404);
  if (message.user.email !== userEmail) throw new ApiError("FORBIDDEN", "Not allowed", 403);
  return message;
}

export async function fetchChannelMessages(channelId: string, skip = 0, take = 50) {
  return prisma.message.findMany({
    where: { channelId, isDeleted: false },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
    skip,
    take,
  });
}