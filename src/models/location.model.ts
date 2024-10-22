import { Model,DataTypes } from "sequelize";
import sequelize from "../config/database";
import Memory from "./memory.model";
class Location extends Model {
  public id!: number;
  public name!: string;
  public longitude!: string;
  public latitude!: string;
  public user_id!: number; // foreign key to user
  public createdAt!: Date;
  public updatedAt!: Date;

  static associate() {
    Location.hasMany(Memory, { foreignKey: "location_id" });
  }
}

Location.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    longitude: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    latitude: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      }
    }
  },{
    sequelize,
    tableName: "locations"
  });

  export default Location;