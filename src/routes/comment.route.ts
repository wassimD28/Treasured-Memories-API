import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken.middleware";
import {
  addCommentController,
  deleteCommentController,
  getCommentsOfMemoryController,
  updateCommentController,
} from "../controllers/comment.controller";
import { isOwner } from "../middleware/isOwner.middleware";
import { isOwnerOrModerator } from "../middleware/isOwnerOrModerator.middleware";
import { setEntityRequest } from "../middleware/setEntityReq.middleware";
import { ModelTypeName } from "../Enums/common.enum";

export const route = Router();

// get all comments for specified memory via memory_id

route.get(
  "/:id",
  authenticateToken,
  getCommentsOfMemoryController
);
// add comment to specified memory
route.post("/:id", authenticateToken, addCommentController);
// update comment of specified memory
route.put(
  "/:id",
  authenticateToken,
  setEntityRequest(ModelTypeName.COMMENT),
  isOwner,
  updateCommentController
);
// delete comment of specified memory
route.delete(
  "/:id",
  authenticateToken,
  setEntityRequest(ModelTypeName.COMMENT),
  isOwnerOrModerator,
  deleteCommentController
);
