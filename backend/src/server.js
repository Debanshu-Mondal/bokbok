import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "../routes/auth.route.js";
import msgRoutes from "../routes/message.route.js";
import userRoute from "../routes/user.route.js";
import chat from "../routes/chats.js";
import { app, server } from "./lib/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({
    origin: process.env.CLIENT_URL || true,
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

app.use(express.static(frontendDistPath));

app.get("*", (_, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
});

server.listen(PORT, "0.0.0.0", () => {
    console.log("Server is running on port " + PORT);
});
