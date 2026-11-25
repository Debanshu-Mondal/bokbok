import jwt from "jsonwebtoken";

const protectRoute = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "No token provided"
        });
    }
    console.log("Authorization header:", req.headers.authorization);
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "bokbok-dev-secret"
        );

        req.userId = decoded.userId;

        next();
    } catch(error){
        console.log(error);
        return res.status(401).json({
        success:false,
        message:"Invalid token"
        });
    }
};

export default protectRoute;