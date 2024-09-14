"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startIOserver = void 0;
const socket_io_1 = __importDefault(require("socket.io"));
const crypto_1 = __importDefault(require("crypto"));
const startIOserver = (server) => {
    const io = new socket_io_1.default.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    const rooms = {};
    io.on("connection", (socket) => {
        console.log("A User has connected", socket.id);
        socket.on("create-room", () => {
            var _a;
            const roomCode = crypto_1.default.randomBytes(3).toString("hex");
            rooms[roomCode] = { users: [] };
            socket.join(roomCode);
            (_a = rooms[roomCode].users) === null || _a === void 0 ? void 0 : _a.push(socket.id);
            io.to(roomCode).emit("room-created", roomCode);
        });
        socket.on("join-room", (roomCode) => {
            var _a;
            if (rooms[roomCode]) {
                socket.join(roomCode);
                (_a = rooms[roomCode].users) === null || _a === void 0 ? void 0 : _a.push(socket.id);
                io.to(roomCode).emit("user-joined", socket.id);
            }
            else {
                socket.emit("invalid-room");
            }
        });
        socket.on("message", (roomCode, encryptedMessage) => {
            io.to(roomCode).emit("message", `${socket.id}: ${encryptedMessage}`);
        });
        socket.on("disconnect", () => {
            var _a;
            for (const roomCode in rooms) {
                const room = rooms[roomCode];
                if ((_a = room.users) === null || _a === void 0 ? void 0 : _a.includes(socket.id)) {
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
exports.startIOserver = startIOserver;
