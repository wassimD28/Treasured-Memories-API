import { ImageTypeName, ModelWithImage } from "../Enums/common.enum";
import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import Memory from "../models/memory.model";
import {
  multiImageUploader,
  singleImageUploader,
} from "../utils/handleUpload.util";
import path from "path";
import fs from "fs";
import Profile from "../models/profile.model";
// Define interface for request with file
interface MulterRequest extends Request {
  file: Express.Multer.File;
}
/**
 * upload a multiple files to a specific entity and column in the database. The files will be uploaded for the specified entity and id. The column in the URL and in the request body should match.
 * @method POST
 * @route /api/upload/multi/:column/:entity/:id
 * @access public
 */
export const uploadMultiFilesController = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, entity, id } = req.params;

      // Validate required parameters
      if (!name || !entity || !id) {
        res.status(400).json({ message: "Invalid parameters" });
        return;
      }

      const columnName = name;

      // Validate image type
      const imageTypeArray: string[] = Object.values(ImageTypeName);
      if (!imageTypeArray.includes(name)) {
        res.status(400).json({
          message: `Invalid image type. Allowed types: ${imageTypeArray.join(
            ", "
          )}`,
        });
        return;
      }

      // Validate entity type
      const modelTypeArray: string[] = Object.values(ModelWithImage);
      if (!modelTypeArray.includes(entity)) {
        res.status(400).json({
          message: `Invalid entity type. Allowed types: ${modelTypeArray.join(
            ", "
          )}`,
        });
        return;
      }

      // Get the appropriate model
      let modelAttributes;
      let entityRecord;
      switch (entity) {
        case ModelWithImage.MEMORY:
          modelAttributes = Memory.getAttributes();
          entityRecord = await Memory.findByPk(id)
          break;
        case ModelWithImage.PROFILE:
          modelAttributes = Profile.getAttributes();
          entityRecord = await Profile.findByPk(id)
          break;   
        default:
          res.status(400).json({ message: "Invalid entity" });
          return;
      }
      // Validate column exists in model
      if (!(columnName in modelAttributes)) {
        res.status(400).json({
          message: `The entity '${entity}' does not have a column named '${columnName}'`,
        });
        return;
      }

      // Check if entity exists
      if (!entityRecord) {
        res.status(404).json({
          message: `${entity} with id ${id} not found`,
        });
        return;
      }
      // check if the sender is the owner of the entity
      if (!(req.auth?.userId && parseInt(req.auth?.userId) == entityRecord.user_id)){
        res.status(403).json({ message: "You do not have permission to perform this action." });
        return;
      }

      // Configure upload middleware
      const uploadPath = `uploads/${entity}/${id}/${columnName}`;
      const uploadMiddleware = multiImageUploader(uploadPath, columnName, 5);

      // Handle the upload using a Promise wrapper
      await new Promise<void>((resolve, reject) => {
        uploadMiddleware(req, res, async (err) => {
          if (err) {
            res.status(400).json({ message: err.message });
            resolve();
            return;
          }

          if (
            !req.files ||
            !Array.isArray(req.files) ||
            req.files.length === 0
          ) {
            res.status(400).json({ message: "No files uploaded" });
            resolve();
            return;
          }

          try {
            // Save file information to database
            const fileUrls = req.files.map(
              (file) => `${uploadPath}/${file.filename}`
            ) as string[];

            //add the old file to the array
            const oldImagesArray =
              (JSON.parse(
                entityRecord.get(columnName) as string
              ) as string[]) ?? [];

            // Update the entity with the new file paths
            await entityRecord.update({
              [columnName]: [...oldImagesArray, ...fileUrls],
            });

            res.status(200).json({
              message: "Files uploaded successfully",
              files: fileUrls,
            });
            resolve();
          } catch (error) {
            // Clean up uploaded files if database update fails
            req.files.forEach((file) => {
              fs.unlink(file.path, (err: any) => {
                if (err)
                  console.error(`Error deleting file ${file.path}:`, err);
              });
            });

            res.status(500).json({
              message: "Failed to update database with file information",
            });
            resolve();
          }
        });
      });
    } catch (error) {
      next(error); // Pass any unhandled errors to Express error handler
    }
  }
);

/**
 * upload a single file to a specific entity and column in the database. The file will be uploaded for the specified entity and id. The column in the URL and in the request body should match.
 * @method POST
 * @route /api/upload/single/:column/:entity/:id
 * @access public
 */

