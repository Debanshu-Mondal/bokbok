import express from "express";
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";
import jwt from "jsonwebtoken";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Username, email and password are required"
            });
        }

        if (!EMAIL_RE.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({
                success: false,
                message: "Username must be between 3 and 20 characters"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        const existingUsername = await prisma.user.findUnique({ where: { username } });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: "This username is already taken"
            });
        }

        const hashed_password = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashed_password
            }
        });

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const { password: _pw, ...safeUser } = user;

        res.status(201).json({
            success: true,
            user: safeUser,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server issue, please try again"
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email"
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password"
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const { password: _pw, ...safeUser } = user;

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: safeUser,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server issue, please try again"
        });
    }
});

router.post("/logout", (req, res) => {
    // JWTs are stateless, so logging out is handled client-side by discarding
    // the token. This endpoint exists so the client has a consistent call to
    // make (and a place to hang server-side session cleanup, if ever added).
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
});

router.get("/me", protectRoute, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const { password, ...safeUser } = user;

        res.status(200).json({
            success: true,
            user: safeUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server issue, please try again"
        });
    }
});

router.put("/profile", protectRoute, async (req, res) => {
    try {
        const { username, bio, profile_pic } = req.body;

        const updateData = {};

        if (username !== undefined) updateData.username = username;
        if (bio !== undefined) updateData.bio = bio;
        if (profile_pic !== undefined) updateData.profile_pic = profile_pic;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided for update"
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                username: true,
                bio: true,
                profile_pic: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server issue, please try again"
        });
    }
});

export default router;
