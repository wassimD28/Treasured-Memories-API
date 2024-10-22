import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken.middleware";
import {
  deleteFileController,
  deleteSpecificFileController,
  replaceSingleFileController,
  uploadMultiFilesController,
  uploadSingleFileController,
} from "../controllers/upload.controller";

const route = Router();

// column : to determine if it is singular file or multiple files , exp: images, wallImage, avatarImage ...
// entity : to determine which entity the file belongs to
// id : to determine which entity id the file belongs to

// Add multiple images
route.post(
  "/multi/:column/:entity/:id",
  authenticateToken,
  uploadMultiFilesController
);
// Add single image
route.post(
  "/single/:column/:entity/:id",
  authenticateToken,
  uploadSingleFileController
);

// Replace single image within an array of images
route.put(
  "/specific/:column/:entity/:id",
  authenticateToken,
  replaceSingleFileController
);

// Delete the image or the entire array of image depending on the column parameter
route.delete("/:column/:entity/:id", authenticateToken, deleteFileController);

// Delete a specific image within an array of images
route.delete(
  "/specific/:column/:entity/:id",
  authenticateToken,
  deleteSpecificFileController
);

export { route };
