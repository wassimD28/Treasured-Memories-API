import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken.middleware";
import { checkLikeController, putLikeToMemory, removeLikeFromMemory } from "../controllers/like.controller";

export const route = Router();

// putting like to a memory
route.post('/:id',authenticateToken, putLikeToMemory)

// removing like from a memory
route.delete("/:id", authenticateToken, removeLikeFromMemory);

// check if specified user already liked a specific memory
route.get(
  "/memory/:memory_id/user/:user_id",
  authenticateToken,
  checkLikeController
);