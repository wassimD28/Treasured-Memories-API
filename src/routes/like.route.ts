import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken.middleware";
import { putLikeToMemory, removeLikeFromMemory } from "../controllers/like.controller";

export const route = Router();

// putting like to a memory
route.post('/:id',authenticateToken, putLikeToMemory)

// removing like from a memory
route.delete("/:id", authenticateToken, removeLikeFromMemory);