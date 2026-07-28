import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import authRoutes from "../routes/auth.route.js";
import msgRoutes from "../routes/message.route.js";
import userRoute from "../routes/user.route.js";
import chat from "../routes/chats.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const dir_name = path.resolve();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

app.get("/api/health", (_, res) => {
    res.status(200).json({ success: true, status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", msgRoutes);
app.use("/api/users", userRoute);
app.use("/api/chats", chat);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(dir_name, "../frontend/dist")));

    app.get("*", (_, res) => {
        res.sendFile(path.join(dir_name, "../frontend/dist/index.html"));
    });
}

server.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});
