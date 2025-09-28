"use client";

import { useEffect, useState } from "react";
import type { HocuspocusProvider } from "@hocuspocus/provider";

type OnlineUser = {
  id: string;
  name: string;
  color: string;
};

export default function OnlineUsers({ provider }: { provider?: HocuspocusProvider | null }) {
  const [users, setUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!provider?.awareness) return;

    const awareness = provider.awareness;

    const handleUpdate = () => {
      const states = Array.from(awareness.getStates().values())
        .map((s: any) => s?.user)
        .filter(Boolean) as OnlineUser[];
      setUsers(states);
    };

    handleUpdate(); // initial snapshot
    awareness.on("change", handleUpdate);

    return () => {
      awareness.off("change", handleUpdate);
    };
  }, [provider]);

  if (!users.length) return null;

  return (
    <div className="flex items-center gap-2 border p-2 rounded bg-[var(--bg)] border-[var(--muted)] overflow-x-auto">
      {users.map((u) => (
        <div key={u.id} className="flex items-center gap-1" title={u.name}>
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: u.color }}
          />
          <span className="text-sm truncate max-w-[80px] text-[var(--text)]">{u.name}</span>
        </div>
      ))}
    </div>
  );
}
