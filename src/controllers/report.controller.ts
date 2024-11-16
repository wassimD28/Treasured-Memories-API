import expressAsyncHandler from "express-async-handler";
import Report from "../models/report.model";
import User from "../models/user.model";
import { Request, Response } from "express";
import { ApiResponse } from "../interfaces/common.interface";

/**
 * Returns all reports in descending order by creation date.
 * @method GET
 * @route /api/reports/
 * @access protected
 */

export const getAllReportsController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const reports = await Report.findAll({
      order: [["createdAt", "ASC"]], // Order by 'createdAt' column in ascending order
    });
    const response: ApiResponse = {
      success: true,
      message: "Reports retrieved successfully",
      data: reports,
    };
    res.status(200).json(response);
  }
);

/**
 * create new report and validate if the request sender is the authenticated user via :id param.
 * @method POST
 * @route /api/reports/:id
 * @access protected
 */
export const createReportController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user_id = req.auth?.userId;
    const { source_id, description, reason, reportType } = req.body;
    let response: ApiResponse;

    // check if the report is already exists
    const reportExists = await Report.findOne({
      where: {
        author_id: user_id,
        source_id: source_id,
        reason: reason,
        reportType: reportType,
      },
    });
    if (reportExists) {
      response = {
        success: false,
        message: "Report already exists.",
      };
      res.status(409).json(response);
      return;
    }

    // create report
    await Report.create({
      author_id: user_id,
      source_id: source_id,
      description: description,
      reason: reason,
      reportType: reportType,
    });
    // return success response
    response = {
      success: true,
      message: "Report created successfully",
    };
    res.status(201).json(response);
  }
);

/**
 * delete a report via report id.
 * @method DELETE
 * @route /api/reports/:id
 * @access protected
 */

export const deleteReportController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const report_id = req.params.id;
    let response: ApiResponse;
    // check if report exists
    const reportExists = await Report.findByPk(report_id);
    if (!reportExists) {
      response = {
        success: false,
        message: "Report not found.",
      };
      res.status(404).json(response);
      return;
    }
    // delete report
    await reportExists.destroy();
    // return success response
    response = {
      success: true,
      message: "Report deleted successfully",
    };
    res.status(200).json(response);
  }
);
