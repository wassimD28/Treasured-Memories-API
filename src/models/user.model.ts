import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";


class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public roles!: string[];
  public notificationCounter!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roles: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ["USER"], // Default role for a new user
      validate: {
        isIn: {
          args: [["ADMIN", "USER", "MODERATOR"]], // Valid roles
          msg: "Invalid role",
        },
      },
    },
    notificationCounter: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "users",
  }
);

export default User;
