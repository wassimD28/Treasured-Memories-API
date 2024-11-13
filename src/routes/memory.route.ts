// memory.route.ts
import { Router } from "express";
import multer from "multer";
import { memoryValidation } from "../validations/memory.validation";
import { handleValidations } from "../middleware/handleValidations.middleware";
import {
  createMemoryController,
  deleteMemoryController,
  getMemoriesController,
  getMemoryByIdController,
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

export { route };
