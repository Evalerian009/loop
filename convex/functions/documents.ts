// convex/functions/documents.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// --- List documents owned by user ---
// export const list = query({
//   args: { userId: v.string() },
//   handler: async (ctx, { userId }) => {
//     return await ctx.db
//       .query("documents")
//       .withIndex("by_owner", q => q.eq("ownerId", userId))
//       .collect();
//   },
// });

export const listDocuments = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    // 1. Owned documents
    const ownedDocs = await ctx.db
      .query("documents")
      .withIndex("by_owner", q => q.eq("ownerId", userId))
      .collect();

    const ownedWithRole = ownedDocs.map(doc => ({
      ...doc,
      role: "owner" as const,
    }));

    // 2. Shared documents (via permissions)
    const permissions = await ctx.db
      .query("permissions")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();

    const sharedDocs: any[] = [];
    for (const perm of permissions) {
      const doc = await ctx.db.get(perm.documentId);
      if (doc) {
        sharedDocs.push({
          ...doc,
          role: perm.role, // editor/viewer/owner
        });
      }
    }

    // 3. Merge + sort (newest first)
    const allDocs = [...ownedWithRole, ...sharedDocs].sort(
      (a, b) => b.updatedAt - a.updatedAt
    );

    return allDocs;
  },
});

// --- Create a new document (metadata only, content handled by Hocuspocus) ---
export const create = mutation({
  args: { title: v.string(), userId: v.string() },
  handler: async (ctx, { title, userId }) => {
    const now = Date.now();
    return await ctx.db.insert("documents", {
      title,
      content: "", // required field
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// --- Get a document by id ---
// export const get = query({
//   args: { id: v.id("documents") },
//   handler: async (ctx, { id }) => {
//     return await ctx.db.get(id);
//   },
// });

// --- Remove document (owner or editor permission required) ---
export const remove = mutation({
  args: { id: v.id("documents"), userId: v.string() },
  handler: async (ctx, { id, userId }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Document not found");

    if (doc.ownerId === userId) {
      await ctx.db.delete(id);
      return;
    }

    const perm = await ctx.db
      .query("permissions")
      .withIndex("by_document", q => q.eq("documentId", id))
      .filter(q => q.eq(q.field("userId"), userId))
      .first();

    if (perm?.role === "owner" || perm?.role === "editor") {
      await ctx.db.delete(id);
      return;
    }

    throw new Error("No permission to delete document");
  },
});

// --- Update only the document title ---
export const updateTitle = mutation({
  args: { id: v.id("documents"), title: v.string(), userId: v.string() },
  handler: async (ctx, { id, title, userId }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Document not found");

    // Owner or owner-permission required to rename
    if (doc.ownerId !== userId) {
      const perm = await ctx.db
        .query("permissions")
        .withIndex("by_document", q => q.eq("documentId", id))
        .filter(q => q.eq(q.field("userId"), userId))
        .first();

      if (perm?.role !== "owner") {
        throw new Error("No permission to rename document");
      }
    }

    await ctx.db.patch(id, { title, updatedAt: Date.now() });
  },
});

// --- Get document metadata only (no content, handled by Hocuspocus) ---
export const get = query({
  args: { id: v.id("documents"), userId: v.string() },
  handler: async (ctx, { id, userId }) => {
    const doc = await ctx.db.get(id);
    if (!doc) return null;

    // owner can always view
    if (doc.ownerId === userId) {
      // include updatedAt + createdAt
      const { _id, title, ownerId, createdAt, updatedAt } = doc;
      return { _id, title, ownerId, createdAt, updatedAt };
    }

    // check permissions
    const perm = await ctx.db
      .query("permissions")
      .withIndex("by_document", q => q.eq("documentId", id))
      .filter(q => q.eq(q.field("userId"), userId))
      .first();

    if (perm?.role) {
      const { _id, title, ownerId, createdAt, updatedAt } = doc;
      return { _id, title, ownerId, createdAt, updatedAt };
    }

    return null;
  },
});

// --- Track collaborator access (notifications) ---
export const trackAccess = mutation({
  args: { id: v.id("documents"), userId: v.string() },
  handler: async (ctx, { id, userId }) => {
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Document not found");

    if (doc.ownerId === userId) return;

    const perm = await ctx.db
      .query("permissions")
      .withIndex("by_document", q => q.eq("documentId", id))
      .filter(q => q.eq(q.field("userId"), userId))
      .first();

    if (!perm?.role) return;

    const usersToNotify = new Set<string>();
    usersToNotify.add(doc.ownerId);

    const permissions = await ctx.db
      .query("permissions")
      .withIndex("by_document", q => q.eq("documentId", id))
      .collect();

    for (const p of permissions) {
      if (p.userId !== userId) {
        usersToNotify.add(p.userId);
      }
    }

    const now = Date.now();
    for (const notifyUserId of usersToNotify) {
      await ctx.db.insert("notifications", {
        userId: notifyUserId,
        type: "collaborator_joined",
        message: `${userId} joined "${doc.title}"`,
        documentId: id,
        triggeredBy: userId,
        read: false,
        createdAt: now,
      });
    }
  },
});

export const clearAllDocuments = mutation({
  handler: async (ctx) => {
    // Delete all versions
    const allVersions = await ctx.db.query("versions").collect();
    for (const v of allVersions) {
      await ctx.db.delete(v._id);
    }

    // Delete all documents
    const allDocs = await ctx.db.query("documents").collect();
    for (const doc of allDocs) {
      await ctx.db.delete(doc._id);
    }

    return {
      success: true,
      deletedDocuments: allDocs.length,
      deletedVersions: allVersions.length,
    };
  },
});

export const touch = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { updatedAt: Date.now() });
  },
});