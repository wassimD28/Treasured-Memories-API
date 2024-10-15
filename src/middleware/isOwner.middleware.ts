import { NextFunction, Request, Response } from "express";

function isOwner(req: Request, res: Response, next: NextFunction) {
  const paramsUserId = req.params.id; // user id from the request params
  const authenticatedUserId = req.auth?.userId; // user id from the authenticated access token
  // Check if the authenticated user is the owner of the resource
  if (paramsUserId !== authenticatedUserId) {
    res
      .status(403)
      .json({ message: "You do not have permission to perform this action." });
    return;
  }
  // If the user is the owner, continue to the next middleware/controller
  next();
}

export { isOwner };