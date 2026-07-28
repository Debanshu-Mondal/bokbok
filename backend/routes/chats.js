import express from "express";
import prisma from "../src/lib/prisma.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, async (req, res) => {
    try {

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { sender_id: req.userId },
                    { receiver_id: req.userId }
                ]
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const chatMap = new Map();

        for (const msg of messages) {

            const otherUserId =
                msg.sender_id === req.userId
                    ? msg.receiver_id
                    : msg.sender_id;

            if (!chatMap.has(otherUserId)) {

                chatMap.set(otherUserId, {
                    userId: otherUserId,
                    lastMessage: msg.message,
                    lastMessageTime: msg.createdAt
                });
            }
        }

        const chats = await Promise.all(
            [...chatMap.values()].map(async (chat) => {

                const user = await prisma.user.findUnique({
                    where: {
                        id: chat.userId
                    },
                    select: {
                        id: true,
                        username: true,
                        profile_pic: true
                    }
                });

                const unreadCount = await prisma.message.count({
                    where: {
                        sender_id: chat.userId,
                        receiver_id: req.userId,
                        isRead: false
                    }
                });

                return {
                    ...chat,
                    username: user.username,
                    profile_pic: user.profile_pic,
                    unreadCount
                };
            })
        );

        return res.status(200).json({
            success: true,
            chats
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