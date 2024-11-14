import { Request, Response, NextFunction } from "express";
import { ModelTypeName } from "../Enums/common.enum";
import Memory from "../models/memory.model";
import User from "../models/user.model";
import Profile from "../models/profile.model";
import Comment from "../models/comment.model";
import Notification from "../models/notification.model";
import { ApiResponse } from "../interfaces/common.interface";

export const isOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const entityName = req.auth?.entityEeq;
  const entity_id = req.params.id;
  if (!entity_id) {
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
    case ModelTypeName.COMMENT:
      Entity = Comment;
      break;
    case ModelTypeName.NOTIFICATION:
      Entity = Notification;
      break;
    default:
      res.status(400).json({ message: "Invalid entity type" });
      return;
  }
  let userExists;
  let entityExists;
  // check if the entity type is type User
  if (entityName === ModelTypeName.USER) {
    const user_id = entity_id;
    // find the user using user id
    userExists = await User.findByPk(user_id);
    if (!userExists) {
      res.status(404).json({ message: "User not found" });
      return;
    }
  } else {
    // check if the entity exists
    entityExists = await Entity.findByPk(entity_id);
    if (!entityExists) {
      res.status(404).json({ message: `${entityName} not found` });
      return;
    }
  }
  // check if the entity belongs to the authenticated user
  const authenticatedUser_id = req.auth?.userId;
  const entityUser_id = userExists?.id ?? entityExists.user_id;
  if (entityUser_id !== authenticatedUser_id) {
    const response: ApiResponse = {
      success: false,
      message: "You are not authorized to perform this action",
    };
    res.status(403).json(response);
    return;
  }

  // Call the next middleware or route handler
  next();
};
