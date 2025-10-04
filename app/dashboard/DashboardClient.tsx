"use client"; // needed for React state/hooks

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardClient({ user, channels }: { user: any; channels: any[] }) {
  const router = useRouter();
  const [newChannel, setNewChannel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannel.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newChannel }),
      });

      if (!res.ok) throw new Error("Failed to create channel");
      const channel = await res.json();
      setNewChannel("");
      router.push(`/channels/${channel.id}`);
    } catch (err) {
      console.error(err);
      alert("Could not create channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user.name} 🎉</h1>

      <div className="flex flex-col w-64 border rounded p-4 bg-gray-50 space-y-2">
        <h2 className="font-semibold mb-2">Channels</h2>
        {channels.map((channel) => (
          <a
            key={channel.id}
            href={`/channels/${channel.id}`}
            className={`block w-full text-left p-2 rounded ${
              channel.name.toLowerCase() === "general" ? "bg-blue-500 text-white" : "hover:bg-blue-100"
            }`}
          >
            {channel.name}
          </a>
        ))}
      </div>

      <form onSubmit={handleCreateChannel} className="flex gap-2 mt-4">
        <input
          type="text"
          placeholder="New channel name"
          className="border rounded p-2"
          value={newChannel}
          onChange={(e) => setNewChannel(e.target.value)}
        />
        <button type="submit" className="bg-green-500 text-white px-4 rounded" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}