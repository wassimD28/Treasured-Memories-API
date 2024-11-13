import Location from "./location.model";
import Memory from "./memory.model";
import Profile from "./profile.model";
import RefreshToken from "./refreshToken.model";
import User from "./user.model";

export default function setupAssociations() {
  // User
  User.hasMany(RefreshToken, { foreignKey: "user_id" });
  User.hasMany(Memory, { foreignKey: "user_id" });
  User.hasMany(Location, { foreignKey: "user_id" });
  User.hasOne(Profile, { foreignKey: "user_id" });
  // Profile
  Profile.belongsTo(User, { foreignKey: "user_id" });
  // location
  Location.hasMany(Memory, { foreignKey: "location_id" });
  // Memory
  Memory.belongsTo(Location, { foreignKey: "location_id" });
}
