import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken.middleware";
import { setEntityRequest } from "../middleware/setEntityReq.middleware";
import { ModelTypeName } from "../Enums/common.enum";
import { isOwnerOrAdmin } from "../middleware/isOwnerOrAdmin.middleware";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/profile.controller";

const route = Router();

// get user profile
route.get(
  "/:id",
  authenticateToken,
  getUserProfile
);

// update user profile
route.put(
  "/:id",
  authenticateToken,
  setEntityRequest(ModelTypeName.PROFILE),
  isOwnerOrAdmin,
  updateUserProfile
);

export { route };
