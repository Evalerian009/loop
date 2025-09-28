// convex/functions/notifications.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Create a notification
 */
export const create = mutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("share"),
      v.literal("comment"),
      v.literal("collaborator_joined")
    ),
    message: v.string(),
    documentId: v.optional(v.id("documents")),
    commentId: v.optional(v.id("comments")),
    triggeredBy: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      read: false,
      createdAt: Date.now(),
    });
  },
});

/**
 * Get all notifications for a user (latest first).
 * Orders by createdAt descending.
 */
export const getForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

/**
 * Get unread notification count for a user.
 */
export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("read", false))
      .collect();
    return unread.length;
  },
});

/**
 * Mark a single notification as read.
 */
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, { read: true });
  },
});

/**
 * Mark all notifications as read for a user.
 */
export const markAllAsRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const n of notifications) {
      if (!n.read) {
        await ctx.db.patch(n._id, { read: true });
      }
    }
  },
});

/**
 * Delete a notification (only by its recipient).
 */
export const remove = mutation({
  args: { notificationId: v.id("notifications"), userId: v.string() },
  handler: async (ctx, { notificationId, userId }) => {
    const notification = await ctx.db.get(notificationId);
    if (!notification) throw new Error("Notification not found");
    if (notification.userId !== userId) throw new Error("Not authorized");
    await ctx.db.delete(notificationId);
  },
});

// Clear all notifications for a user
export const clearAll = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId)) // must match index name
      .collect();

    for (const n of notifications) {
      await ctx.db.delete(n._id);
    }

    return { cleared: notifications.length };
  },
});