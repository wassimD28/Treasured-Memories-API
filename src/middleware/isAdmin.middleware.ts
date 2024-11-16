import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../interfaces/common.interface";

// Middleware for checking if the sender (authenticated user) has admin role
function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.auth && req.auth.roles && req.auth.roles.includes("ADMIN")) {
    next();
  } else {
    const response: ApiResponse = {
      success: false,
      message: "You do not have permission to perform this action.",
    };
    res.status(403).json(response);
    return;
  }
}

export { isAdmin };
