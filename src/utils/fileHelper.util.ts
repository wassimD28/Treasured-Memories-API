// src/utils/fileHelper.util.ts
import { Request } from "express";

const fs = require("fs");


const cleanupUploadedFiles = (req: Request) => {
  if (!req.files) return;

  Object.values(req.files).forEach(fileArray => {
      fileArray.forEach((file : Express.Multer.File) => {
          if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
          }
      });
  })
};

export{

  cleanupUploadedFiles,
}