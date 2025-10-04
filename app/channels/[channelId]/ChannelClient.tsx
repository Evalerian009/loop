"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

type User = { id: string; name: string };
type Message = { id: string; content: string; user: User };
type Channel = { id: string; name: string };

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
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showNewMsgIndicator, setShowNewMsgIndicator] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ---------------- Socket.IO Initialization ----------------
  useEffect(() => {
    const socket = io("http://localhost:3000", { path: "/api/socket" });
    socketRef.current = socket;

    socket.on("newMessage", (msg: Message) => {
      if (msg.user && msg.content && msg.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      void socket.disconnect();
    };
  }, []);

  // ---------------- Join/Leave Channels ----------------
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !channelId) return;

    socket.emit("joinChannel", channelId);

    return () => {
      socket.emit("leaveChannel", channelId);
    };
  }, [channelId]);

  // ---------------- Auto-scroll & New Message Indicator ----------------
  const isScrolledToBottom = () => {
    const container = containerRef.current;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 50;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isScrolledToBottom()) {
      container.scrollTop = container.scrollHeight;
      setShowNewMsgIndicator(false);
    } else {
      setShowNewMsgIndicator(true);
    }
  }, [messages]);

  const handleScrollToBottom = () => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
      setShowNewMsgIndicator(false);
    }
  };

  // ---------------- Fetch older messages ----------------
  const fetchMessages = async (skip = 0, take = 30) => {
    if (!channelId) return;
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

  // ---------------- Send Message ----------------
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      content: newMessage,
      user: currentUser,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");

    try {
      const saved = await apiFetch<Message>(
        `/api/channels/${channelId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: optimisticMsg.content }),
        }
      );

      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? saved : m))
      );

      socketRef.current?.emit("sendMessage", saved);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      console.error(err);
    }
  };

  // ---------------- Channel Switching ----------------
  const handleChannelSwitch = (id: string) => {
    setChannelId(id);
    router.push(`/channels/${id}`);
  };

  // ---------------- Scroll-Up Infinite Load ----------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = async () => {
      if (container.scrollTop < 100 && !loading && hasMore) {
        const prevHeight = container.scrollHeight;
        await fetchMessages(messages.length);
        // Maintain scroll position after prepending
        container.scrollTop = container.scrollHeight - prevHeight;
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [messages, loading, hasMore]);


  // ---------------- UI ----------------
  return (
    <div className="flex h-screen relative">
      {/* Sidebar */}
      <div className="w-64 border-r p-4 bg-gray-50">
        <h2 className="font-bold mb-2">Channels</h2>
        {channels.map((c) => (
          <button
            key={c.id}
            className={`block w-full text-left p-2 rounded ${
              c.id === channelId ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => handleChannelSwitch(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-4 bg-gray-100"
        >
          {hasMore && (
            <button
              onClick={() => fetchMessages(messages.length)}
              disabled={loading}
              className="mb-4 text-sm text-blue-500 hover:underline"
            >
              {loading ? "Loading..." : "Load more messages"}
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

        {/* New Messages Indicator */}
        {showNewMsgIndicator && (
          <div
            onClick={handleScrollToBottom}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer shadow"
          >
            New Messages
          </div>
        )}

        {/* Message Input */}
        <form
          onSubmit={handleSend}
          className="p-4 bg-white border-t flex gap-2"
        >
          <input
            type="text"
            className="flex-1 border rounded p-2"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}