import jwt from "jsonwebtoken";
import Prisma from "./../db/prisma.js";
export default async (req, res, next) => {
  try {
    if (req.originalUrl.startsWith("/uploads/")) return next();

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(403).json({
        status: false,
        message: "No token provided!",
        data: [],
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({
        status: false,
        message: "Invalid token format!",
        data: [],
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const User = await Prisma.user.findUnique({
      where: {
        id: decoded.userId, // Ensure 'userId' matches your JWT payload key
      },
      include: {
        organization: true, // Include user roles
      },
    });

    if (!User) {
      return res.status(404).json({
        status: false,
        message: "User Not found.",
        data: [decoded.id],
      });
    }

    req.user_id = decoded.userId;
    req.user = User;
    next();
  } catch (err) {
    console.error("JWT Error:", err);
    res.clearCookie("token");
    res.status(401).json({
      status: false,
      message: "Invalid access token",
      data: err.message,
    });
  }
};
