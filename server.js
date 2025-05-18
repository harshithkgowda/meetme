
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {}; // roomId => [socketIds]

io.on("connection", socket => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userId = userId;

    if (!rooms[roomId]) rooms[roomId] = [];
    if (!rooms[roomId].includes(userId)) rooms[roomId].push(userId);

    const otherUsers = rooms[roomId].filter(id => id !== userId);
    socket.emit("users-in-room", otherUsers);

    socket.to(roomId).emit("user-joined", userId);

    socket.on("offer", ({ to, offer }) => {
      socket.to(to).emit("offer", { from: userId, offer });
    });

    socket.on("answer", ({ to, answer }) => {
      socket.to(to).emit("answer", { from: userId, answer });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
      socket.to(to).emit("ice-candidate", { from: userId, candidate });
    });

    socket.on("disconnect", () => {
      const index = rooms[roomId]?.indexOf(userId);
      if (index > -1) rooms[roomId].splice(index, 1);
      socket.to(roomId).emit("user-left", userId);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
});
  