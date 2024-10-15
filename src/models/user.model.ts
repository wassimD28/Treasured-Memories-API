import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Token from "./refreshToken.model";

class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public roles!: string[];
  public createdAt!: Date;
  public updatedAt!: Date;

  static associate() {
    User.hasMany(Token, { foreignKey: "user_id" });
  }
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
      type: DataTypes.ARRAY(DataTypes.STRING), // Store roles as an array of strings
      allowNull: false,
      defaultValue: ["USER"], // Default role for a new user
      validate: {
        isIn: {
          args: [["ADMIN", "USER", "MODERATOR"]], // Valid roles
          msg: "Invalid role",
        },
      },
    },
  },
  {
    sequelize,
    tableName: "users",
  }
);

// Call the associate method
User.associate();

export default User;
