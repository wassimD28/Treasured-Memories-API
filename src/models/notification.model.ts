import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { NotificationTapeName } from "../Enums/common.enum";

class Notification extends Model {
  public id!: number;
  public user_id!: number; // Foreign key to User that will receive the notification
  public interactor_id!: number; // Foreign key to interactor who petted like or comment for example
  public source_id!: number; // Foreign key to source according to type
  public type!: NotificationTapeName; // Type of notification (e.g. "new_follower", "like", "comment")
  public isRead!: boolean; // Whether the notification is read
  public CreatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: false,
    },
    interactor_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: false,
    },
    source_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM, 
      allowNull: false,
      values: ["NEW_FOLLOWER", "LIKE", "COMMENT"],
      validate: {
        isIn: [["NEW_FOLLOWER", "LIKE", "COMMENT"]],
      },
    },
    isRead:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
  },
  {
    timestamps: true,
    updatedAt: false,
    sequelize,
    tableName: "notifications",
  }
);
export default Notification;