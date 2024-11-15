import Comment from "./comment.model";
import Follower from "./follower.model";
import Like from "./like.model";
import Location from "./location.model";
import Memory from "./memory.model";
import Notification from "./notification.model";
import Profile from "./profile.model";
import RefreshToken from "./refreshToken.model";
import User from "./user.model";

export default function setupAssociations() {
  // User
  User.hasMany(RefreshToken, { foreignKey: "user_id" });
  User.hasMany(Memory, { foreignKey: "user_id" });
  User.hasMany(Location, { foreignKey: "user_id" });
  User.hasOne(Profile, { foreignKey: "user_id" });
  User.hasMany(Like, { foreignKey: "user_id" });
  User.hasMany(Comment, { foreignKey: "user_id" });
  User.hasMany(Notification, { foreignKey: "user_id" });
  // Profile
  Profile.belongsTo(User, { foreignKey: "user_id" });
  // location
  Location.hasMany(Memory, { foreignKey: "location_id" });
  // Memory
  Memory.belongsTo(Location, { foreignKey: "location_id" });
  Memory.hasMany(Like, { foreignKey: "memory_id" });
  Memory.hasMany(Comment, { foreignKey: "memory_id" });
  // Like
  Like.belongsTo(User, { foreignKey: "user_id" });
  Like.belongsTo(Memory, { foreignKey: "memory_id" });
  // Comment
  Comment.belongsTo(User, { foreignKey: "user_id" });
  Comment.belongsTo(Memory, { foreignKey: "memory_id" });
  // Notification
  Notification.belongsTo(User, { foreignKey: "user_id" });

  // Follower-following relationship
  User.belongsToMany(User, {
    through: Follower,
    as: "followers", // Users who follow this user
    foreignKey: "followingId",
    otherKey: "followerId",
  });

  User.belongsToMany(User, {
    through: Follower,
    as: "followings", // Users whom this user follows
    foreignKey: "followerId",
    otherKey: "followingId",
  });
}
