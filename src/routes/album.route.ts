import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken.middleware";
import { setEntityRequest } from "../middleware/setEntityReq.middleware";
import { ModelTypeName } from "../Enums/common.enum";
import { isOwner } from "../middleware/isOwner.middleware";
import {
  createAlbumController,
  deleteAlbumController,
  getAllAlbumController,
  getSingleAlbumController,
  updateAlbumController,
} from "../controllers/album.controller";
export const route = Router();

// get all albums via user id
route.get(
  "/all/:id",
  authenticateToken,
  setEntityRequest(ModelTypeName.USER),
  isOwner,
  getAllAlbumController
);

// get specific album of a user via album id

route.get(
  "/single/:id",
  authenticateToken,
  setEntityRequest(ModelTypeName.ALBUM),
  isOwner,
  getSingleAlbumController
);

// create new album for a user via user id

route.post(
  "/:id",
  authenticateToken,
  setEntityRequest(ModelTypeName.USER),
  isOwner,
  createAlbumController
);

// update album for a user via album id

route.put(
  "/:id",
  authenticateToken,
  setEntityRequest(ModelTypeName.ALBUM),
  isOwner,
  updateAlbumController
);

// delete specific album of a user via album id

route.delete(
  "/:id",
  authenticateToken,
  setEntityRequest(ModelTypeName.ALBUM),
  isOwner,
  deleteAlbumController
);
