import { Request, Response, NextFunction } from "express";
import { ModelTypeName } from "../Enums/common.enum";
import Memory from "../models/memory.model";
import User from "../models/user.model";
import Profile from "../models/profile.model";

export const isOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const entityName: string = req.body.entity ?? req.auth?.entityEeq;
  const entity_id = req.params.id
  if (!entity_id){
    res.status(400).json({ message: "Invalid entity id" });
    return;
  }
  let Entity: any;
  switch (entityName) {
    case ModelTypeName.MEMORY:
      Entity = Memory;
      break;
    case ModelTypeName.USER:
      Entity = User;
      break;
    case ModelTypeName.PROFILE:
      Entity = Profile;
      break;
    default:
      res.status(400).json({ message: "Invalid entity type" });
      return;
  }
  // check if the entity exists
  const entityExists = await Entity.findByPk(entity_id)
  if (!entityExists) {
    res.status(404).json({ message: `${entityName} not found` });
    return;
  }
  // check if the entity belongs to the authenticated user
  const user_id = req.auth?.userId;
  if (entityExists.user_id!== user_id) {
    res.status(403).json({ message: "You are not authorized to perform this action" });
    return;
  }

  // Call the next middleware or route handler
  next()
};
