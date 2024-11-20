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

// name : to determine if it is singular file or multiple files , exp: images, wallImage, avatarImage ...
// entity : to determine which entity the file belongs to
// id : to determine which entity id the file belongs to

// Add multiple images
route.post(
  "/multi/:name/:entity/:id",
  authenticateToken,
  uploadMultiFilesController
);
// Add single image
route.post(
  "/single/:name/:entity/:id",
  authenticateToken,
  uploadSingleFileController
);

// Replace single image within an array of images
route.put(
  "/specific/:name/:entity/:id",
  authenticateToken,
  replaceSingleFileController
);

// Delete the image or the entire array of image depending on the name parameter
route.delete("/:name/:entity/:id", authenticateToken, deleteFileController);

// Delete a specific image within an array of images
route.delete(
  "/specific/:name/:entity/:id",
  authenticateToken,
  deleteSpecificFileController
);

export { route };
