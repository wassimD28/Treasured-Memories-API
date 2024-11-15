import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Album from "./album.model";
import Memory from "./memory.model";

class AlbumMemory extends Model {
  public album_id!: number;
  public memory_id!: number;
}

AlbumMemory.init(
  {
    album_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: Album,
        key: "id",
      },
    },
    memory_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: Memory,
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "album_memories",
    timestamps: false, 
  }
);

export default AlbumMemory;
