"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ShareDialog from "@/components/ShareDialog";
import CommentsPanel from "@/components/CommentsPanelProps ";
import VersionsTable from "@/components/VersionsTable";
import OnlineUsers from "@/components/OnlineUsers";
import { toast } from "react-hot-toast";
import { TextStyleKit } from '@tiptap/extension-text-style'
import EditorToolbar from "@/components/EditorToolbar";
import Heading from "@tiptap/extension-heading";

// Utility: consistent user color
function getUserColor(userId: string) {
  const colors = ["#F87171","#60A5FA","#34D399","#FBBF24","#A78BFA","#F472B6","#FCD34D"];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash += userId.charCodeAt(i);
  return colors[hash % colors.length];
}

export default function DocumentPage() {
  const { user } = useUser();
  const params = useParams();
  const searchParams = useSearchParams();

  const rawDocId = params?.id as string | undefined;
  const userId = user?.id || "";

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- Convex queries ---
  const document = useQuery(
    api.functions.documents.get,
    rawDocId && userId ? { id: rawDocId as Id<"documents">, userId } : "skip"
  );

  const roleQuery = useQuery(
    api.functions.permissions.getMyRole,
    rawDocId && userId ? { documentId: rawDocId as Id<"documents">, userId } : "skip"
  );
  const role = roleQuery ?? "viewer";

  const trackAccess = useMutation(api.functions.documents.trackAccess);
  useEffect(() => {
    if (rawDocId && userId) trackAccess({ id: rawDocId as Id<"documents">, userId }).catch(() => {});
  }, [rawDocId, userId, trackAccess]);

  const saveVersion = useMutation(api.functions.versions.saveVersion);

  // --- Yjs & Hocuspocus setup ---
  const ydocRef = useRef<Y.Doc>(new Y.Doc());
  const providerRef = useRef<HocuspocusProvider | null>(null);
  if (!providerRef.current && rawDocId) {
    providerRef.current = new HocuspocusProvider({
      url: "ws://0.0.0.0:1234",
      name: rawDocId,
      document: ydocRef.current,
    });
  }
  const provider = providerRef.current;

  // --- Collaboration user ---
  const collaborationUser = useMemo(() => {
    const color = user?.id ? getUserColor(user.id) : "#FFFFFF";
    return {
      id: user?.id || "anon",
      name: user?.fullName || user?.username || "Anonymous",
      color,
    };
  }, [user]);

  useEffect(() => {
    if (user && provider?.awareness) {
      provider.awareness.setLocalStateField("user", collaborationUser);
    }
  }, [user, provider, collaborationUser]);

  // --- Tiptap editor ---
  const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: false, // disable here
      codeBlock: {
        HTMLAttributes: { class: "language-text" },
      },
    }),
    Heading.configure({
      levels: [1, 2, 3, 4, 5, 6],
    }),
    TextStyleKit,
    Collaboration.configure({ document: ydocRef.current }),
    CollaborationCaret.configure({ provider, user: collaborationUser }),
  ],
  editable: true, // must be true to actually edit
  immediatelyRender: false,
})


  useEffect(() => {
    if (editor) editor.setEditable(role !== "viewer");
  }, [editor, role]);

  const highlightCommentId = searchParams?.get("highlightComment") || null;

  const updateTitle = useMutation(api.functions.documents.updateTitle);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(document?.title || "");

  useEffect(() => {
    if (document?.title) setTitleDraft(document.title);
  }, [document?.title]);
  

  if (!document) return <div className="p-6 text-[color:var(--text)]">Loading document metadata…</div>;
  if (!editor) return <div className="p-6 text-[color:var(--text)]">Loading editor…</div>;

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Document header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          {role === "owner" ? (
            editingTitle ? (
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={async () => {
                  setEditingTitle(false);
                  if (titleDraft !== document.title) {
                    try {
                      await updateTitle({
                        id: rawDocId as Id<"documents">,
                        title: titleDraft,
                        userId,
                      });
                      toast.success("Title updated!");
                    } catch {
                      toast.error("Failed to update title");
                    }
                  }
                }}
                autoFocus
                className="text-2xl font-bold bg-[color:var(--bg-secondary)] text-[color:var(--text)] border-b border-[color:var(--accent)] focus:outline-none px-2 py-1 rounded"
              />
            ) : (
              <h1
                className="text-2xl font-bold text-[color:var(--text)] cursor-pointer hover:text-[color:var(--accent)] transition"
                onClick={() => setEditingTitle(true)}
              >
                {document.title}
              </h1>
            )
          ) : (
            <h1 className="text-2xl font-bold text-[color:var(--text)]">{document.title}</h1>
          )}

          <span className="text-sm text-[color:var(--muted)]">
            Last updated: {new Date(document.updatedAt).toLocaleString()}
          </span>
        </div>

        <div className="flex gap-2">
          {role !== "viewer" && (
            <>
              <button
                onClick={() => setIsShareOpen(true)}
                className="button-primary bg-[color:var(--accent)] hover:brightness-110"
              >
                Share
              </button>
              <button
                onClick={async () => {
                  if (!editor || saving) return;
                  setSaving(true);
                  try {
                    await saveVersion({
                      docId: rawDocId as Id<"documents">,
                      content: editor.getHTML(),
                    });
                    toast.success("Version saved successfully!");
                  } catch {
                    toast.error("Failed to save version.");
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className={`button-primary ${
                  saving
                    ? "bg-[color:var(--muted)] cursor-not-allowed"
                    : "bg-[color:var(--success)] hover:brightness-110"
                }`}
              >
                {saving ? "Saving..." : "Save Version"}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Online collaborators */}
      <OnlineUsers provider={provider} />
      
      {/* Editor toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="border border-[color:var(--muted)] bg-[color:var(--bg-secondary)] text-[color:var(--text)] rounded p-4 min-h-[400px]"
      />

      {/* Share dialog */}
      {rawDocId && (
        <ShareDialog
          documentId={rawDocId as Id<"documents">}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}

      {/* Comments */}
      {rawDocId && (
        <CommentsPanel
          documentId={rawDocId as Id<"documents">}
          highlightCommentId={highlightCommentId}
          currentUserId={userId}
        />
      )}

      {/* Versions table */}
      {rawDocId && (
        <VersionsTable editor={editor} documentId={rawDocId as Id<"documents">} />
      )}
    </div>
  );
}