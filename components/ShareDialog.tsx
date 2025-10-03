"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

type ShareDialogProps = {
  documentId: Id<"documents">;
  isOpen: boolean;
  onClose: () => void;
};

export default function ShareDialog({ documentId, isOpen, onClose }: ShareDialogProps) {
  const { user } = useUser();
  const collaborators = useQuery(
    api.functions.permissions.listWithUsers,
    isOpen && documentId ? { documentId } : "skip"
  );

  const grant = useMutation(api.functions.permissions.grant);
  const revoke = useMutation(api.functions.permissions.revoke);
  const resolveUserId = useAction(api.functions.resolveUserId.resolveUserId);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");

  const handleInvite = async () => {
    if (!email || !user?.id) return;
    const clerkUserId = await resolveUserId({ identifier: email });
    if (!clerkUserId) {
      alert("No user found for that email/username");
      return;
    }
    await grant({ documentId, userId: clerkUserId, role, triggeredBy: user.id });
    setEmail("");
  };

  if (!isOpen) return null;

  const owners = collaborators?.filter((p) => p.role === "owner") ?? [];
  const others = collaborators?.filter((p) => p.role !== "owner") ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl p-6 shadow card bg-[var(--bg)] text-[var(--text)]">
        <h2 className="mb-4 text-lg font-semibold">Share Document</h2>

        <div className="space-y-4">
          {/* Owners */}
          {owners.length > 0 && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-[var(--accent)]">Owners</h3>
              {owners.map((p) => {
                const isYou = p.userId === user?.id;
                return (
                  <div key={p._id} className="flex items-center justify-between rounded border p-2 border-[var(--muted)]">
                    <span>
                      {p.name || p.email}
                      {isYou && <span className="ml-1 text-xs text-[var(--accent)]">(You)</span>}{" "}
                      — <span className="italic">{p.role}</span>
                    </span>
                    {/* No remove button for owners */}
                  </div>
                );
              })}
            </div>
          )}

          {/* Collaborators */}
          {others.length > 0 && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-[var(--muted)]">Collaborators</h3>
              {others.map((p) => {
                const isYou = p.userId === user?.id;
                return (
                  <div key={p._id} className="flex items-center justify-between rounded border p-2 border-[var(--muted)]">
                    <span>
                      {p.name || p.email}
                      {isYou && <span className="ml-1 text-xs text-[var(--accent)]">(You)</span>}{" "}
                      — <span className="italic">{p.role}</span>
                    </span>
                    <button
                      onClick={() => revoke({ documentId, userId: p.userId })}
                      className="text-sm text-[var(--error)] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {collaborators === undefined && (
            <p className="text-sm text-[var(--muted)]">Loading collaborators…</p>
          )}
        </div>

        {/* Invite form */}
        <div className="mt-4 space-y-2">
          <input
            type="text"
            placeholder="User email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-[var(--muted)] px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "viewer" | "editor")}
            className="w-full rounded border border-[var(--muted)] px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button
            onClick={handleInvite}
            className="w-full button-primary"
          >
            Invite
          </button>
        </div>

        {/* Close button */}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="rounded px-4 py-2 text-sm text-[var(--error)] hover:text-[var(--accent)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}