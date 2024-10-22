import { body } from "express-validator";
import { LocationPayload } from "../interfaces/common.interface";

const memoryValidation = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .bail()
    .notEmpty()
    .withMessage("Title is required")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long")
    .bail(),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must be at most 500 characters long")
    .bail(),
  body("location")
    .notEmpty()
    .withMessage("Location is required")
    .bail()
    // validate the location payload and ensure it has name, longitude, and latitude properties
    .custom(async (value) => {
      const location: LocationPayload = JSON.parse(value); // decode the location payload
      if (!location.name) {
        throw new Error("Location name is missing");
      } else if (!location.longitude) {
        throw new Error("Location longitude is missing");
      } else if (!location.latitude) {
        throw new Error("Location latitude is missing");
      }
    })
    .bail(),
];

export { memoryValidation };
