import jwt from "jsonwebtoken";
import User from "../models/user.model";
import dotenv from "dotenv";
dotenv.config();

function generateAccessToken(user: User) {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles,
  };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "15m",
  });
}
function generateRefreshToken(user: User) {
  const payload = { userId: user.id };
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });
}

export { generateAccessToken, generateRefreshToken };