export const uploadSingleFileController = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, entity, id } = req.params;

      // Validate required parameters
      if (!name || !entity || !id) {
        res.status(400).json({ message: "Invalid parameters" });
        return;
      }

      const columnName = name;

      // Validate image type
      const imageTypeArray: string[] = Object.values(ImageTypeName);
      if (!imageTypeArray.includes(name)) {
        res.status(400).json({
          message: `Invalid image type. Allowed types: ${imageTypeArray.join(
            ", "
          )}`,
        });
        return;
      }

      // Validate entity type
      const modelTypeArray: string[] = Object.values(ModelWithImage);
      if (!modelTypeArray.includes(entity)) {
        res.status(400).json({
          message: `Invalid entity type. Allowed types: ${modelTypeArray.join(
            ", "
          )}`,
        });
        return;
      }

      // Get the appropriate model
      let modelAttributes;
      let entityRecord;
      switch (entity) {
        case ModelWithImage.MEMORY:
          modelAttributes = Memory.getAttributes();
          entityRecord = await Memory.findByPk(id);
          break;
        case ModelWithImage.PROFILE:
          modelAttributes = Profile.getAttributes();
          entityRecord = await Profile.findByPk(id);
          break;
        default:
          res.status(400).json({ message: "Invalid entity" });
          return;
      }
      // Validate column exists in model
      if (!(columnName in modelAttributes)) {
        res.status(400).json({
          message: `The entity '${entity}' does not have a column named '${columnName}'`,
        });
        return;
      }

      // Check if entity exists
      if (!entityRecord) {
        res.status(404).json({
          message: `${entity} with id ${id} not found`,
        });
        return;
      }
      // check if the sender is the owner of the entity
      if (
        !(
          req.auth?.userId && parseInt(req.auth?.userId) == entityRecord.user_id
        )
      ) {
        res
          .status(403)
          .json({
            message: "You do not have permission to perform this action.",
          });
        return;
      }

      // Configure upload middleware
      const uploadPath = `uploads/${entity}/${id}/${columnName}`;
      const uploadMiddleware = singleImageUploader(uploadPath, columnName);

      // Handle the upload using a Promise wrapper
      await new Promise<void>((resolve, reject) => {
        uploadMiddleware(req, res, async (err) => {
          if (err) {
            res.status(400).json({ message: err.message });
            resolve();
            return;
          }

          const multerReq = req as MulterRequest;

          if (!multerReq.file) {
            res.status(400).json({ message: "No file uploaded" });
            resolve();
            return;
          }

          try {
            // Get the file path
            const filePath = `${uploadPath}/${multerReq.file.filename}`;

            // Get the existing file path as string or undefined
            const existingFile = entityRecord.get(columnName) as
              | string
              | undefined;

            // If there's an existing file, delete it
            if (existingFile) {
              const existingFilePath = path.join(process.cwd(), existingFile);
              if (fs.existsSync(existingFilePath)) {
                fs.unlinkSync(existingFilePath);
              }
            }

            // Update the entity with the new file path
            await entityRecord.update({
              [columnName]: filePath,
            });

            res.status(200).json({
              message: "File uploaded successfully",
              file: filePath,
            });
            resolve();
          } catch (error) {
            // Clean up uploaded file if database update fails
            if (multerReq.file) {
              fs.unlink(multerReq.file.path, (err: any) => {
                if (err)
                  console.error(
                    `Error deleting file ${multerReq.file.path}:`,
                    err
                  );
              });
            }

            res.status(500).json({
              message: "Failed to update database with file information",
            });
            resolve();
          }
        });
      });
    } catch (error) {
      next(error);
    }
  }
);
/**
 * upload a new file for a specific entity and replace the old file in the specified column in the same position of the old file (work just on array columns).
 * @method PUT
 * @route /api/upload/specific/:column/:entity/:id
 * @access public
 */
