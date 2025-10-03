import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

const CLERK_API_URL = "https://api.clerk.dev/v1/users";

export const resolveUserId = action({
  args: { identifier: v.string() }, // can be email OR username
  handler: async (ctx, { identifier }): Promise<string> => {
    const secret = process.env.CLERK_SECRET_KEY;
    if (!secret) throw new Error("CLERK_SECRET_KEY not set");

    // --- 1. Try Clerk lookup
    try {
      const res = await fetch(`${CLERK_API_URL}?query=${encodeURIComponent(identifier)}`, {
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data: any[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data[0].id as string;
        }
      }
    } catch (err) {
      console.warn("Clerk lookup failed:", err);
    }

    // --- 2. Check local Convex DB
    const existingByEmail = await ctx.runQuery(api.functions.users.getByEmail, {
      email: identifier,
    });
    if (existingByEmail) return existingByEmail.userId;

    const existingByUsername = await ctx.runQuery(api.functions.users.getByUsername, {
      username: identifier,
    });
    if (existingByUsername) return existingByUsername.userId;

    // --- 3. Create placeholder
    const placeholderId = `pending_${crypto.randomUUID()}`;
    await ctx.runMutation(api.functions.users.insertPlaceholder, {
      userId: placeholderId,
      email: identifier.includes("@") ? identifier : "",
      username: identifier.includes("@") ? "" : identifier,
      name: "Pending User", // default name for frontend
    });

    return placeholderId; // return string to match return type
  },
});