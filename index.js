const express = require("express");
const { createServer, ClientRequest } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("chat message", (msg) => {
    // console.log("Message: " + msg);
    io.emit("chat message", msg);
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

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
