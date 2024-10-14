import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import RefreshToken from "../models/refreshToken.model";
import { generateAccessToken, generateRefreshToken } from "../utils/auth.util";
import jwt from "jsonwebtoken";

/**
 * @description user register
 * @route /api/register
 * @method POST
 * @access public
 */

const registerController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    res.status(201).json({
      message: "User registered successfully",
    });
  }
);

/**
 * @description user login
 * @route /api/login
 * @method POST
 * @access public
 */

const loginController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findOne({ where: { username: req.body.username } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (isMatch) {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      await RefreshToken.create({
        user_id: user.id,
        token: refreshToken,
      });
      res.status(200).json({
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            roles: user.roles,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } else {
      res.status(400).json({ message: "Incorrect email or password." });
    }
  }
);

/**
 * @description logout
 * @route /api/logout
 * @method DELETE
 * @access public
 */
const logoutController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;
    // Return if the refresh token is not provided
    if (!refreshToken) {
      res.status(400).json({ message: "No token provided" });
      return;
    }
    // Check if the refresh token exists in the database
    const tokenExists = await RefreshToken.findOne({ where: { token: refreshToken } });

    if (!tokenExists) {
      res
        .status(404)
        .json({ message: "Refresh token not found or already invalidated" });
      return;
    }

    // Deleting the refresh token
    await RefreshToken.destroy({ where: { token: refreshToken } });
    res.json({ message: "Logged out successfully" });
  }
);

/**
 * @description refresh the access token
 * @route /api/token/refresh
 * @method GET
 * @access public
 */
const refreshTokenController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;
    // Return if the refresh token is not provided
    if (!refreshToken) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    // Check if the refresh token exists in the database
    RefreshToken.findOne({ where: { token: refreshToken } }).then((token) => {
      if (!token) {
        res.status(403).json({ message: "Invalid refresh token" });
        return;
      }
      // Check if the refresh token is valid
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string,
        async (err: any, decoded: any) => {
          // Return if the token is invalid or expired
          if (err)
            return res
              .status(403)
              .json({ message: "Invalid or expired token" });
          const user = await User.findOne({ where: { id: decoded.userId } });
          // Return if the token's user is not found
          if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
          }
          // If the user is found, create a new access token for him
          const accessToken = generateAccessToken(user);
          res.json({ accessToken });
        }
      );
    });
  }
);

export {
  loginController,
  registerController,
  logoutController,
  refreshTokenController,
};
