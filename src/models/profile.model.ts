import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Profile extends Model{
  public id!: number;
  public user_id!: number; // Foreign key to User
  public firstName!: string;
  public lastName!: string;
  public avatarImage!: string;
  public wallImage!: string;
  public address!: string;
  public gender!: string;
  public birthday!: Date;
  public bio!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Profile.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatarImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    wallImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    birthday: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    }
  },
  {
    sequelize,
    tableName: "profiles",
  }
);


export default Profile;