import { Request, Response, NextFunction } from "express";
import { ModelTypeName } from "../Enums/common.enum";

export const setEntityRequest = (entity: ModelTypeName) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!entity) {
      res.status(400).json({ message: "Invalid entity type" });
      return;
    }
    if (!req.auth) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }
    req.auth.entityEeq = entity;
    next();
  };
};
