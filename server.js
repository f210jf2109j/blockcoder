const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

// Serve public folder
app.use(express.static(path.join(__dirname, "public")));

// Force homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const rooms = new Map();

io.on("connection", (socket) => {

  socket.on("host-room", ({ room, offer }) => {
    if (!room || !offer) return;

    const code = String(room).trim().toUpperCase();

    rooms.set(code, {
      host: socket.id,
      offer
    });

    socket.join(code);

    socket.emit("room-ready", {
      room: code
    });
  });

  socket.on("join-room", ({ room }) => {

    const code = String(room || "").trim().toUpperCase();

    const data = rooms.get(code);

    if (!data) {
      socket.emit(
        "room-error",
        "Room not found. Check the code or have the host create a new room."
      );
      return;
    }

    socket.join(code);

    socket.emit("offer", {
      room: code,
      offer: data.offer
    });
  });

  socket.on("answer", ({ room, answer }) => {
    const code = String(room || "").trim().toUpperCase();

    socket.to(code).emit("answer", {
      answer
    });
  });

  socket.on("ice-candidate", ({ room, candidate }) => {
    const code = String(room || "").trim().toUpperCase();

    socket.to(code).emit("ice-candidate", {
      candidate
    });
  });

  socket.on("leave-room", ({ room }) => {
    const code = String(room || "").trim().toUpperCase();

    socket.to(code).emit("peer-left");

    socket.leave(code);
  });

  socket.on("disconnect", () => {

    for (const [code, data] of rooms.entries()) {

      if (data.host === socket.id) {

        socket.to(code).emit("peer-left");

        rooms.delete(code);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Voxel PVP Multiplayer server running on port " + PORT);
});
