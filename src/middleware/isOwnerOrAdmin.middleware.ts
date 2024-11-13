import { Request, Response, NextFunction } from "express";
import { ModelTypeName } from "../Enums/common.enum";
import Memory from "../models/memory.model";
import User from "../models/user.model";
import Profile from "../models/profile.model";

export const isOwnerOrAdmin = async (
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
  let entityExists: any;
  switch (entityName) {
    case ModelTypeName.MEMORY:
      Entity = Memory;
      break;
    case ModelTypeName.USER:
      Entity = User;
      break;
    case ModelTypeName.PROFILE:
      Entity = Profile;
      const user_id = entity_id;
      // find the profile using user id
      entityExists = await Profile.findOne({ where: { user_id } });
      break;
    default:
      res.status(400).json({ message: "Invalid entity type" });
      return;
  }
  // todo
  // check if the entity exists
  entityExists = entityExists ?? (await Entity.findByPk(entity_id));
  console.log('entityExists :'+ entityExists.id);
  console.log('entityExists.user_id :'+ entityExists.user_id);
  console.log("authenticatedUser id :" + req.auth?.userId);
  console.log("authenticatedUser roles :" + req.auth?.roles);
  if (!entityExists) {
    res.status(404).json({ message: `${entityName} entity not found` });
    return;
  }
  // check if the entity belongs to the authenticated user or the authenticated user is an admin
  const authenticatedUser = req.auth;
  if (
    entityExists.user_id !== authenticatedUser?.userId &&
    !authenticatedUser?.roles?.includes("ADMIN")
  ) {
    res
      .status(403)
      .json({ message: "You are not authorized to perform this action" });
    return;
  }

  // Call the next middleware or route handler
  next();
};
