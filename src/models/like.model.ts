import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Like extends Model{
  public id!: number;
  public user_id!: number; // Foreign key to User
  public memory_id!: number; // Foreign key to Memory
  public createdAt!: Date;
  public updatedAt!: Date;
}

Like.init(
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
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      allowNull: false,
    },
    memory_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: "memories",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      allowNull: false,
    },
  },
  {
    timestamps:true,
    updatedAt: false,
    sequelize,
    tableName: "likes",
  }
);

export default Like;