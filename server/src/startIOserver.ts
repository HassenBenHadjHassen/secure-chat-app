import socketIo from "socket.io";
import http from "http";
import crypto from "crypto";

export const startIOserver = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  const io = new socketIo.Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  const rooms: { [key: string]: Room } = {};

  io.on("connection", (socket) => {
    console.log("A User has connected", socket.id);

    let currentUsername: string | null = null;

    socket.on("set-username", (username: string) => {
      currentUsername = username;
      socket.emit("username-set", username);
    });

    socket.on("create-room", () => {
      const roomCode = Math.floor(100000 + Math.random() * 900000).toString();;
      rooms[roomCode] = { users: [] };
      socket.join(roomCode);
      if (currentUsername) {
        rooms[roomCode].users.push({
          id: socket.id,
          username: currentUsername,
        });
      } else {
        rooms[roomCode].users.push({ id: socket.id, username: "Anonymous" });
      }
      io.to(roomCode).emit("room-created", roomCode);
    });

    socket.on("join-room", (roomCode: string) => {
      if (rooms[roomCode]) {
        socket.join(roomCode);
        const username = currentUsername || "Anonymous";
        rooms[roomCode].users.push({ id: socket.id, username });
        io.to(roomCode).emit("user-joined", username);
      } else {
        socket.emit("invalid-room");
      }
    });

    socket.on("message", (roomCode: string, encryptedMessage: string) => {
      const user = rooms[roomCode]?.users.find((user) => user.id === socket.id);
      const username = user ? user.username : "Unknown";
      io.to(roomCode).emit("message", `${username}: ${encryptedMessage}`);
    });

    socket.on("disconnect", () => {
      for (const roomCode in rooms) {
        const room = rooms[roomCode];

        if (room.users.some((user) => user.id === socket.id)) {
          room.users = room.users.filter((user) => user.id !== socket.id);
          if (room.users.length === 0) {
            delete rooms[roomCode];
          }
          break;
        }
      }
    });
  });
};
