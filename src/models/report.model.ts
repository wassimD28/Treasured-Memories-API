import { DataTypes, Model } from "sequelize";
import { ReportReason, ReportType } from "../Enums/common.enum";
import sequelize from "../config/database";
import User from "./user.model";

class Report extends Model {
  public id!: number;
  public author_id!: number; // Foreign key to User
  public source_id!: number; // Foreign key to what being reported ( comment or memory or person )
  public reason!: ReportReason;
  public description!: string;
  public reportType!: ReportType;
  public createdAt!: Date;
}

Report.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    author_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: User, 
        key: "id",
      },
    },
    source_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    reason: {
      type: DataTypes.ENUM,
      values: Object.values(ReportReason),
      allowNull: false,
      validate: {
        isIn: [Object.values(ReportReason)],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reportType: {
      type: DataTypes.ENUM,
      values: Object.values(ReportType),
      allowNull: false,
      validate: {
        isIn: [Object.values(ReportType)],
      },
    },
  },
  {
    sequelize,
    tableName: "reports",
    timestamps: true,
    updatedAt: false,
  }
);

export default Report;
