import { NextFunction, Request, Response } from "express";
import { DecodedToken } from "../interfaces/decodedToken.interface";

// Extend the Express Request type to include our auth property
declare global {
  namespace Express {
    interface Request {
      auth?: DecodedToken;
    }
  }
}
// Middleware for checking admin role
function checkAdminRole(req : Request, res: Response, next: NextFunction) {
  if (req.auth && req.auth.roles && req.auth.roles.includes("ROLE_ADMIN")) {
    next();
  } else {
    res.sendStatus(403);
  }
}

export {checkAdminRole};
