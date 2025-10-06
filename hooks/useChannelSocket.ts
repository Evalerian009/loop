// hooks/useChannelSocket.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { MessageType } from "@/lib/types";

interface ChannelSocket {
  messages: MessageType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  sendMessage: (msg: MessageType) => void;
  addMessages: (msgs: MessageType[]) => void;
}

export function useChannelSocket(channelId: string): ChannelSocket {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);

  // Initialize Socket.IO once
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      path: "/api/socket",
    });
    socketRef.current = socket;

    socket.on("newMessage", (msg: MessageType) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Join / leave channel when channelId changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !channelId) return;

    socket.emit("joinChannel", channelId);

    return () => {
      socket.emit("leaveChannel", channelId);
    };
  }, [channelId]);

  // Send a message through Socket.IO
  const sendMessage = (msg: MessageType) => {
    if (!socketRef.current) return;
    socketRef.current.emit("sendMessage", msg);
  };

  // Prepend messages (for infinite scroll)
  const addMessages = (msgs: MessageType[]) => {
    setMessages((prev) => [...msgs, ...prev]);
  };

  return { messages, setMessages, sendMessage, addMessages };
}