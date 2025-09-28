import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // === Documents table ===
  documents: defineTable({
    title: v.string(),
    content: v.string(),
    ownerId: v.string(), // Clerk user id
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_createdAt", ["createdAt"]),

  // === Permissions table ===
  permissions: defineTable({
    documentId: v.id("documents"),
    userId: v.string(), // Clerk user id
    role: v.union(v.literal("owner"), v.literal("editor"), v.literal("viewer")),
    createdAt: v.number(),
  })
    .index("by_document", ["documentId"])
    .index("by_user", ["userId"])
    .index("by_document_user", ["documentId", "userId"]), // optional composite for fast lookups

  // === Comments table ===
  comments: defineTable({
    docId: v.id("documents"),
    userId: v.string(),
    text: v.string(),
    inlineRange: v.optional(v.object({ from: v.number(), to: v.number() })), // inline selection
    parentId: v.optional(v.id("comments")), // threaded replies
    createdAt: v.number(),
  }).index("by_docId", ["docId"]),

  // === Notifications table ===
  notifications: defineTable({
    userId: v.string(), // Clerk user id (recipient)
    type: v.union(
      v.literal("share"),
      v.literal("comment"),
      v.literal("collaborator_joined")
    ),
    message: v.string(),
    documentId: v.optional(v.id("documents")), // for share and comment notifications
    commentId: v.optional(v.id("comments")), // for comment notifications
    triggeredBy: v.string(), // userId of who triggered the notification
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]) // ✅ we’ll use this for clearAll
    .index("by_user_createdAt", ["userId", "createdAt"])
    .index("by_user_read", ["userId", "read"]),

  // === Documents versions table ===
  versions: defineTable({
    docId: v.id("documents"),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_docId", ["docId"]),

  // === Users table (for Clerk integration + placeholders) ===
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    username: v.optional(v.string()),
    name: v.string(),
    color: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_username", ["username"]),
});