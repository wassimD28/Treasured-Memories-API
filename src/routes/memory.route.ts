// memory.route.ts
import { Router } from "express";
import multer from "multer";
import { memoryValidation } from "../validations/memory.validation";
import { handleValidations } from "../middleware/handleValidations.middleware";
import {
  checkMemoryInAlbumController,
  createMemoryController,
  deleteMemoryController,
  getMemoriesController,
  getMemoryByIdController,
  linkMemoryWithAlbumController,
  unlinkMemoryWithAlbumController,
  updateMemoryController,
} from "../controllers/memory.controller";
import { authenticateToken } from "../middleware/authenticateToken.middleware";
import { setEntityRequest } from "../middleware/setEntityReq.middleware";
import { ModelTypeName } from "../Enums/common.enum";
import { isOwnerOrAdmin } from "../middleware/isOwnerOrAdmin.middleware";
import { isOwner } from "../middleware/isOwner.middleware";

const upload = multer();

const route = Router();

route.post(
  "/",
  authenticateToken,
  upload.none(), // to read form data
  memoryValidation,
  handleValidations,
  createMemoryController
);
// all memories of one user
route.get("/user/:id", getMemoriesController);

// get specific memory of a user
route.get("/:id", getMemoryByIdController);

// update specific memory of a user
route.put(
  "/:id",
  authenticateToken,
  setEntityRequest(ModelTypeName.MEMORY),
  isOwner,
  updateMemoryController
);

// delete specific memory of a user
route.delete(
  "/:id",
  authenticateToken,
  setEntityRequest(ModelTypeName.MEMORY),
  isOwnerOrAdmin,
  deleteMemoryController
);

// link one specific memory with an album via memory_id and album_id
route.post(
  "/:id/album/:album_id",
  authenticateToken,
  setEntityRequest(ModelTypeName.MEMORY),
  isOwner,
  linkMemoryWithAlbumController
);

// unlink one specific memory with an album via memory_id and album_id

route.delete(
  "/:id/album/:album_id",
  authenticateToken,
  setEntityRequest(ModelTypeName.MEMORY),
  isOwner,
  unlinkMemoryWithAlbumController
)

// check if specific memory is linked to specific album
route.get(
  "/:id/album/:album_id",
  authenticateToken,
  setEntityRequest(ModelTypeName.MEMORY),
  isOwner,
  checkMemoryInAlbumController
);



export { route };
