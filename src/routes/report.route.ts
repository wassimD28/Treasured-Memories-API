import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken.middleware";
import { isAdmin } from "../middleware/isAdmin.middleware";
import {
  createReportController,
  deleteReportController,
  getAllReportsController,
} from "../controllers/report.controller";
import { handleValidations } from "../middleware/handleValidations.middleware";
import { reportValidation } from "../validations/report.validation";
import { setEntityRequest } from "../middleware/setEntityReq.middleware";
import { ModelTypeName } from "../Enums/common.enum";
import { isOwner } from "../middleware/isOwner.middleware";
export const route = Router();

// get all reports
route.get("/all", authenticateToken, isAdmin, getAllReportsController);

// create report via source_id (id for what will be reported)
route.post(
  "/:id",
  authenticateToken,
  setEntityRequest(ModelTypeName.USER),
  isOwner,
  reportValidation,
  handleValidations,
  createReportController
);

// delete report via report_id
route.delete("/:id", authenticateToken, isAdmin, deleteReportController);
