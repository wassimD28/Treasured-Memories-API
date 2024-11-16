import { body } from "express-validator";
import { ReportReason, ReportType } from "../Enums/common.enum";
import { findSourceByTypeAndId } from "../utils/findSource.util";

const reportValidation = [
  body("reason")
    .notEmpty()
    .withMessage("Reason is required")
    .bail()
    .isIn(Object.values(ReportReason))
    .withMessage(
      `Reason must be one of the following: ${Object.values(ReportReason).join(
        ", "
      )}`
    )
    .bail(),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must be at most 500 characters long")
    .bail(),
  body("reportType")
    .notEmpty()
    .withMessage("Report type is required")
    .bail()
    .isIn(Object.values(ReportType))
    .withMessage(
      `Report type must be one of the following: ${Object.values(
        ReportType
      ).join(", ")}`
    ),
  body("source_id")
    .notEmpty()
    .withMessage("Source ID is required")
    .bail()
    .isInt()
    .withMessage("Source ID must be a valid integer")
    .bail()
    .custom(async (source_id, { req }) => {
      const reportType : ReportType = req.body.reportType;
      const sourceExists = await findSourceByTypeAndId(reportType, source_id as number);

      if (!sourceExists) {
        throw new Error(`Source with ID ${source_id} and type ${reportType} does not exist`);
      }

      return true;
    }),
];

export { reportValidation };
