import jwt from "jsonwebtoken";
import Prisma from "./../db/prisma.js";

export default async (req, res, next) => {
  // Skip authentication for specific routes like public assets
  if (req.originalUrl.startsWith("/uploads/")) {
    console.log("[DEBUG] Skipping auth for uploads path:", req.originalUrl);
    return next();
  }

  // Skip authentication for auth routes
  if (req.originalUrl.startsWith("/auth/") && req.method === "POST") {
    return next();
  }

  try {
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

    try {
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
          data: [decoded.userId],
        });
      }

      req.user_id = decoded.userId;
      req.user = User;
      next();
    } catch (dbError) {
      // Check if it's a database connection error
      if (
        dbError.message &&
        dbError.message.includes("Can't reach database server")
      ) {
        return res.status(503).json({
          status: false,
          message: "Database connection error. Please try again later.",
          error: "service_unavailable",
        });
      }

      // Other database errors
      return res.status(500).json({
        status: false,
        message: "Internal server error during authentication.",
        error: "database_error",
      });
    }
  } catch (jwtError) {
    // Handle specific JWT errors
    if (jwtError.name === "TokenExpiredError") {
      return res.status(401).json({
        status: false,
        message: "Token expired. Please login again.",
        error: "token_expired",
      });
    }

    if (jwtError.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: false,
        message: "Invalid token. Please login again.",
        error: "invalid_token",
      });
    }

    // Generic auth error
    res.clearCookie("token");
    return res.status(401).json({
      status: false,
      message: "Authentication failed",
      error: jwtError.message,
    });
  }
};
