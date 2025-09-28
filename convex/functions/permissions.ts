// convex/functions/permissions.ts
import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export type Role = "owner" | "editor" | "viewer";

/**
 * List all permissions for a given document.
 * Includes both the permission and minimal user info (if available).
 */
export const listForDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }: { documentId: Id<"documents"> }) => {
    const permissions = await ctx.db
      .query("permissions")
      .withIndex("by_document", (q) => q.eq("documentId", documentId))
      .collect();

    return Promise.all(
      permissions.map(async (perm) => {
        const userRecord = await ctx.db
          .query("users")
          .withIndex("by_userId", (q) => q.eq("userId", perm.userId))
          .first();

        return {
          ...perm,
          user: userRecord
            ? {
                id: userRecord.userId,
                email: userRecord.email,
                name: userRecord.name,
              }
            : { id: perm.userId }, // fallback if not found
        };
      })
    );
  },
});

/**
 * Grant a role to a user.
 */
export const grant = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("editor"), v.literal("viewer")),
    triggeredBy: v.string(),
  },
  handler: async (
    ctx,
    { documentId, userId, role, triggeredBy }
  ) => {
    const now = Date.now();

    // 1. Ensure user exists in "users" table
    let userRecord = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!userRecord) {
      const now = Date.now();
      // deterministic color for unknown user
      const COLORS = ["#F87171","#60A5FA","#34D399","#FBBF24","#A78BFA","#F472B6","#FCD34D"];
      function getUserColor(userId: string) {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) hash += userId.charCodeAt(i);
        return COLORS[hash % COLORS.length];
      }

      const insertedId = await ctx.db.insert("users", {
        userId,
        email: "unknown",
        username: undefined,
        name: "Unknown User",
        color: getUserColor(userId),
        createdAt: now,
        updatedAt: now,
      });
      userRecord = await ctx.db.get(insertedId);
    }

    // 2. Check if permission already exists
    const existing = await ctx.db
      .query("permissions")
      .withIndex("by_document", (q) => q.eq("documentId", documentId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existing) {
      if (existing.role !== role) {
        await ctx.db.patch(existing._id, { role });
        return existing._id;
      }
      throw new Error("User already has this role for the document");
    }

    // 3. Insert new permission
    const permissionId = await ctx.db.insert("permissions", {
      documentId,
      userId,
      role,
      createdAt: now,
    });

    // 4. Get document for notification
    const document = await ctx.db.get(documentId);
    if (!document) throw new Error("Document not found");

    // 5. Create notification
    await ctx.db.insert("notifications", {
      userId,
      type: "share",
      message: `${triggeredBy} shared "${document.title}" with you as ${role}`,
      documentId,
      triggeredBy,
      read: false,
      createdAt: now,
    });

    return permissionId;
  },
});

/**
 * Revoke a role from a user.
 */
export const revoke = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.string(),
  },
  handler: async (
    ctx,
    { documentId, userId }: { documentId: Id<"documents">; userId: string }
  ) => {
    const existing = await ctx.db
      .query("permissions")
      .withIndex("by_document", (q) => q.eq("documentId", documentId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }
    return false;
  },
});

/**
 * Get the current user's role for a document.
 */
export const getMyRole = query({
  args: {
    documentId: v.id("documents"),
    userId: v.string(),
  },
  handler: async (
    ctx,
    { documentId, userId }: { documentId: Id<"documents">; userId: string }
  ): Promise<Role | null> => {
    const doc = await ctx.db.get(documentId);
    if (doc && doc.ownerId === userId) return "owner";

    const perm = await ctx.db
      .query("permissions")
      .withIndex("by_document", (q) => q.eq("documentId", documentId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    return perm?.role ?? null;
  },
});

export const listWithUsers = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const perms = await ctx.db
      .query("permissions")
      .withIndex("by_document", (q) => q.eq("documentId", documentId))
      .collect();

    const results = [];
    for (const p of perms) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", p.userId))
        .first();

      results.push({
        ...p,
        email: user?.email ?? "(unknown)",
        name: user?.name ?? "",
      });
    }

    return results;
  },
});