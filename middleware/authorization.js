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
    console.log("[DEBUG] Skipping auth for auth POST path:", req.originalUrl);
    return next();
  }

  // Debug the exact route being processed
  console.log("[DEBUG AUTH] Processing route:", req.method, req.originalUrl);

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("[DEBUG AUTH] No authorization header found");
      return res.status(403).json({
        status: false,
        message: "No token provided!",
        data: [],
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("[DEBUG AUTH] Invalid token format in header:", authHeader);
      return res.status(403).json({
        status: false,
        message: "Invalid token format!",
        data: [],
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[DEBUG AUTH] Decoded token user ID:", decoded.userId);

    try {
      const User = await Prisma.user.findFirst({
        where: {
          id: decoded.userId, // Ensure 'userId' matches your JWT payload key
        },
        include: {
          organization: true, // Include user roles
        },
      });

      if (!User) {
        console.log("[DEBUG AUTH] User not found for ID:", decoded.userId);
        return res.status(404).json({
          status: false,
          message: "User Not found.",
          data: [decoded.userId],
        });
      }

      // Debug user information
      console.log("[DEBUG AUTH] User found:", User.id, User.fullName);
      console.log("[DEBUG AUTH] Organization ID:", User.organization?.id);

      req.user_id = decoded.userId;
      req.user = User;
      next();
    } catch (dbError) {
      console.error("[ERROR AUTH] Database Error in auth middleware:", dbError);
      
      // Check if it's a database connection error
      if (dbError.message && dbError.message.includes("Can't reach database server")) {
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
    console.error("[ERROR AUTH] JWT Error:", jwtError);
    
    // Handle specific JWT errors
    if (jwtError.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: false,
        message: "Token expired. Please login again.",
        error: "token_expired",
      });
    }
    
    if (jwtError.name === 'JsonWebTokenError') {
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
