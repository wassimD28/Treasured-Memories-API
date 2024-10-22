import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Memory extends Model {
  public id!: number;
  public title!: string;
  public description!: string | null;
  public images!: string | null;
  public wallImage!: string | null;
  public user_id!: number; // Foreign key to User
  public location_id!: number; // Foreign key to location
  public createdAt!: Date;
  public updatedAt!: Date;
}
Memory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    wallImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    location_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "memories",
  }
);

export default Memory;