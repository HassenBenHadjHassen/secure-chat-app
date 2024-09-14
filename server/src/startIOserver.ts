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

    socket.on("create-room", () => {
      const roomCode = crypto.randomBytes(3).toString("hex");
      rooms[roomCode] = { users: [] };
      socket.join(roomCode);
      rooms[roomCode].users?.push(socket.id);
      io.to(roomCode).emit("room-created", roomCode);
    });

    socket.on("join-room", (roomCode: string) => {
      if (rooms[roomCode]) {
        socket.join(roomCode);
        rooms[roomCode].users?.push(socket.id);
        io.to(roomCode).emit("user-joined", socket.id);
      } else {
        socket.emit("invalid-room");
      }
    });

    socket.on("message", (roomCode: string, encryptedMessage: string) => {
      io.to(roomCode).emit("message", `${socket.id}: ${encryptedMessage}`);
    });

    socket.on("disconnect", () => {
      for (const roomCode in rooms) {
        const room = rooms[roomCode];

        if (room.users?.includes(socket.id)) {
          room.users = room.users.filter((userId) => userId !== socket.id);
          if (room.users.length === 0) {
            delete rooms[roomCode];
          }
          break;
        }
      }
    });
  });
};
