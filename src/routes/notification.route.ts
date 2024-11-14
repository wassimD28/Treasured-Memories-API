import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken.middleware";
import {
  getNotificationController,
  getUnreadNotificationController,
  readAllNotificationController,
  readNotificationController,
} from "../controllers/notification.controller";
import { setEntityRequest } from "../middleware/setEntityReq.middleware";
import { ModelTypeName } from "../Enums/common.enum";
import { isOwner } from "../middleware/isOwner.middleware";

export const route = Router();

// get all unread notifications of a specific user
route.get(
  "/unread/:id",
  authenticateToken,
  setEntityRequest(ModelTypeName.USER),
  isOwner,
  getUnreadNotificationController
);
// get all notifications of a specified user
route.get(
  "/:id",
  authenticateToken,
  setEntityRequest(ModelTypeName.USER),
  isOwner,
  getNotificationController
);
// mark single specified notification as read via notification id.
route.put(
  "/:id",
  authenticateToken,
  setEntityRequest(ModelTypeName.NOTIFICATION),
  isOwner,
  readNotificationController
);
// mark all notifications of a specified user as read via user id.
route.put(
  "/all/:id",
  authenticateToken,
  setEntityRequest(ModelTypeName.USER),
  isOwner,
  readAllNotificationController
);
