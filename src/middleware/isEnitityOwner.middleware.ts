import { Request, Response, NextFunction } from "express";
import { ModelTypeName } from "../Enums/common.enum";
import Memory from "../models/memory.model";
import User from "../models/user.model";
import { Model } from "sequelize";

export const isEntityOwner = async (
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
    default:
      res.status(400).json({ message: "Invalid entity type" });
      console.log("_____\n\nthe entity is : "+entityName)
      return;
  }
  // check if the entity exists
  const entityExists = await Entity.findByPk(entity_id)
  if (!entityExists) {
    res.status(404).json({ message: "Entity not found" });
    return;
  }
  // check if the entity belongs to the authenticated user
  const userId = req.auth?.userId;
  if (entityExists.user_id!== userId) {
    res.status(403).json({ message: "You are not authorized to perform this action" });
    return;
  }

  // Call the next middleware or route handler
  next()
};
