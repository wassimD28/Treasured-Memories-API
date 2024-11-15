import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./user.model";

class Album extends Model{
  public id!: number;
  public user_id!: number; // Foreign key to User
  public title!: string;
  public description!: string;
}

Album.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: User,
        key: 'id',
      },
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'albums',
  }
);
export default Album;