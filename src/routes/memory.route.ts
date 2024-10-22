// memory.route.ts
import {Router } from "express";
import multer from "multer";
import { memoryValidation } from "../validations/memory.validation";
import { handleValidations } from "../middleware/handleValidations.middleware";
import { createMemoryController } from "../controllers/memory.controller";
import { authenticateToken } from "../middleware/authenticateToken.middleware";



const upload = multer();

const route = Router();

route.post(
  "/",
  authenticateToken,
  upload.none(),
  memoryValidation,
  handleValidations,
  createMemoryController
);

export { route };