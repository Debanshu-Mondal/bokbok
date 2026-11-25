import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || true,
        credentials: true
    }
});

// Maps userId -> socketId for currently connected users
const userSocketMap = {};

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

// Authenticate every socket connection using the same JWT issued at login
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Authentication error: no token provided"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "bokbok-dev-secret");
        socket.userId = decoded.userId;
        next();
    } catch (error) {
        next(new Error("Authentication error: invalid token"));
    }
});

io.on("connection", (socket) => {
    console.log("Socket connected, userId:", socket.userId);

    if (socket.userId) {
        userSocketMap[socket.userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("Socket disconnected, userId:", socket.userId);
        delete userSocketMap[socket.userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, server, io };
