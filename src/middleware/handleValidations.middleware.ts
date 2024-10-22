import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

const handleValidations = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array({onlyFirstError: true})[0]});
    return;
  }
  
  next();
};

export { handleValidations };
