import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./user.model";

class Token extends Model {
  public id!: number;
  public token!: string;
  public user_id!: number; // Foreign key to User
}

Token.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // the foreign key
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "tokens",
  }
);


export default Token;
