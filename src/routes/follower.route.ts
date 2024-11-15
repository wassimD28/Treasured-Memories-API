import { Router } from "express";
import { setEntityRequest } from "../middleware/setEntityReq.middleware";
import { ModelTypeName } from "../Enums/common.enum";
import { isOwner } from "../middleware/isOwner.middleware";
import { addFollow, removeFollow } from "../controllers/follower.controller";
import { authenticateToken } from "../middleware/authenticateToken.middleware";
export const route = Router();

// follow a specific user via user_id and the id of the being followed
route.post("/:id/:followed_id",
  authenticateToken,
  setEntityRequest(ModelTypeName.USER),
  isOwner,
  addFollow
);
// unfollow a specific user via user_id and the id of the being followed
route.delete("/:id/:followed_id",
  authenticateToken,
  setEntityRequest(ModelTypeName.USER),
  isOwner,
  removeFollow
);