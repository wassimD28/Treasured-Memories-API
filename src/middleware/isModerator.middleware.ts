import { NextFunction, Request, Response } from "express";

// Middleware for checking if the sender (authenticated user) has moderator role
function isModerator(req: Request, res: Response, next: NextFunction) {
  if (req.auth && req.auth.roles && req.auth.roles.includes("MODERATOR")) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "You do not have permission to perform this action." });
    return;
  }
}

export { isModerator };