export const replaceSingleFileController = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, entity, id } = req.params;

      // Validate required parameters
      if (!name || !entity || !id) {
        res.status(400).json({ message: "Invalid parameters" });
        return;
      }

      const columnName = name;

      // Validate image type
      const imageTypeArray: string[] = Object.values(ImageTypeName);
      if (!imageTypeArray.includes(name)) {
        res.status(400).json({
          message: `Invalid image type. Allowed types: ${imageTypeArray.join(
            ", "
          )}`,
        });
        return;
      }

      // Validate entity type
      const modelTypeArray: string[] = Object.values(ModelWithImage);
      if (!modelTypeArray.includes(entity)) {
        res.status(400).json({
          message: `Invalid entity type. Allowed types: ${modelTypeArray.join(
            ", "
          )}`,
        });
        return;
      }

      // Get the appropriate model
      let modelAttributes;
      let entityRecord;
      switch (entity) {
        case ModelWithImage.MEMORY:
          modelAttributes = Memory.getAttributes();
          entityRecord = await Memory.findByPk(id);
          break;
        case ModelWithImage.PROFILE:
          modelAttributes = Profile.getAttributes();
          entityRecord = await Profile.findByPk(id);
          break;
        default:
          res.status(400).json({ message: "Invalid entity" });
          return;
      }
      // Validate column exists in model
      if (!(columnName in modelAttributes)) {
        res.status(400).json({
          message: `The entity '${entity}' does not have a column named '${columnName}'`,
        });
        return;
      }

      // Check if entity exists
      if (!entityRecord) {
        res.status(404).json({
          message: `${entity} with id ${id} not found`,
        });
        return;
      }
      // check if the sender is the owner of the entity
      if (
        !(
          req.auth?.userId && parseInt(req.auth?.userId) == entityRecord.user_id
        )
      ) {
        res
          .status(403)
          .json({
            message: "You do not have permission to perform this action.",
          });
        return;
      }
      const existingFiles =
        (JSON.parse(entityRecord.get(columnName) as string) as string[]) ?? [];

      if (!Array.isArray(existingFiles)) {
        res.status(400).json({
          message: "This endpoint is only for multiple image fields",
        });
        return;
      }

      // Configure upload middleware
      const uploadPath = `uploads/${entity}/${id}/${columnName}`;
      const uploadMiddleware = singleImageUploader(uploadPath, "newFile");

      // Handle the upload using a Promise wrapper
      await new Promise<void>((resolve, reject) => {
        uploadMiddleware(req, res, async (err) => {
          if (err) {
            res.status(400).json({ message: err.message });
            resolve();
            return;
          }

          if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            resolve();
            return;
          }

          // Access oldFilename after multer processes the request
          const { oldFilename } = req.body;

          if (!oldFilename) {
            // Clean up the uploaded file
            if (fs.existsSync(req.file.path)) {
              fs.unlinkSync(req.file.path);
            }
            res.status(400).json({ message: "Old filename is required" });
            resolve();
            return;
          }

          const fileIndex = existingFiles.findIndex(
            (file) =>
              path.basename(file) === oldFilename || file === oldFilename
          );

          if (fileIndex === -1) {
            // Clean up the uploaded file
            if (fs.existsSync(req.file.path)) {
              fs.unlinkSync(req.file.path);
            }
            res.status(404).json({
              message: "Original image not found in the collection",
            });
            resolve();
            return;
          }

          try {
            // Delete the old file
            const oldFilePath = path.join(
              process.cwd(),
              existingFiles[fileIndex]
            );
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
            }

            // Create new file path
            const newFilePath = `${uploadPath}/${req.file.filename}`;

            // Update the array with the new file path at the same index
            const updatedFiles = [...existingFiles];
            updatedFiles[fileIndex] = newFilePath;

            // Update the database
            await entityRecord.update({
              [name]: updatedFiles,
            });

            res.status(200).json({
              message: "Image replaced successfully",
              updatedFiles,
            });
            resolve();
          } catch (error) {
            // Clean up the newly uploaded file in case of error
            if (fs.existsSync(req.file.path)) {
              fs.unlinkSync(req.file.path);
            }

            console.error("Error replacing file:", error);
            res.status(500).json({
              message: "Failed to replace image",
              error: error instanceof Error ? error.message : "Unknown error",
            });
            resolve();
          }
        });
      });
    } catch (error) {
      next(error);
    }
  }
);
/**
 * delete a single file or an array of files associated with a specific entity and column. The deletion can be based on a specific file path or an array of file paths depending on the column.
 * @method DELETE
 * @route /api/upload/:column/:entity/:id
 * @access public
 */
