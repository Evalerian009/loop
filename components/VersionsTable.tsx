"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { toast } from "react-hot-toast";
import type { Editor } from "@tiptap/react";
import clsx from "clsx";

type Version = {
  _id: Id<"versions">;
  docId: Id<"documents">;
  content: string;
  createdAt: number;
};

type VersionsTableProps = {
  documentId: Id<"documents">;
  editor: Editor | null;
};

export default function VersionsTable({ documentId, editor }: VersionsTableProps) {
  const [restoring, setRestoring] = useState<Id<"versions"> | null>(null);
  const [preview, setPreview] = useState<Version | null>(null);
  const [open, setOpen] = useState(false);

  const versions = useQuery(api.functions.versions.getVersions, { docId: documentId }) as
    | Version[]
    | null
    | undefined;
  const restoreVersion = useMutation(api.functions.versions.restoreVersion);

  const formatDate = (ts: number) => new Date(ts).toLocaleString();

  return (
    <>
      {/* Floating toggle button (always visible) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-16 right-4 z-50 px-4 py-2 rounded-full shadow-md bg-[var(--accent)] text-white"
      >
        📜 Versions
      </button>

      {/* Slide-in panel */}
      <div
        className={clsx(
          "fixed top-0 right-0 h-full w-96 max-w-full bg-[var(--bg)] border-l border-[var(--muted)] shadow-lg transition-transform duration-300 z-40 flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-[var(--muted)]">
          <h2 className="font-semibold text-[var(--text)]">Document Versions</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-[var(--accent)]"
          >
            ✖
          </button>
        </div>

        {/* Versions list */}
        <div className="p-3 overflow-y-auto flex-1">
          {versions === undefined && <div>Loading versions…</div>}
          {versions === null && <div>Unable to load versions.</div>}
          {versions?.length === 0 && <div>No saved versions yet.</div>}

          {versions && versions.length > 0 && (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[var(--muted)] text-left">
                  <th className="p-2 text-[var(--text)]">ID</th>
                  <th className="p-2 text-[var(--text)]">Created At</th>
                  <th className="p-2 text-[var(--text)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v) => (
                  <tr key={v._id} className="border-t border-[var(--muted)]">
                    <td className="p-2 text-[var(--text)] truncate">{v._id}</td>
                    <td className="p-2 text-[var(--text)]">{formatDate(v.createdAt)}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="px-2 py-1 text-xs button-primary"
                        onClick={() => setPreview(v)}
                      >
                        Preview
                      </button>
                      <button
                        className="px-2 py-1 text-xs bg-[var(--success)] text-white rounded hover:bg-green-700 disabled:opacity-50"
                        onClick={async () => {
                          if (restoring) return;
                          setRestoring(v._id);
                          try {
                            await restoreVersion({ versionId: v._id });
                            toast.success(`Restored version ${v._id}`);

                            if (editor) editor.commands.setContent(v.content);
                          } catch (err) {
                            console.error(err);
                            toast.error("Failed to restore version.");
                          } finally {
                            setRestoring(null);
                          }
                        }}
                        disabled={restoring === v._id}
                      >
                        {restoring === v._id ? "Restoring..." : "Restore"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg)] rounded-lg shadow-lg max-w-3xl w-full p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold mb-3 text-[var(--text)]">
              Preview Version {preview._id}
            </h3>

            <PreviewEditor content={preview.content} />

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-[var(--muted)] text-[var(--text)] rounded hover:bg-[var(--muted)]/80"
                onClick={() => setPreview(null)}
              >
                Close
              </button>
              <button
                className="px-3 py-1 bg-[var(--success)] text-white rounded hover:bg-green-700 disabled:opacity-50"
                onClick={async () => {
                  if (!preview || restoring) return;
                  setRestoring(preview._id);
                  try {
                    await restoreVersion({ versionId: preview._id });

                    if (editor) editor.commands.setContent(preview.content);

                    setPreview(null);
                    toast.success(`Restored version ${preview._id}`);
                  } catch (err) {
                    console.error(err);
                    toast.error("Failed to restore version.");
                  } finally {
                    setRestoring(null);
                  }
                }}
                disabled={restoring === preview?._id}
              >
                {restoring === preview?._id ? "Restoring..." : "Restore this version"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PreviewEditor({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) return <div>Loading preview…</div>;

  return (
    <div className="border rounded p-3 max-h-96 overflow-auto bg-[var(--bg)] text-[var(--text)]">
      <EditorContent editor={editor} />
    </div>
  );
}
