import { Router } from "express";
import { handleValidations } from "../middleware/handleValidations.middleware";
import {
  deleteUserController,
  getUserByIdController,
} from "../controllers/user.controller";
import { authenticateToken } from "../middleware/authenticateToken.middleware";
import { isOwner } from "../middleware/isOwner.middleware";

const route = Router();

// get user by id
route.get("/:id", authenticateToken, getUserByIdController);

// delete user
route.post("/:id", authenticateToken, isOwner, deleteUserController);

export { route };
