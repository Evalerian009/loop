import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

// deterministic color utility
const COLORS = ["#F87171","#60A5FA","#34D399","#FBBF24","#A78BFA","#F472B6","#FCD34D"];
function getUserColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash += userId.charCodeAt(i);
  return COLORS[hash % COLORS.length];
}

export const migrateAddColor = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      if (!user.color) {
        await ctx.db.patch(user._id, { color: getUserColor(user.userId) });
      }
    }
    return { success: true, count: users.length };
  },
});
