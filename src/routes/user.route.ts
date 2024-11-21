import { Router } from "express";
import {
  deleteUserController,
  findUsersController,
  getUserByIdController,
} from "../controllers/user.controller";
import { authenticateToken } from "../middleware/authenticateToken.middleware";
import { isOwnerOrAdmin } from "../middleware/isOwnerOrAdmin.middleware";

const route = Router();

// get user by id
route.get("/:id", authenticateToken, getUserByIdController);

// delete user
route.delete("/:id", authenticateToken, isOwnerOrAdmin, deleteUserController);

// search specific user by name or @username ( find with username if the params starts with @ )
route.get(
  "/search/:input",
  authenticateToken,
  findUsersController
);
export { route };
