const express = require("express");
const app = express();
const uuid = require("uuid").v4;
const port = process.env.PORT || 3000;

const { createServer } = require("http");
const path = require("path");
const server = createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let indexFile = path.join(__dirname, "../public/index.html");

app.use(express.static("public"));

app.get("/new", (req, res) => {
  res.json({ meetId: uuid() });
});

app.get("/:id", (req, res) => {
  res.sendFile(indexFile);
  //   res.json({ meetId: uuid() });
});

io.on("connection", (socket) => {
  console.log("connection");
  socket.on("join-room", (roomId, userId) => {
    console.log("join-room");
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      console.log("disconnect");
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

server.listen(port, () => {
  console.log("listening on *:", port);
});
