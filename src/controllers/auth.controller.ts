import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import RefreshToken from "../models/refreshToken.model";
import { generateAccessToken, generateRefreshToken } from "../utils/auth.util";
import jwt from "jsonwebtoken";
import Profile from "../models/profile.model";
import { Gender } from "../Enums/common.enum";

/**
 * @description user register
 * @route /api/register
 * @method POST
 * @access public
 */

const registerController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    await Profile.create({user_id: user.id, gender: Gender.NOT_SPECIFIED})
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
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });
      res.status(200).json({
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            username: user.username,
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
    const tokenExists = await RefreshToken.findOne({
      where: { token: refreshToken },
    });

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

    if (!refreshToken) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    try {
      // find the refresh token and store it in variable
      const storedToken = await RefreshToken.findOne({
        where: { token: refreshToken },
      });
      // ensure the refresh token is exists in the database
      if (!storedToken) {
        res.status(403).json({ message: "Invalid refresh token" });
        return;
      }

      // Check if the token has expired using the expires_at property
      if (new Date() > storedToken.expires_at) {
        await storedToken.destroy(); // Remove the expired token
        res.status(403).json({ message: "Refresh token has expired" });
        return;
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as { userId: number };
      const user = await User.findOne({ where: { id: decoded.userId } });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Generate new access token
      const accessToken = generateAccessToken(user);

      // Implement token rotation: generate a new refresh token
      const newRefreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: "7d" }
      );

      // Update the stored refresh token
      await storedToken.update({
        token: newRefreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });

      res.json({
        message: "Token refreshed successfully",
        data: {
          user: {
            id: user.id,
            roles: user.roles,
          },
          tokens: {
            accessToken,
            refreshToken: newRefreshToken,
          },
        },
      });
    } catch (error) {
      console.error("Error during token refresh:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export {
  loginController,
  registerController,
  logoutController,
  refreshTokenController,
};
