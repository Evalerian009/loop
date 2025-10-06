"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import type { MessageType as Message } from "@/lib/types";
import GoToDashboardButton from "@/app/dashboard/GoToDashboardButton";

type User = { id: string; name: string };
type Channel = { id: string; name: string };
type ClientMessage = {
  id: string;
  content: string;
  user: User;
  channelId: string;
  isDeleted?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Something went wrong");
  return data;
}

export default function ChannelClient({
  currentUser,
  currentChannel,
  channels,
  initialMessages,
}: {
  currentUser: User;
  currentChannel: Channel;
  channels: Channel[];
  initialMessages: Message[];
}) {
  const router = useRouter();
  const [channelId, setChannelId] = useState(currentChannel.id);
  const [messages, setMessages] = useState<ClientMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showNewMsgIndicator, setShowNewMsgIndicator] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ---------------- SOCKET INIT ----------------
  useEffect(() => {
    if (!socketRef.current) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
      const socket = io(socketUrl, {
        path: "/api/socket",
        transports: ["websocket"],
      });

      socketRef.current = socket;

      socket.on("connect", () => console.log("✅ Connected:", socket.id));
      socket.on("disconnect", () => console.log("❌ Disconnected"));
    }

    const socket = socketRef.current!;
    socket.emit("joinChannel", channelId);

    socket.on("newMessage", (msg: Message) => {
      if (msg.channelId === channelId && msg.user.id !== currentUser.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("newMessage");
      socket.emit("leaveChannel", channelId);
    };
  }, [channelId, currentUser.id]);

  // ---------------- SCROLLING ----------------
  const isScrolledToBottom = () => {
    const c = containerRef.current;
    return c ? c.scrollHeight - c.scrollTop - c.clientHeight < 50 : true;
  };

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    if (isScrolledToBottom()) {
      c.scrollTop = c.scrollHeight;
      setShowNewMsgIndicator(false);
    } else {
      setShowNewMsgIndicator(true);
    }
  }, [messages]);

  const scrollToBottom = () => {
    const c = containerRef.current;
    if (c) {
      c.scrollTop = c.scrollHeight;
      setShowNewMsgIndicator(false);
    }
  };

  // ---------------- FETCH MESSAGES ----------------
  const fetchMessages = async (skip = 0, take = 30) => {
    setLoading(true);
    try {
      const data: Message[] = await apiFetch(
        `/api/channels/${channelId}/messages?skip=${skip}&take=${take}`
      );
      if (skip === 0) setMessages(data);
      else setMessages((prev) => [...data, ...prev]);
      setHasMore(data.length === take);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SEND MESSAGE ----------------
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ClientMessage = {
      id: tempId,
      content: newMessage,
      user: currentUser,
      channelId,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");

    try {
      const saved = await apiFetch<Message>(`/api/channels/${channelId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: optimisticMsg.content }),
      });

      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
      socketRef.current?.emit("sendMessage", saved);
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  // ---------------- CHANNEL SWITCH ----------------
  const handleChannelSwitch = (id: string) => {
    if (id !== channelId) {
      setChannelId(id);
      router.push(`/channels/${id}`);
    }
  };

  // ---------------- INFINITE SCROLL ----------------
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;

    const onScroll = async () => {
      if (c.scrollTop < 100 && !loading && hasMore) {
        const prevHeight = c.scrollHeight;
        await fetchMessages(messages.length);
        c.scrollTop = c.scrollHeight - prevHeight;
      }
    };

    c.addEventListener("scroll", onScroll);
    return () => c.removeEventListener("scroll", onScroll);
  }, [messages, loading, hasMore]);

  // ---------------- UI ----------------
  return (
    <div className="flex h-screen relative">
      {/* Sidebar */}
      <aside className="w-64 border-r p-4 bg-gray-50 overflow-y-auto">
        <h2 className="font-bold mb-2 text-lg">Channels</h2>
        <GoToDashboardButton />
        {channels.map((c) => (
          <button
            key={c.id}
            className={`block w-full text-left p-2 rounded transition ${
              c.id === channelId ? "bg-blue-500 text-white" : "hover:bg-gray-200"
            }`}
            onClick={() => handleChannelSwitch(c.id)}
          >
            {c.name}
          </button>
        ))}
      </aside>

      {/* Chat */}
      <main className="flex-1 flex flex-col relative">
        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {hasMore && (
            <button
              onClick={() => fetchMessages(messages.length)}
              disabled={loading}
              className="mb-4 text-sm text-blue-500 hover:underline"
            >
              {loading ? "Loading..." : "Load older messages"}
            </button>
          )}

          {messages.map((m) => (
            <div key={m.id} className="mb-2 flex items-center gap-2">
              <span className="font-semibold">{m.user?.name || "Anon"}:</span>
              <span>{m.content}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {showNewMsgIndicator && (
          <div
            onClick={scrollToBottom}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer shadow-md"
          >
            New Messages ↓
          </div>
        )}

        <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded p-2"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Send
          </button>
        </form>
      </main>
    </div>
  );
}