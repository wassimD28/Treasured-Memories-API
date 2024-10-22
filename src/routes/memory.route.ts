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
import { setEntityRequest } from "../middleware/setEnityReq.meddleware";
import { ModelTypeName } from "../Enums/common.enum";
import { isEntityOwner } from "../middleware/isEnitityOwner.middleware";

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
  isEntityOwner,
  updateMemoryController
);

// delete specific memory of a user
route.delete(
  "/:id",
  authenticateToken,
  setEntityRequest(ModelTypeName.MEMORY),
  isEntityOwner,
  deleteMemoryController
);

export { route };
