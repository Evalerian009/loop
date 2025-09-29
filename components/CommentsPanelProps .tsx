//CommentsPanelProps.tsx

"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import clsx from "clsx";

type CommentsPanelProps = {
  documentId: Id<"documents">;
  highlightCommentId?: string | null;
  currentUserId: string;
  ownerId?: string;
};

type CommentWithReplies = Doc<"comments"> & {
  replies?: CommentWithReplies[];
};

export default function CommentsPanel({
  documentId,
  highlightCommentId,
  currentUserId,
  ownerId,
}: CommentsPanelProps) {
  const [localHighlightId, setLocalHighlightId] = useState<string | null>(
    highlightCommentId || null
  );
  const [open, setOpen] = useState(false);

  const comments = useQuery(api.functions.comments.getForDocument, {
    docId: documentId,
  });

  const createComment = useMutation(api.functions.comments.create);
  const deleteComment = useMutation(api.functions.comments.remove);

  const [text, setText] = useState("");

  const handleAddComment = async () => {
    if (!text.trim()) return;
    const newCommentId = await createComment({
      docId: documentId,
      userId: currentUserId,
      text,
    });
    setText("");
    setLocalHighlightId(newCommentId);
  };

  const handleReply = async (parentId: Id<"comments">, replyText: string) => {
    if (!replyText.trim()) return;
    const newCommentId = await createComment({
      docId: documentId,
      userId: currentUserId,
      text: replyText,
      parentId,
    });
    setLocalHighlightId(newCommentId);
  };

  const handleDeleteComment = async (commentId: Id<"comments">) => {
    try {
      await deleteComment({ commentId, userId: currentUserId });
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to delete comment");
      }
    }
  };

  // Scroll & highlight effect
  useEffect(() => {
    const idToHighlight = localHighlightId || highlightCommentId;
    if (!idToHighlight || !comments) return;

    const el = document.getElementById(`comment-${idToHighlight}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlighted-comment");
      setTimeout(() => el.classList.remove("highlighted-comment"), 3000);
    }
    setLocalHighlightId(null);
  }, [localHighlightId, highlightCommentId, comments]);

  if (!comments) return null;

  const CommentItem = ({ 
    comment, 
    level = 0, 
  }: {
    comment: CommentWithReplies;
    level?: number;
  }) => {
    const [replyText, setReplyText] = useState("");
    const [showReplyBox, setShowReplyBox] = useState(false);
    const canDelete = comment.userId === currentUserId || ownerId === currentUserId;

    return (
      <div
        id={`comment-${comment._id}`}
        className={clsx(
          "p-2 border-t mt-2",
          "border-[var(--muted)]/10",
          (localHighlightId === comment._id || highlightCommentId === comment._id) &&
            "highlighted-comment bg-[var(--muted)]/20"
        )}
        style={{ marginLeft: level * 16 }}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium text-[var(--accent)]">{comment.userId}</p>
            <p className="text-sm text-[var(--text)] mt-1">{comment.text}</p>
          </div>
          {canDelete && (
            <button
              onClick={() => handleDeleteComment(comment._id)}
              className="ml-2 text-xs text-[var(--error)] hover:text-red-400"
            >
              Delete
            </button>
          )}
        </div>

        <button
          onClick={() => setShowReplyBox(!showReplyBox)}
          className="text-xs text-[var(--accent)] mt-1"
        >
          Reply
        </button>

        {showReplyBox && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="Reply…"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 rounded border border-[var(--muted)] px-2 py-1 text-sm bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
            <button
              onClick={() => {
                handleReply(comment._id, replyText);
                setReplyText("");
                setShowReplyBox(false);
              }}
              className="rounded button-primary px-2 py-1 text-sm"
            >
              Send
            </button>
          </div>
        )}

        {comment.replies?.map((r: CommentWithReplies) => (
          <CommentItem key={r._id} comment={r} level={level + 1} />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Floating button (all devices) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-full shadow-md bg-[var(--accent)] text-white"
      >
        💬 Comments
      </button>

      {/* Slide-in panel */}
      <div
        className={clsx(
          "fixed top-0 right-0 h-full w-96 max-w-full bg-[var(--bg)] border-l border-[var(--muted)] shadow-lg transition-transform duration-300 z-40 flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-2 border-b border-[var(--muted)] sticky top-0 bg-[var(--bg)]">
          <h2 className="font-semibold text-[var(--text)]">Comments</h2>
          <button onClick={() => setOpen(false)} className="text-[var(--accent)]">
            ✖
          </button>
        </div>

        {/* Comments List */}
        <div className="space-y-2 flex-1 overflow-y-auto p-2">
          {comments.map((c: CommentWithReplies) => (
            <CommentItem key={c._id} comment={c} />
          ))}
        </div>

        {/* Input */}
        <div className="p-2 border-t border-[var(--muted)] flex gap-2 sticky bottom-0 bg-[var(--bg)]">
          <input
            type="text"
            placeholder="Add a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 rounded border border-[var(--muted)] px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
          <button
            onClick={handleAddComment}
            className="rounded button-primary px-4 py-2 text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </>
  );
}