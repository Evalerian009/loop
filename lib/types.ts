import { Prisma } from "@prisma/client";

// --- USER ---
export type UserType = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    image: true;
    lastVisitedChannelId: true;
  };
}>;

// --- CHANNEL ---
export type ChannelType = Prisma.ChannelGetPayload<{
  select: {
    id: true;
    name: true;
    isDM: true;
    createdAt: true;
  };
}>;

// --- MESSAGE ---
export type MessageType = Prisma.MessageGetPayload<{
  select: {
    id: true;
    content: true;
    isDeleted: true;
    createdAt: true;
    updatedAt: true;
    channelId: true;
    user: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;