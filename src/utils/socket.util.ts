import { Socket, Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "./auth.util";

interface CustomSocket extends Socket {
  userId?: string;
}

export let io: SocketIOServer;

const FRONTEND_PORT = 4200;
export const initializeSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || `http://localhost:${FRONTEND_PORT}`,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket"],
  });

  // Middleware to authenticate socket connections
  io.use(async (socket: CustomSocket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        console.log("No token provided in socket connection");
        return next(new Error("Authentication token required"));
      }

      try {
        const decoded = verifyToken(token);
        if (!decoded) {
          console.log("Invalid token in socket connection");
          return next(new Error("Invalid authentication token"));
        }

        socket.userId = decoded.userId;
        console.log(`Socket authenticated for user: ${socket.userId}`);
        next();
      } catch (tokenError) {
        console.error("Token verification failed:", tokenError);
        return next(new Error("Token verification failed"));
      }
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket: CustomSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join a personal room for private notifications
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      console.log(`User ${socket.userId} joined their personal room`);
    }

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

// Utility function to emit notifications
export const emitNotification = (userId: number, notification: any) => {
  if (io) {
    io.to(`user:${userId}`).emit("notification", notification);
  }
};
