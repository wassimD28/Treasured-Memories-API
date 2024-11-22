import jwt from "jsonwebtoken";
import User from "../models/user.model";
import dotenv from "dotenv";
import { DecodedToken } from "../interfaces/decodedToken.interface";
dotenv.config();

function generateAccessToken(user: User) {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles,
  };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "30m",
  });
}
function generateRefreshToken(user: User) {
  const payload = { userId: user.id };
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });
}

function verifyToken(token: string): DecodedToken | undefined {
  let pureToken: string = token;
  // check if the token has two parts
  if (token && token.split(" ").length == 2) {
    pureToken = token && token.split(" ")[1]; // Extract token from 'Bearer <token>'
  }  
  let DecodedToken: DecodedToken | undefined
  jwt.verify(
    pureToken,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err, decoded) => {
      if (err){
        console.error("Invalid access token");
        console.error(err);
        return undefined;
      } 
      // return decoded token
      DecodedToken = decoded as DecodedToken;
      console.log("________________________\nDecoded token : "+ JSON.stringify(DecodedToken));
    }
  );
  return DecodedToken;
}

export { generateAccessToken, generateRefreshToken, verifyToken };
