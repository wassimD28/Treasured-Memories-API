import { Router } from "express";
import {
  deleteUserController,
  findUsersByUsernameController,
  getUserByIdController,
} from "../controllers/user.controller";
import { authenticateToken } from "../middleware/authenticateToken.middleware";
import { isOwnerOrAdmin } from "../middleware/isOwnerOrAdmin.middleware";

const route = Router();

// get user by id
route.get("/:id", authenticateToken, getUserByIdController);

// delete user
route.delete("/:id", authenticateToken, isOwnerOrAdmin, deleteUserController);

// search specific user by username
route.get(
  "/:username",
  authenticateToken,
  findUsersByUsernameController
);
export { route };
