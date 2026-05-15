const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const rooms = new Map();

io.on("connection", (socket) => {

  console.log("Socket connected:", socket.id);

  socket.on("host-room", ({ room, offer }) => {

    if (!room || !offer) {
      console.log("Invalid host-room request");
      return;
    }

    const code = String(room).trim().toUpperCase();

    rooms.set(code, {
      host: socket.id,
      offer,
      hostCandidates: [],
      guestCandidates: []
    });

    socket.join(code);

    console.log("Room hosted:", code);

    socket.emit("room-ready", {
      room: code
    });
  });

  socket.on("join-room", ({ room }) => {

    const code = String(room || "").trim().toUpperCase();

    const data = rooms.get(code);

    if (!data) {

      console.log("Room not found:", code);

      socket.emit(
        "room-error",
        "Room not found. Check the code."
      );

      return;
    }

    socket.join(code);

    console.log("Peer joined room:", code);

    socket.emit("offer", {
      room: code,
      offer: data.offer
    });

    for (const candidate of data.hostCandidates) {

      socket.emit("ice-candidate", {
        candidate
      });
    }
  });

  socket.on("answer", ({ room, answer }) => {

    const code = String(room || "").trim().toUpperCase();

    console.log("Answer received:", code);

    socket.to(code).emit("answer", {
      answer
    });
  });

  socket.on("ice-candidate", ({ room, candidate }) => {

    const code = String(room || "").trim().toUpperCase();

    const data = rooms.get(code);

    if (!data) return;

    if (socket.id === data.host) {

      data.hostCandidates.push(candidate);

      console.log("Stored HOST candidate:", code);

    } else {

      data.guestCandidates.push(candidate);

      console.log("Stored GUEST candidate:", code);
    }

    socket.to(code).emit("ice-candidate", {
      candidate
    });
  });

  socket.on("leave-room", ({ room }) => {

    const code = String(room || "").trim().toUpperCase();

    console.log("Peer left:", code);

    socket.to(code).emit("peer-left");

    socket.leave(code);
  });

  socket.on("disconnect", () => {

    console.log("Socket disconnected:", socket.id);

    for (const [code, data] of rooms.entries()) {

      if (data.host === socket.id) {

        console.log("Removing room:", code);

        socket.to(code).emit("peer-left");

        rooms.delete(code);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {

  console.log("====================================");
  console.log("Voxel Multiplayer Server Running");
  console.log("Port:", PORT);
  console.log("====================================");
});