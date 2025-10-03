// convex/functions/documents/updateTitle.ts
import { mutation } from "../_generated/server";;
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const updateTitle = mutation({
  args: {
    id: v.id("documents"),
    title: v.string(),
  },
  handler: async (ctx, { id, title }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Document not found");
    if (doc.ownerId !== userId) throw new Error("Only the owner can rename this document");

    await ctx.db.patch(id, {
      title,
      updatedAt: Date.now(),
    });
  },
});
