import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

// Function to create upload middleware
export const multiImageUploader = (uploadDir: string, fieldName: string, maxCount: number) => {
  // Create nested uploads directory if it doesn't exist
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Error creating directory:', error);
  }

  // Multer storage configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Sanitize original filename to remove special characters
      //const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
      const uniqueSuffix = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueSuffix);
    },
  });

  // File filter for image types
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const allowedFileTypes = /jpeg|jpg|png/;
    const extname = allowedFileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, JPG, and PNG are allowed."));
    }
  };

  // Create multer upload instance
  const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
    fileFilter,
  });

  // Return middleware that wraps multer's array upload
  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Handle Multer-specific errors
        return res.status(400).json({
          message: err.code === 'LIMIT_FILE_SIZE' 
            ? 'File size is too large. Maximum size is 5MB'
            : err.message
        });
      } else if (err) {
        // Handle other errors
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};


// Function to create single file upload middleware
export const singleImageUploader = (uploadDir: string, fieldName: string) => {
  // Create nested uploads directory if it doesn't exist
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Error creating directory:', error);
  }

  // Multer storage configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Sanitize original filename to remove special characters
      //const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
      const uniqueSuffix = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueSuffix);
    },
  });

  // File filter for image types
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const allowedFileTypes = /jpeg|jpg|png/;
    const extname = allowedFileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, JPG, and PNG are allowed."));
    }
  };

  // Create multer upload instance
  const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
    fileFilter,
  });

  // Return middleware that wraps multer's single upload
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Handle Multer-specific errors
        return res.status(400).json({
          message: err.code === 'LIMIT_FILE_SIZE' 
            ? 'File size is too large. Maximum size is 5MB'
            : err.message
        });
      } else if (err) {
        // Handle other errors
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};