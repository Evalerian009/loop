"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

type User = { id: string; name: string };
type Message = { id: string; content: string; user: User };
type Channel = { id: string; name: string };

export default function ChannelPage({ currentUser }: { currentUser: User }) {
  const params = useParams();
  const router = useRouter();

  const [channelId, setChannelId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket.IO
  useEffect(() => {
    if (!socketRef.current) {
      const socket = io("http://localhost:3000", { path: "/api/socket" });
      socketRef.current = socket;

      socket.on("newMessage", (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  // Fetch user channels
  useEffect(() => {
    const fetchChannels = async () => {
      const res = await fetch("/api/channels/user");
      const data: Channel[] = await res.json();
      setChannels(data);

      if (!params?.id && data.length > 0) {
        const general = data.find((c) => c.name === "General");
        const selected = general ? general.id : data[0].id;
        setChannelId(selected);
        router.push(`/channels/${selected}`);
      } else if (params?.id) {
        setChannelId(params.id as string);
      }
    };
    fetchChannels();
  }, [params, router]);

  // Load messages and join channel room
  useEffect(() => {
    const fetchMessages = async () => {
      if (!channelId || !socketRef.current) return;

      const res = await fetch(`/api/messages/${channelId}`);
      const data: Message[] = await res.json();
      setMessages(data);

      socketRef.current.emit("joinChannel", channelId);
    };
    fetchMessages();
  }, [channelId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !channelId || !socketRef.current) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      content: newMessage,
      user: { ...currentUser },
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");

    socketRef.current.emit("sendMessage", {
      channelId,
      content: optimisticMsg.content,
      user: currentUser,
    });
  };

  if (!channelId) return <p>Loading channel...</p>;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r p-4 bg-gray-50">
        <h2 className="font-bold mb-2">Channels</h2>
        {channels.map((c) => (
          <button
            key={c.id}
            className={`block w-full text-left p-2 rounded ${
              c.id === channelId ? "bg-blue-500" : ""
            }`}
            onClick={() => {
              setChannelId(c.id);
              router.push(`/channels/${c.id}`);
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {messages.map((m) => (
            <div key={m.id} className="mb-2">
              <span className="font-semibold">{m.user?.name || "Anon"}: </span>
              <span>{m.content}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

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
