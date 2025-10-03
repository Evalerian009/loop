"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [title, setTitle] = useState("");

  const documents = useQuery(api.functions.documents.listDocuments, { userId: user?.id ?? "" });
  const createDoc = useMutation(api.functions.documents.create);
  const deleteDoc = useMutation(api.functions.documents.remove);

  if (!isLoaded) return <div className="p-6">Loading user...</div>;
  if (!user) return <div className="p-6">Please sign in to view your documents.</div>;

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createDoc({ title, userId: user.id });
    setTitle("");
    toast.success("Document created!");
  };

  const handleDelete = (id: Id<"documents">) => {
    if (!user?.id) return;

    toast(
      (t) => (
        <div className="flex flex-col gap-2 text-[color:var(--text)]">
          <span>Are you sure you want to delete this document?</span>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                await deleteDoc({ id, userId: user.id });
                toast.dismiss(t.id);
                toast.success("Document deleted!");
              }}
              className="bg-[color:var(--error)] text-white px-3 py-1 rounded hover:bg-[color:var(--error)]/90 transition"
            >
              Yes
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-[color:var(--muted)] text-[color:var(--text)] px-3 py-1 rounded hover:bg-[color:var(--muted)]/90 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-[color:var(--text)]">Your Documents</h1>

      {/* Create new document */}
      <div className="mb-6 flex gap-2">
        <input
          className="flex-1 px-3 py-2 border rounded border-[color:var(--muted)] bg-[color:var(--bg-secondary)] text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          placeholder="New document title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          onClick={handleCreate}
          disabled={!title.trim()}
          className={`button-primary px-6 h-11 flex items-center rounded-lg text-sm font-medium ${
            !title.trim() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Get Started
        </button>
      </div>

      {!documents && <p className="text-[color:var(--muted)]">Loading documents...</p>}

      {documents?.length === 0 && (
        <p className="text-[color:var(--muted)]">
          You don’t have any documents yet. Start by creating one above 👆
        </p>
      )}

      <ul className="space-y-3">
        {documents?.map((doc) => (
          <li
            key={doc._id}
            className="card flex justify-between items-center p-4"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{doc.title}</span>
                <span className="text-xs text-[color:var(--muted)]">({doc.role})</span>
              </div>
              <span className="text-xs text-[color:var(--muted)]">
                Last updated {new Date(doc.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/documents/${doc._id}`}
                className="px-3 py-1 text-sm bg-[color:var(--success)] text-white rounded hover:bg-[color:var(--success)]/90 transition"
              >
                Open
              </Link>
              <button
                onClick={() => handleDelete(doc._id)}
                className="px-3 py-1 text-sm bg-[color:var(--error)] text-white rounded hover:bg-[color:var(--error)]/90 transition"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
