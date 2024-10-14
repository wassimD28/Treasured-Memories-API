import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class RefreshToken extends Model {
  public id!: number;
  public token!: string;
  public expires_at!: Date;
  public user_id!: number; // Foreign key to User
}

RefreshToken.init(
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
    expires_at: {
      type: DataTypes.DATE,
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
    tableName: "refreshTokens",
  }
);


export default RefreshToken;
