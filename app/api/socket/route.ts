// app/api/socket/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Server } from "socket.io";
import { prisma } from "@/lib/prisma";

let io: Server | null = null;

export async function GET(req: NextRequest) {
  // Initialize only once (preserved across hot reloads)
  if (!io) {
    console.log("🚀 Initializing Socket.IO (App Router)...");

    const server = new Server(3001, {
      cors: {
        origin: "*", // tighten in production
        methods: ["GET", "POST"],
      },
      path: "/api/socket",
    });

    io = server;
    // @ts-ignore
    globalThis._io = io;

    io.on("connection", (socket) => {
      console.log("🟢 Client connected:", socket.id);

      socket.on("joinChannel", (channelId: string) => {
        socket.join(channelId);
        console.log(`➡️ ${socket.id} joined channel ${channelId}`);
      });

      socket.on("sendMessage", async (data) => {
        try {
          const { channelId, content, user } = data;
          if (!channelId || !content || !user?.id) return;

          const msg = await prisma.message.create({
            data: {
              content,
              channelId,
              userId: user.id,
            },
            include: { user: true },
          });

          // Use optional chaining to silence the null warning
          io?.to(channelId).emit("newMessage", msg);
          console.log(`📨 Sent message to channel ${channelId}`);
        } catch (err) {
          console.error("❌ Error saving/sending message:", err);
        }
      });

      socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
      });
    });

    console.log("✅ Socket.IO server ready on :3001");
  } else {
    console.log("⚙️ Socket.IO already running");
  }

  return NextResponse.json({ message: "Socket.IO server active" });
}