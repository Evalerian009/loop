import "dotenv/config";
import { Server } from "@hocuspocus/server";
import { SQLite } from "@hocuspocus/extension-sqlite";

const server = new Server({
  port: process.env.PORT || 4000, // Railway sets PORT automatically
  extensions: [new SQLite({ database: "./db.sqlite" })],

  onConnect: () => console.log("[Hocuspocus] Client connected"),
  onDisconnect: () => console.log("[Hocuspocus] Client disconnected"),
});

server.listen();
console.log(`Hocuspocus server running on port ${process.env.PORT || 4000}`);
