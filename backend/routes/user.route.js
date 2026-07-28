import express from "express";
import prisma from "../src/lib/prisma.js";
import protectRoute from "../middleware/protectRoute.js";

const router =express.Router();
router.get("/search",protectRoute, async(req,res)=>{
    try{
        const {q} =req.query;

        if(!q){
            return res.status(400).json({
                success:false,
                message:"Search query is required"
            });
        }
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                    username: {
                    contains: q,
                    mode: "insensitive"
                    }
                },
                {
                    id: {
                    not: req.userId
                    }
                }
            ]
            },
        select: {
            id: true,
            username: true,
            profile_pic: true
        }
    });
    res.status(200).json({
            success: true,
            users
        });
    }catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get("/:id", protectRoute, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                profile_pic: true,
                bio: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;