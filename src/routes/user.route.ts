import { Router } from "express";
import {
  deleteUserController,
  findUsersController,
  getAllUsersController,
  getUserByIdController,
  promoteToModeratorController,
} from "../controllers/user.controller";
import { authenticateToken } from "../middleware/authenticateToken.middleware";
import { isOwnerOrAdmin } from "../middleware/isOwnerOrAdmin.middleware";
import { isAdmin } from "../middleware/isAdmin.middleware";

const route = Router();

// get user by id
route.get("/:id", authenticateToken, getUserByIdController);

// delete user
route.delete("/:id", authenticateToken, isOwnerOrAdmin, deleteUserController);

// search specific user by name or @username ( find with username if the params starts with @ )
route.get("/search/:input", authenticateToken, findUsersController);

// get all users in specific limit
route.get("/all/:limit", authenticateToken, isAdmin, getAllUsersController);

// promote specific user to moderator
route.post(
  "/promote/:id",
  authenticateToken,
  isAdmin,
  promoteToModeratorController
);

// demote specific moderator to moderator
export { route };
