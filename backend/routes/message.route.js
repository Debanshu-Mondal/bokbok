import express from "express";
import prisma from "../src/lib/prisma.js";
import protectRoute from "../middleware/protectRoute.js";
import { io, getReceiverSocketId } from "../src/lib/socket.js";

const router=express.Router();

router.post("/", protectRoute, async (req, res) => {
    try {
        const { receiver_id, message } = req.body;

        if (!receiver_id || !message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "receiver_id and message are required"
            });
        }

        const receiverId = parseInt(receiver_id);

        if (receiverId === req.userId) {
            return res.status(400).json({
                success: false,
                message: "You cannot message yourself"
            });
        }

        const receiver = await prisma.user.findUnique({
            where: {
                id: receiverId
            }
        });

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found"
            });
        }

        const newMessage = await prisma.message.create({
            data: {
                sender_id: req.userId,
                receiver_id: receiverId,
                message: message.trim()
            }
        });

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(201).json({
            success: true,
            message: "Message sent",
            data: newMessage
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get("/:userId", protectRoute, async (req, res) => {
    try {
        const otherUserId = parseInt(req.params.userId);

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    {
                        sender_id: req.userId,
                        receiver_id: otherUserId
                    },
                    {
                        sender_id: otherUserId,
                        receiver_id: req.userId
                    }
                ]
            },
            orderBy: {
                createdAt: "asc"
            }
        });
        await prisma.message.updateMany({
            where: {
                sender_id: otherUserId,
                receiver_id: req.userId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });
        return res.status(200).json({
            success: true,
            messages
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;