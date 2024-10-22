import { Router } from "express";
import {
  deleteUserController,
  getUserByIdController,
} from "../controllers/user.controller";
import { authenticateToken } from "../middleware/authenticateToken.middleware";
import { isOwnerOrAdmin } from "../middleware/isOwnerOrAdmin.middleware";

const route = Router();

// get user by id
route.get("/:id", authenticateToken, getUserByIdController);

// delete user
route.delete("/:id", authenticateToken, isOwnerOrAdmin, deleteUserController);

export { route };
