import "dotenv/config";
import { Server } from "@hocuspocus/server";
import { SQLite } from "@hocuspocus/extension-sqlite";
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js"; // ✅ use generated API

// Convex setup
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in environment");
}
const convex = new ConvexHttpClient(convexUrl);

// Debounce helper
function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Debounced Convex touch
const debouncedTouch = debounce(async (id) => {
  try {
    // ✅ Use generated API object instead of string
    await convex.mutation(api.functions.documents.touch, { id });
    console.log(`[Hocuspocus] Updated "updatedAt" for doc ${id}`);
  } catch (err) {
    console.error("Failed to update updatedAt:", err);
  }
}, 2000);

// Hocuspocus server
const server = new Server({
  port: 1234,
  extensions: [new SQLite({ database: "./db.sqlite" })],

  onChange: async ({ documentName }) => {
    debouncedTouch(documentName);
  },

  onConnect: () => console.log("[Hocuspocus] Client connected"),
  onDisconnect: () => console.log("[Hocuspocus] Client disconnected"),
});

server.listen();
console.log("Hocuspocus server running at ws://localhost:1234");