// convex/functions/comments.ts

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Create a comment
export const create = mutation({
  args: {
    docId: v.id("documents"),
    userId: v.string(),
    text: v.string(),
    inlineRange: v.optional(v.object({ from: v.number(), to: v.number() })),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Insert the comment
    const commentId = await ctx.db.insert("comments", {
      ...args,
      createdAt: now,
    });

    // Get document to find all users who should be notified
    const document = await ctx.db.get(args.docId);
    if (!document) throw new Error("Document not found");

    // Get all users with access to this document (owner + permissions)
    const usersToNotify = new Set<string>();

    // Add document owner
    usersToNotify.add(document.ownerId);

    // Add users with permissions
    const permissions = await ctx.db
      .query("permissions")
      .withIndex("by_document", (q) => q.eq("documentId", args.docId))
      .collect();

    for (const perm of permissions) {
      usersToNotify.add(perm.userId);
    }

    // Create notifications for all users except the commenter
    for (const notifyUserId of usersToNotify) {
      if (notifyUserId !== args.userId) {
        await ctx.db.insert("notifications", {
          userId: notifyUserId,
          type: "comment",
          message: `${args.userId} commented on "${document.title}"`,
          documentId: args.docId,
          commentId,
          triggeredBy: args.userId,
          read: false,
          createdAt: now,
        });
      }
    }

    return commentId;
  },
});

// Get all comments for a document
export const getForDocument = query({
  args: { docId: v.id("documents") },
  handler: async (ctx, { docId }) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_docId", (q) => q.eq("docId", docId))
      .order("asc")
      .collect();

    // Group by parentId
    const byParent: Record<string, any[]> = {};
    for (const c of comments) {
      const parent = c.parentId ?? "root";
      if (!byParent[parent]) byParent[parent] = [];
      byParent[parent].push({ ...c, replies: [] });
    }

    // Recursively attach children
    function buildTree(parentId: string | null): any[] {
      const key = parentId ?? "root";
      const nodes = byParent[key] || [];
      for (const node of nodes) {
        node.replies = buildTree(node._id);
      }
      return nodes;
    }

    return buildTree(null);
  },
});

// Delete a comment (author OR document owner can delete)
export const remove = mutation({
  args: { commentId: v.id("comments"), userId: v.string() },
  handler: async (ctx, { commentId, userId }) => {
    const comment = await ctx.db.get(commentId);
    if (!comment) throw new Error("Comment not found");

    const document = await ctx.db.get(comment.docId);
    if (!document) throw new Error("Document not found");

    const isAuthor = comment.userId === userId;
    const isOwner = document.ownerId === userId;

    if (!isAuthor && !isOwner) {
      throw new Error("Not authorized to delete this comment");
    }

    await ctx.db.delete(commentId);
    return true;
  },
});