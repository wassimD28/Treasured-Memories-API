import { NextFunction, Request, Response } from "express";
import multer from "multer";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not found ${req.originalUrl}`);
  res.status(404);
  next(error);
};
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message });
  next();
};


export { errorHandler, notFound };
