import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// --- Utility: pick a consistent color based on userId
const COLORS = ["#F87171","#60A5FA","#34D399","#FBBF24","#A78BFA","#F472B6","#FCD34D"];
function getUserColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash += userId.charCodeAt(i);
  return COLORS[hash % COLORS.length];
}

export const upsertUser = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    username: v.optional(v.string()),
    name: v.string(),
    // color removed from args
  },
  handler: async (ctx, { userId, email, username, name }) => {
    const now = Date.now();

    // --- 1. Check for existing user by email OR username
    let existing = null;
    if (email || username) {
      existing = await ctx.db
        .query("users")
        .filter((q) => {
          const conditions = [];
          if (email) conditions.push(q.eq("email", email));
          if (username) conditions.push(q.eq("username", username));
          if (conditions.length === 1) return conditions[0];
          return q.or(...conditions);
        })
        .first();
    }

    const defaultName = "Pending User";
    const color = getUserColor(userId); // generated internally

    // --- 2. Update existing placeholder
    if (existing && existing.userId.startsWith("pending_")) {
      await ctx.db.patch(existing._id, {
        userId,
        email,
        username,
        name: name || defaultName,
        color,
        updatedAt: now,
      });
      return existing._id;
    }

    // --- 3. Check real user
    const real = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (real) {
      await ctx.db.patch(real._id, { email, username, name, color, updatedAt: now });
      return real._id;
    }

    // --- 4. Insert new user
    return await ctx.db.insert("users", {
      userId,
      email,
      username,
      name: name || defaultName,
      color,
      createdAt: now,
      updatedAt: now,
    });
  },
});


// ✅ Queries for lookup
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
  },
});

// ✅ Placeholder mutation
export const insertPlaceholder = mutation({
  args: {
    userId: v.string(),
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { userId, email = "", username = "", name = "Pending User" }) => {
    const now = Date.now();

    // Generate deterministic color server-side
    const COLORS = ["#F87171","#60A5FA","#34D399","#FBBF24","#A78BFA","#F472B6","#FCD34D"];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) hash += userId.charCodeAt(i);
    const color = COLORS[hash % COLORS.length];

    return await ctx.db.insert("users", {
      userId,
      email,
      username,
      name,
      color, // ✅ add color
      createdAt: now,
      updatedAt: now,
    });
  },
});