export const deleteFileController = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, entity, id } = req.params;

      // Validate required parameters
      if (!name || !entity || !id) {
        res.status(400).json({ message: "Invalid parameters" });
        return;
      }

      const columnName = name;

      // Validate image type
      const imageTypeArray: string[] = Object.values(ImageTypeName);
      if (!imageTypeArray.includes(name)) {
        res.status(400).json({
          message: `Invalid image type. Allowed types: ${imageTypeArray.join(
            ", "
          )}`,
        });
        return;
      }

      // Validate entity type
      const modelTypeArray: string[] = Object.values(ModelWithImage);
      if (!modelTypeArray.includes(entity)) {
        res.status(400).json({
          message: `Invalid entity type. Allowed types: ${modelTypeArray.join(
            ", "
          )}`,
        });
        return;
      }

      // Get the appropriate model
      let modelAttributes;
      let entityRecord;
      switch (entity) {
        case ModelWithImage.MEMORY:
          modelAttributes = Memory.getAttributes();
          entityRecord = await Memory.findByPk(id);
          break;
        case ModelWithImage.PROFILE:
          modelAttributes = Profile.getAttributes();
          entityRecord = await Profile.findByPk(id);
          break;
        default:
          res.status(400).json({ message: "Invalid entity" });
          return;
      }
      // Validate column exists in model
      if (!(columnName in modelAttributes)) {
        res.status(400).json({
          message: `The entity '${entity}' does not have a column named '${columnName}'`,
        });
        return;
      }

      // Check if entity exists
      if (!entityRecord) {
        res.status(404).json({
          message: `${entity} with id ${id} not found`,
        });
        return;
      }
      // check if the sender is the owner of the entity
      if (
        !(
          req.auth?.userId && parseInt(req.auth?.userId) == entityRecord.user_id
        )
      ) {
        res
          .status(403)
          .json({
            message: "You do not have permission to perform this action.",
          });
        return;
      }

      // Get the existing file path
      const existingFile = entityRecord.get(columnName) as
        | string
        | string[]
        | undefined;

      if (!existingFile) {
        res.status(404).json({
          message: "No image found to delete",
        });
        return;
      }

      try {
        // Handle both single and multiple file deletions
        const imageArray = JSON.parse(existingFile as string) as string[];
        if (Array.isArray(imageArray)) {
          // Handle multiple files
          for (const filePath of imageArray) {
            const fullPath = path.join(process.cwd(), filePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          }
          // Update database to remove all files
          await entityRecord.update({
            [columnName]: [],
          });
        } else {
          // Handle single file
          const fullPath = path.join(process.cwd(), existingFile as string);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
          // Update database to remove file path
          await entityRecord.update({
            [columnName]: null,
          });
        }

        res.status(200).json({
          message: "Image(s) deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({
          message: "Failed to delete image(s)",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * delete one file associated with a specific entity and column, particularly when the column stores an array of files.
 * @method DELETE
 * @route /api/upload/specific/:column/:entity/:id
 * @access public
 */
export const deleteSpecificFileController = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, entity, id } = req.params;
      const { filename } = req.body; // Expect the filename to delete
      // Validate required parameters
      if (!name || !entity || !id) {
        res.status(400).json({ message: "Invalid parameters" });
        return;
      }
      if (!filename) {
        res.status(400).json({ message: "Filename is required" });
        return;
      }
      const columnName = name;

      // Validate image type
      const imageTypeArray: string[] = Object.values(ImageTypeName);
      if (!imageTypeArray.includes(name)) {
        res.status(400).json({
          message: `Invalid image type. Allowed types: ${imageTypeArray.join(
            ", "
          )}`,
        });
        return;
      }

      // Validate entity type
      const modelTypeArray: string[] = Object.values(ModelWithImage);
      if (!modelTypeArray.includes(entity)) {
        res.status(400).json({
          message: `Invalid entity type. Allowed types: ${modelTypeArray.join(
            ", "
          )}`,
        });
        return;
      }

      // Get the appropriate model
      let modelAttributes;
      let entityRecord;
      switch (entity) {
        case ModelWithImage.MEMORY:
          modelAttributes = Memory.getAttributes();
          entityRecord = await Memory.findByPk(id);
          break;
        case ModelWithImage.PROFILE:
          modelAttributes = Profile.getAttributes();
          entityRecord = await Profile.findByPk(id);
          break;
        default:
          res.status(400).json({ message: "Invalid entity" });
          return;
      }
      // Validate column exists in model
      if (!(columnName in modelAttributes)) {
        res.status(400).json({
          message: `The entity '${entity}' does not have a column named '${columnName}'`,
        });
        return;
      }

      // Check if entity exists
      if (!entityRecord) {
        res.status(404).json({
          message: `${entity} with id ${id} not found`,
        });
        return;
      }
      // check if the sender is the owner of the entity
      if (
        !(
          req.auth?.userId && parseInt(req.auth?.userId) == entityRecord.user_id
        )
      ) {
        res
          .status(403)
          .json({
            message: "You do not have permission to perform this action.",
          });
        return;
      }

      const existingFiles = JSON.parse(
        entityRecord.get(columnName) as string
      ) as string[];
      console.log(existingFiles);

      if (!Array.isArray(existingFiles)) {
        res.status(400).json({
          message: "This endpoint is only for multiple image fields",
        });
        return;
      }

      const fileIndex = existingFiles.findIndex(
        (file) => path.basename(file) === filename || file === filename
      );

      if (fileIndex === -1) {
        res.status(404).json({
          message: "Image not found in the collection",
        });
        return;
      }

      try {
        // Delete the specific file
        const filePath = existingFiles[fileIndex];
        const fullPath = path.join(process.cwd(), filePath);

        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }

        // Remove the file from the array
        const updatedFiles = [
          ...existingFiles.slice(0, fileIndex),
          ...existingFiles.slice(fileIndex + 1),
        ];

        // Update the database
        await entityRecord.update({
          [name]: updatedFiles,
        });

        res.status(200).json({
          message: "Image deleted successfully",
          remainingFiles: updatedFiles,
        });
      } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({
          message: "Failed to delete image",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } catch (error) {
      next(error);
    }
  }
);
