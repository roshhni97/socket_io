const express = require("express");
const { createServer, ClientRequest } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function main() {
  const db = await open({ filename: "chat.db", driver: sqlite3.Database });

  await db.exec(`CREATE TABLE IF NOT EXISTS chat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_offset TEXT UNIQUE,
    content TEXT
    );
  `);

  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: {},
  });

  app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "index.html"));
  });

  io.on("connection", async (socket) => {
    console.log("a user connected");
    socket.on("chat message", async (msg) => {
      // console.log("Message: " + msg);
      let result;
      try {
        result = await db.run("INSERT INTO chat (content) VALUES (?)", msg);
        console.log(result);
      } catch {
        return;
      }
      console.log(result);
      io.emit("chat message", msg, result.lastID);
    });
    if (!socket.recovered) {
      console.log("Recovering chat history");
      try {
        await db.each(
          `SELECT id, content FROM chat WHERE id > ?`,
          [socket.handshake.auth.serverOffset || 0],
          (_err, row) => {
            console.log(row.content);
            socket.emit("chat message", row.content, row.id);
          }
        );
      } catch (e) {
        console.error(e);
      }
    }
  });

  server.listen(3000, () => {
    console.log("server running at http://localhost:3000");
  });
}
main();

// Common APIs
// - Basic emit
// Client
//   - To send socket.emit
//   - To receive socket.on

// Server
//   - To receive io.on -> socket.on
//   - To send io.on -> socket.emit

// Acknowledgement
// Catch-all listerner

// Server APIs

// broadcasting - io.emit
// rooms - io.on
//   -socket.join
//   - io.to
//   - io.expect
//   - socket.leave

// CLient Delivery
//   - Buffered
//   - At least once
//   - Exactly once
