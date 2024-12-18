import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken.middleware";
import {
  checkLikeController,
  getMemoryByLikeController,
  putLikeToMemory,
  removeLikeFromMemory,
} from "../controllers/like.controller";
import { setEntityRequest } from "../middleware/setEntityReq.middleware";
import { ModelTypeName } from "../Enums/common.enum";
import { isOwner } from "../middleware/isOwner.middleware";

export const route = Router();

// get specific memory by like_id
route.get(
  "/memory/:id",
  authenticateToken,
  getMemoryByLikeController
);

// putting like to a memory
route.post("/:id", authenticateToken, putLikeToMemory);

// removing like from a memory
route.delete("/:id", authenticateToken, removeLikeFromMemory);

// check if specified user already liked a specific memory
route.get(
  "/memory/:memory_id/user/:user_id",
  authenticateToken,
  checkLikeController
);
