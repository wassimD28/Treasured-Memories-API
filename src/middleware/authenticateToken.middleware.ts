import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { DecodedToken } from "../interfaces/decodedToken.interface";


// Extend the Express Request type to include our auth property
declare global {
  namespace Express {
    interface Request {
      auth?: DecodedToken;
    }
  }
}

// Middleware for verifying JWT token
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from 'Bearer <token>'
  // No token provided
  if (!token) {
    res.status(401).json({ message: "Access token missing" })
    return
  }; 
  
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid or expired access token" });
    
    // Attach the decoded payload (user info) to req.auth
    req.auth = decoded as DecodedToken;
    next();
  });
}

export { authenticateToken };