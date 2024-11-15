import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./user.model";

class Follower extends Model {
  public followerId!: number; // ID of the follower
  public followingId!: number; // ID of the user being followed
  public createdAt!: Date;
}

Follower.init(
  {
    followerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: User,
        key: "id",
      },
      allowNull: false,
    },
    followingId: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: User,
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    timestamps: true,
    updatedAt: false,
    sequelize,
    tableName: "followers",
  }
);

export default Follower;
