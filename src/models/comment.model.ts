import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Comment extends Model {
  public id!: number;
  public content!: string;
  public user_id!: number; // Foreign key to User
  public memory_id!: number; // Foreign key to Memory
  public createdAt!: Date;
  public updatedAt!: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      allowNull: false,
    },
    memory_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: "Memories",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "comments",
  }
);

export default Comment;
