import { Request } from "express";
import expressAsyncHandler from "express-async-handler";
import { ReportType } from "../Enums/common.enum";
import Comment from "../models/comment.model";
import Memory from "../models/memory.model";
import User from "../models/user.model";

export const findSourceByTypeAndId = async(
  reportType: ReportType,
  source_id: number
) => {
  switch (reportType) {
    case ReportType.COMMENT:
      return await Comment.findByPk(source_id);
    case ReportType.MEMORY:
      return await Memory.findByPk(source_id);
    case ReportType.PERSON:
      return await User.findByPk(source_id);
    default:
      throw new Error("Invalid report type");
  }
};
