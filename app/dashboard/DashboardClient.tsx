"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Channel, User } from "@prisma/client";

export default function DashboardClient({
  user,
  channels,
  lastVisitedChannelId,
}: {
  user: Pick<User, "id" | "name">;
  channels: Pick<Channel, "id" | "name">[];
  lastVisitedChannelId?: string | null;
}) {
  const router = useRouter();
  const [newChannel, setNewChannel] = useState("");
  const [loading, setLoading] = useState(false);

  // ------------------ Helpers ------------------
  const updateLastVisited = async (channelId: string) => {
    try {
      await fetch(`/api/users/${user.id}/last-visited`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId }),
      });
    } catch (err) {
      console.error("Failed to update last visited channel", err);
    }
  };

  const handleGoToChannel = async (channelId: string) => {
    await updateLastVisited(channelId);
    router.push(`/channels/${channelId}`);
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannel.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newChannel.trim() }),
      });

      if (!res.ok) throw new Error("Failed to create channel");
      const channel = await res.json();

      setNewChannel("");
      await handleGoToChannel(channel.id);
    } catch (err) {
      console.error(err);
      alert("Could not create channel");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Auto-redirect (brief delay) ------------------
  useEffect(() => {
    const hasRedirected = sessionStorage.getItem("loopHasRedirected");
    if (!hasRedirected && lastVisitedChannelId) {
      const timer = setTimeout(() => {
        sessionStorage.setItem("loopHasRedirected", "true");
        handleGoToChannel(lastVisitedChannelId);
      }, 1000); // 👈 show dashboard for 1s before redirect
      return () => clearTimeout(timer);
    }
  }, [lastVisitedChannelId]);

  // ------------------ Render ------------------
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6 transition-opacity duration-700">
      <h1 className="text-3xl font-bold">Welcome, {user.name} 🎉</h1>

      {lastVisitedChannelId && (
        <p className="text-gray-500 text-sm">
          Redirecting you to your last visited channel...{" "}
          <button
            onClick={() => handleGoToChannel(lastVisitedChannelId)}
            className="text-blue-600 underline hover:text-blue-800"
          >
            Go now
          </button>
        </p>
      )}

      <div className="flex flex-col w-64 border rounded p-4 bg-gray-50 space-y-2">
        <h2 className="font-semibold mb-2">Channels</h2>
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => handleGoToChannel(channel.id)}
            className="block w-full text-left p-2 rounded hover:bg-blue-100 transition"
          >
            {channel.name}
          </button>
        ))}
      </div>

      <form onSubmit={handleCreateChannel} className="flex gap-2 mt-4 w-64">
        <input
          type="text"
          placeholder="New channel name"
          className="border rounded p-2 flex-1"
          value={newChannel}
          onChange={(e) => setNewChannel(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className={`px-4 rounded text-white ${
            loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
          }`}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}