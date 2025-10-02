// app/api/socket/route.ts
import { Server } from "socket.io";
import { prisma } from "@/lib/prisma";

export const ioHandler = (req: any, res: any) => {
  // Prevent multiple Socket.IO instances during HMR in dev
  if (!res.socket.server.io) {
    console.log("🚀 Setting up Socket.IO server...");

    const io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: "*", // adjust for production
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Join a channel room
      socket.on("joinChannel", (channelId: string) => {
        socket.join(channelId);
        console.log(`Socket ${socket.id} joined channel ${channelId}`);
      });

      // Receive and broadcast messages
      socket.on("sendMessage", async (data) => {
        try {
          const { channelId, content, user } = data;

          const msg = await prisma.message.create({
            data: {
              content,
              channelId,
              userId: user.id,
            },
            include: { user: true },
          });

          // Broadcast to everyone in that channel
          io.to(channelId).emit("newMessage", msg);
        } catch (err) {
          console.error("Failed to save/send message:", err);
        }
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("Socket.IO server already running");
  }

  res.end();
};