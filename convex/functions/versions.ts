// convex/functions/versions.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from '../_generated/dataModel'
import * as Y from "yjs";

// --- Mutation: Save a new version metadata entry ---
export const saveVersion = mutation({
  args: v.object({
    docId: v.id("documents"),
    content: v.optional(v.string()), // ✅ content is now optional
  }),
  handler: async (ctx, { docId, content }) => {
    const createdAt = Date.now();

    // Fill in empty string if content is missing
    const versionId = await ctx.db.insert("versions", {
      docId,
      content: content ?? "",
      createdAt,
    });

    return { success: true, versionId };
  },
});

// --- Query: Get all versions for a document ---
export const getVersions = query({
  args: {
    docId: v.id("documents"), // ✅ runtime validator
  },
  handler: async (ctx, { docId }: { docId: Id<"documents"> }) => {
    // Query versions using the index
    const versions = await ctx.db
      .query("versions")
      .withIndex("by_docId", (q) => q.eq("docId", docId))
      .order("desc")
      .collect();

    // Optionally, type cast for TypeScript
    return versions as {
      _id: Id<"versions">;
      docId: Id<"documents">;
      content: string;
      createdAt: number;
      _creationTime: number;
    }[];
  },
});

// Mutation to restore version
export const restoreVersion = mutation({
  args: {
    versionId: v.id("versions"), // Convex runtime validator
  },
  handler: async (ctx, { versionId }: { versionId: Id<"versions"> }) => {
    const versionRaw = await ctx.db.get(versionId);
    if (!versionRaw) throw new Error("Version not found");

    // Type assertion
    const version = versionRaw as {
      _id: Id<"versions">;
      docId: Id<"documents">;
      content: string; // if you store HTML in versions
      createdAt: number;
    };

    const docRaw = await ctx.db.get(version.docId);
    if (!docRaw) throw new Error("Document not found");

    const doc = docRaw as {
      _id: Id<"documents">;
      content: string;
      updatedAt: number;
    };

    // Patch the document with version content
    await ctx.db.patch(version.docId, {
      content: version.content, // restore HTML directly
      updatedAt: Date.now(),
    });

    return { success: true, versionId: version._id };
  },
});

// Mutation to clear all versions
// export const clearAllVersions = mutation({
//   handler: async (ctx) => {
//     const allVersions = await ctx.db.query("versions").collect();
//     for (const v of allVersions) {
//       await ctx.db.delete(v._id);
//     }
//     return { success: true, deleted: allVersions.length };
//   },
// });